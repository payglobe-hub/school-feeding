// Backend API for Ghana Mobile Money Payment Processing
// This would integrate with Ghana mobile money APIs

const axios = require('axios');

// Mobile Money Provider Configurations
const MOBILE_MONEY_PROVIDERS = {
  mtn: {
    name: 'MTN Mobile Money',
    apiUrl: 'https://api.mtn.com/momo/v1',
    apiKey: process.env.MTN_MOMO_API_KEY,
    secretKey: process.env.MTN_MOMO_SECRET_KEY,
    shortCode: '*170#'
  },
  vodafone: {
    name: 'Vodafone Cash',
    apiUrl: 'https://api.vodafone.com/cash/v1',
    apiKey: process.env.VODAFONE_CASH_API_KEY,
    secretKey: process.env.VODAFONE_CASH_SECRET_KEY,
    shortCode: '*110#'
  },
  airteltigo: {
    name: 'AirtelTigo Money',
    apiUrl: 'https://api.airteltigo.com/money/v1',
    apiKey: process.env.AIRTELTIGO_MONEY_API_KEY,
    secretKey: process.env.AIRTELTIGO_MONEY_SECRET_KEY,
    shortCode: '*110#'
  }
};

// Detect mobile money provider from phone number
function detectProvider(phoneNumber) {
  const prefixes = {
    '055': 'mtn',
    '054': 'mtn', 
    '053': 'mtn',
    '059': 'mtn',
    '050': 'vodafone',
    '020': 'vodafone',
    '026': 'airteltigo',
    '027': 'airteltigo',
    '056': 'airteltigo',
    '057': 'airteltigo',
    '028': 'airteltigo'
  };

  const prefix = phoneNumber.substring(0, 3);
  return prefixes[prefix] || 'unknown';
}

// Initiate mobile money payment
exports.initiateMobileMoneyPayment = async (req, res) => {
  try {
    const { amount, currency = 'ghs', phoneNumber, donorEmail, donorName, donationType } = req.body;

    // Validate input
    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid donation amount' });
    }

    if (!phoneNumber || phoneNumber.length !== 10) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    // Detect provider
    const providerId = detectProvider(phoneNumber);
    const provider = MOBILE_MONEY_PROVIDERS[providerId];

    if (!provider || providerId === 'unknown') {
      return res.status(400).json({ error: 'Unsupported mobile money provider' });
    }

    // Generate unique payment ID
    const paymentId = `GSFP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment request
    const paymentRequest = {
      paymentId,
      amount,
      currency,
      phoneNumber,
      donorEmail,
      donorName,
      donationType,
      provider: providerId,
      status: 'initiated',
      createdAt: new Date()
    };

    // Save payment record
    await saveMobileMoneyPayment(paymentRequest);

    // Initiate payment with provider API
    const providerResponse = await initiateProviderPayment(provider, {
      paymentId,
      amount,
      phoneNumber,
      description: `Ghana School Feeding - ${donationType} donation`,
      callbackUrl: `${process.env.BASE_URL}/api/mobile-money-callback`
    });

    // Update payment record with provider response
    await updateMobileMoneyPayment(paymentId, {
      providerTransactionId: providerResponse.transactionId,
      status: 'awaiting_otp',
      providerResponse: providerResponse
    });

    res.json({
      paymentId,
      amount,
      currency,
      provider: providerId,
      providerName: provider.name,
      status: 'awaiting_otp',
      message: 'Please check your phone for OTP code'
    });

  } catch (error) {
    console.error('Error initiating mobile money payment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Confirm mobile money payment with OTP
exports.confirmMobileMoneyPayment = async (req, res) => {
  try {
    const { paymentId, otpCode } = req.body;

    // Validate input
    if (!paymentId || !otpCode || otpCode.length !== 6) {
      return res.status(400).json({ error: 'Invalid OTP code' });
    }

    // Get payment record
    const payment = await getMobileMoneyPayment(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'awaiting_otp') {
      return res.status(400).json({ error: 'Payment is not awaiting OTP confirmation' });
    }

    // Get provider details
    const provider = MOBILE_MONEY_PROVIDERS[payment.provider];
    if (!provider) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Confirm payment with provider
    const providerResponse = await confirmProviderPayment(provider, {
      transactionId: payment.providerTransactionId,
      otpCode
    });

    if (providerResponse.status === 'success') {
      // Update payment record as successful
      await updateMobileMoneyPayment(paymentId, {
        status: 'confirmed',
        confirmedAt: new Date(),
        providerResponse: providerResponse
      });

      // Send receipt email
      await sendDonationReceipt({
        ...payment,
        status: 'confirmed',
        confirmedAt: new Date()
      });

      res.json({
        paymentId,
        status: 'confirmed',
        message: 'Payment successful'
      });

    } else {
      // Update payment record as failed
      await updateMobileMoneyPayment(paymentId, {
        status: 'failed',
        failedAt: new Date(),
        providerResponse: providerResponse,
        error: providerResponse.message || 'Payment failed'
      });

      res.status(400).json({
        error: providerResponse.message || 'Payment failed'
      });
    }

  } catch (error) {
    console.error('Error confirming mobile money payment:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mobile money payment status callback (webhook)
exports.mobileMoneyCallback = async (req, res) => {
  try {
    const { paymentId, status, transactionId, amount } = req.body;

    // Verify webhook signature (important for security)
    const signature = req.headers['x-provider-signature'];
    if (!verifyWebhookSignature(signature, req.body)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    // Update payment status
    await updateMobileMoneyPayment(paymentId, {
      status,
      providerTransactionId: transactionId,
      callbackReceivedAt: new Date()
    });

    if (status === 'success') {
      // Send receipt
      const payment = await getMobileMoneyPayment(paymentId);
      await sendDonationReceipt({
        ...payment,
        status: 'confirmed',
        confirmedAt: new Date()
      });
    }

    res.json({ status: 'received' });

  } catch (error) {
    console.error('Error in mobile money callback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Provider-specific payment initiation
async function initiateProviderPayment(provider, paymentData) {
  // This would integrate with actual provider APIs
  // For now, we'll simulate the response
  
  console.log(`Initiating ${provider.name} payment:`, paymentData);

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Return simulated response
  return {
    transactionId: `TXN_${Date.now()}`,
    status: 'otp_sent',
    message: 'OTP sent to customer phone'
  };
}

// Provider-specific payment confirmation
async function confirmProviderPayment(provider, confirmationData) {
  // This would integrate with actual provider APIs
  console.log(`Confirming ${provider.name} payment:`, confirmationData);

  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simulate successful payment (in real implementation, this would call the actual API)
  if (confirmationData.otpCode === '123456') {
    return {
      status: 'success',
      transactionId: confirmationData.transactionId,
      amount: confirmationData.amount
    };
  } else {
    return {
      status: 'failed',
      message: 'Invalid OTP code'
    };
  }
}

// Database helper functions (implement based on your database)
async function saveMobileMoneyPayment(paymentData) {
  console.log('Saving mobile money payment:', paymentData);
  // Implementation depends on your database choice
}

async function getMobileMoneyPayment(paymentId) {
  console.log('Getting mobile money payment:', paymentId);
  // Implementation depends on your database choice
  return null; // Return actual payment record
}

async function updateMobileMoneyPayment(paymentId, updateData) {
  console.log('Updating mobile money payment:', paymentId, updateData);
  // Implementation depends on your database choice
}

async function sendDonationReceipt(donationData) {
  console.log('Sending donation receipt:', donationData);
  // Implementation would use email service like SendGrid, Nodemailer, etc.
}

function verifyWebhookSignature(signature, payload) {
  // Implementation would verify webhook signature using provider's method
  // This is crucial for security
  return true; // Placeholder - implement actual verification
}
