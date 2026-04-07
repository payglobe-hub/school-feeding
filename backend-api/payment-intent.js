// Backend API for Stripe Payment Intent Creation
// This would be deployed as a serverless function or API endpoint

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'ghs', donationType, donorEmail, donorName } = req.body;

    // Validate input
    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid donation amount' });
    }

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency,
      payment_method_types: ['card'],
      metadata: {
        donation_type: donationType,
        donor_email: donorEmail || '',
        donor_name: donorName || '',
        project: 'ghana-school-feeding'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Store donation record in database (Firebase, MongoDB, etc.)
    // This would be implemented based on your database choice
    await saveDonationRecord({
      paymentIntentId: paymentIntent.id,
      amount,
      currency,
      donationType,
      donorEmail,
      donorName,
      status: 'pending',
      createdAt: new Date()
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount,
      currency,
      status: paymentIntent.status
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createSubscription = async (req, res) => {
  try {
    const { amount, currency = 'ghs', donationType, donorEmail, donorName } = req.body;

    // Validate input
    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid donation amount' });
    }

    // Create product for recurring donation
    const product = await stripe.products.create({
      name: `Ghana School Feeding - ${donationType} Donation`,
      description: `Monthly donation to support Ghana School Feeding Programme`,
      metadata: {
        project: 'ghana-school-feeding',
        donation_type: donationType
      }
    });

    // Create price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      recurring: {
        interval: donationType === 'monthly' ? 'month' : 'year',
      },
    });

    // Create customer
    const customer = await stripe.customers.create({
      email: donorEmail,
      name: donorName,
      metadata: {
        project: 'ghana-school-feeding'
      }
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        price: price.id,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice.payment_intent'],
    });

    // Store subscription record
    await saveSubscriptionRecord({
      subscriptionId: subscription.id,
      customerId: customer.id,
      amount,
      currency,
      donationType,
      donorEmail,
      donorName,
      status: 'pending',
      createdAt: new Date()
    });

    res.json({
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
      amount,
      currency,
      status: subscription.status
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
};

// Helper function to save donation record (implement based on your database)
async function saveDonationRecord(donationData) {
  // Implementation depends on your database choice:
  // - Firebase Firestore
  // - MongoDB
  // - PostgreSQL
  // - etc.
  
  console.log('Saving donation record:', donationData);
  
  // Example for Firebase Firestore:
  // const db = require('./firebase-admin');
  // await db.collection('donations').add(donationData);
  
  // Example for MongoDB:
  // const Donation = require('./models/Donation');
  // const donation = new Donation(donationData);
  // await donation.save();
}

// Helper function to save subscription record
async function saveSubscriptionRecord(subscriptionData) {
  console.log('Saving subscription record:', subscriptionData);
  
  // Similar implementation to saveDonationRecord
}
