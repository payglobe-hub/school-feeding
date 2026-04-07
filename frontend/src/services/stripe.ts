import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// You'll need to replace this with your actual Stripe publishable key
export const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY_HERE');

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface DonationDetails {
  amount: number;
  currency: string;
  donationType: 'one-time' | 'monthly' | 'annual';
  donorEmail?: string;
  donorName?: string;
  paymentMethod: string;
}

// Create a payment intent on the server
export const createPaymentIntent = async (donationDetails: DonationDetails): Promise<PaymentIntent> => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: donationDetails.amount,
        currency: donationDetails.currency || 'ghs', // Ghana Cedis
        donationType: donationDetails.donationType,
        donorEmail: donationDetails.donorEmail,
        donorName: donationDetails.donorName,
        paymentMethod: donationDetails.paymentMethod,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    const paymentIntent = await response.json();
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Confirm payment on the client side
export const confirmPayment = async (clientSecret: string, paymentMethodId: string): Promise<any> => {
  const stripe = await stripePromise;
  
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  try {
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId,
    });

    if (error) {
      throw error;
    }

    return paymentIntent;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

// Create recurring subscription (for monthly/annual donations)
export const createSubscription = async (donationDetails: DonationDetails): Promise<any> => {
  try {
    const response = await fetch('/api/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: donationDetails.amount,
        currency: donationDetails.currency || 'ghs',
        donationType: donationDetails.donationType,
        donorEmail: donationDetails.donorEmail,
        donorName: donationDetails.donorName,
        paymentMethod: donationDetails.paymentMethod,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create subscription');
    }

    const subscription = await response.json();
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

// Ghana Mobile Money Payment Integration
export const initiateMobileMoneyPayment = async (donationDetails: DonationDetails): Promise<any> => {
  try {
    const response = await fetch('/api/mobile-money-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: donationDetails.amount,
        currency: donationDetails.currency || 'ghs',
        phoneNumber: donationDetails.paymentMethod, // Mobile money number
        provider: detectMobileMoneyProvider(donationDetails.paymentMethod), // MTN, Vodafone, AirtelTigo
        donorEmail: donationDetails.donorEmail,
        donorName: donationDetails.donorName,
        donationType: donationDetails.donationType,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initiate mobile money payment');
    }

    const payment = await response.json();
    return payment;
  } catch (error) {
    console.error('Error initiating mobile money payment:', error);
    throw error;
  }
};

// Helper function to detect mobile money provider
const detectMobileMoneyProvider = (phoneNumber: string): string => {
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
    '028': 'airteltigo',
  };

  const prefix = phoneNumber.substring(0, 3);
  return prefixes[prefix as keyof typeof prefixes] || 'unknown';
};

// Validate payment amount
export const validateAmount = (amount: number): boolean => {
  return amount >= 1 && amount <= 10000; // Min 1 GHS, Max 10,000 GHS
};

// Format currency for display
export const formatCurrency = (amount: number, currency: string = 'GHS'): string => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
