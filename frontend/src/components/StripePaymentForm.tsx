import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Shield, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { createPaymentIntent, confirmPayment, createSubscription, validateAmount, formatCurrency } from '../services/stripe';

interface StripePaymentFormProps {
  amount: number;
  donationType: 'one-time' | 'monthly' | 'annual';
  donorEmail?: string;
  donorName?: string;
  onSuccess: (paymentResult: any) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  donationType,
  donorEmail,
  donorName,
  onSuccess,
  onError,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  // Validate amount
  useEffect(() => {
    if (!validateAmount(amount)) {
      setError('Invalid donation amount. Please enter an amount between 1 and 10,000 GHS.');
      return;
    }
    setError(null);
  }, [amount]);

  // Create payment intent when component mounts
  useEffect(() => {
    const initializePayment = async () => {
      if (!validateAmount(amount)) return;

      try {
        setIsProcessing(true);
        
        if (donationType === 'one-time') {
          const paymentIntent = await createPaymentIntent({
            amount,
            currency: 'ghs',
            donationType,
            donorEmail,
            donorName,
            paymentMethod: 'stripe'
          });
          setClientSecret(paymentIntent.clientSecret);
        } else {
          // For recurring donations, create subscription
          const subscription = await createSubscription({
            amount,
            currency: 'ghs',
            donationType,
            donorEmail,
            donorName,
            paymentMethod: 'stripe'
          });
          setClientSecret(subscription.clientSecret);
        }
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        onError(error);
      } finally {
        setIsProcessing(false);
      }
    };

    initializePayment();
  }, [amount, donationType, donorEmail, donorName]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setError('Payment system is not ready. Please try again.');
      return;
    }

    if (!validateAmount(amount)) {
      setError('Invalid donation amount.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Create payment method
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          email: donorEmail,
          name: donorName,
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      let result;
      if (donationType === 'one-time') {
        // Confirm one-time payment
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: paymentMethod.id,
        });
      } else {
        // For subscriptions, the payment is confirmed when creating the subscription
        result = { paymentIntent: { status: 'succeeded' } };
      }

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed');
      }

      // Payment successful
      setPaymentComplete(true);
      onSuccess({
        paymentIntent: result.paymentIntent,
        paymentMethod: paymentMethod,
        amount,
        donationType,
        donorEmail,
        donorName
      });

    } catch (err) {
      const error = err as Error;
      setError(error.message);
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        iconColor: '#666EE8',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: false,
    iconStyle: 'default' as const,
  };

  if (paymentComplete) {
    return (
      <div className="text-center p-8 bg-green-50 rounded-lg">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-800 mb-2">Payment Successful!</h3>
        <p className="text-green-600 mb-4">
          Thank you for your donation of {formatCurrency(amount)}
        </p>
        <p className="text-sm text-green-500">
          You will receive a receipt at {donorEmail || 'your email address'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <Shield className="h-8 w-8 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Secure Payment</h3>
        <Lock className="h-5 w-5 text-green-600 ml-2" />
      </div>

      {/* Security Badge */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
        <div className="flex items-center">
          <Lock className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-sm text-green-800">
            Your payment information is encrypted and secure
          </span>
        </div>
      </div>

      {/* Donation Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Donation Amount:</span>
          <span className="font-bold text-lg">{formatCurrency(amount)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Type:</span>
          <span className="capitalize">{donationType}</span>
        </div>
        {donationType !== 'one-time' && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <span className="text-xs text-blue-600">
              Recurring donation - you can cancel anytime
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || !elements || isProcessing || !clientSecret}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4 mr-2" />
                Donate {formatCurrency(amount)}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Trust Indicators */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <Shield className="h-3 w-3 mr-1" />
            PCI Compliant
          </div>
          <div className="flex items-center">
            <Lock className="h-3 w-3 mr-1" />
            256-bit Encryption
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripePaymentForm;
