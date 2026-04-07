import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle, AlertCircle, Clock, Shield, Lock } from 'lucide-react';
import { initiateMobileMoneyPayment, validateAmount, formatCurrency } from '../services/stripe';

interface MobileMoneyPaymentProps {
  amount: number;
  donationType: 'one-time' | 'monthly' | 'annual';
  donorEmail?: string;
  donorName?: string;
  onSuccess: (paymentResult: any) => void;
  onError: (error: Error) => void;
  onCancel: () => void;
}

const MobileMoneyPayment: React.FC<MobileMoneyPaymentProps> = ({
  amount,
  donationType,
  donorEmail,
  donorName,
  onSuccess,
  onError,
  onCancel
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [provider, setProvider] = useState<'mtn' | 'vodafone' | 'airteltigo'>('mtn');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'awaiting_otp' | 'confirmed' | 'failed'>('pending');
  const [otpCode, setOtpCode] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);

  // Mobile money provider configurations
  const providers = [
    {
      id: 'mtn',
      name: 'MTN Mobile Money',
      shortCode: '*170#',
      logo: '📱',
      color: 'bg-yellow-500',
      prefixes: ['055', '054', '053', '059']
    },
    {
      id: 'vodafone',
      name: 'Vodafone Cash',
      shortCode: '*110#',
      logo: '📱',
      color: 'bg-red-500',
      prefixes: ['050', '020']
    },
    {
      id: 'airteltigo',
      name: 'AirtelTigo Money',
      shortCode: '*110#',
      logo: '📱',
      color: 'bg-blue-500',
      prefixes: ['026', '027', '056', '057', '028']
    }
  ];

  // Auto-detect provider based on phone number
  useEffect(() => {
    if (phoneNumber.length >= 3) {
      const prefix = phoneNumber.substring(0, 3);
      const detectedProvider = providers.find(p => p.prefixes.includes(prefix));
      if (detectedProvider) {
        setProvider(detectedProvider.id as any);
      }
    }
  }, [phoneNumber]);

  // Validate amount
  useEffect(() => {
    if (!validateAmount(amount)) {
      setError('Invalid donation amount. Please enter an amount between 1 and 10,000 GHS.');
      return;
    }
    setError(null);
  }, [amount]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateAmount(amount)) {
      setError('Invalid donation amount.');
      return;
    }

    if (!phoneNumber || phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const paymentResult = await initiateMobileMoneyPayment({
        amount,
        currency: 'ghs',
        donationType,
        donorEmail,
        donorName,
        paymentMethod: phoneNumber
      });

      setPaymentId(paymentResult.paymentId);
      setPaymentStatus('awaiting_otp');

      // In a real implementation, you would poll the payment status
      // For now, we'll simulate the OTP confirmation
      setTimeout(() => {
        setIsProcessing(false);
      }, 2000);

    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setPaymentStatus('failed');
      onError(error);
      setIsProcessing(false);
    }
  };

  const handleOtpConfirmation = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // In a real implementation, you would verify the OTP with the mobile money provider
      const response = await fetch('/api/confirm-mobile-money-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          otpCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Invalid OTP code. Please try again.');
      }

      const result = await response.json();
      setPaymentStatus('confirmed');
      onSuccess({
        paymentId,
        amount,
        donationType,
        phoneNumber,
        provider,
        donorEmail,
        donorName
      });

    } catch (err) {
      const error = err as Error;
      setError(error.message);
      setPaymentStatus('failed');
      onError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');
    
    // Limit to 10 digits
    return cleaned.slice(0, 10);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const selectedProvider = providers.find(p => p.id === provider);

  if (paymentStatus === 'confirmed') {
    return (
      <div className="text-center p-8 bg-green-50 rounded-lg">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-800 mb-2">Payment Successful!</h3>
        <p className="text-green-600 mb-4">
          Your donation of {formatCurrency(amount)} has been processed
        </p>
        <div className="text-sm text-green-500 space-y-1">
          <p>Payment Method: {selectedProvider?.name}</p>
          <p>Phone Number: {phoneNumber}</p>
          <p>You will receive a confirmation SMS shortly</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'awaiting_otp') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
        <div className="text-center mb-6">
          <Smartphone className="h-12 w-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">Enter OTP Code</h3>
          <p className="text-gray-600 text-sm">
            We've sent a 6-digit code to your phone
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">
              Check your phone for the OTP from {selectedProvider?.name}
            </span>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleOtpConfirmation(); }} className="space-y-4">
          <div>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit OTP"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

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
              disabled={isProcessing}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </>
              ) : (
                'Confirm Payment'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex items-center justify-center mb-6">
        <Smartphone className="h-8 w-8 text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Mobile Money Payment</h3>
        <Shield className="h-5 w-5 text-green-600 ml-2" />
      </div>

      {/* Security Badge */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
        <div className="flex items-center">
          <Lock className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-sm text-green-800">
            Secure mobile money payment with OTP verification
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
        {/* Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Mobile Money Provider
          </label>
          <div className="grid grid-cols-3 gap-2">
            {providers.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProvider(p.id as any)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  provider === p.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{p.logo}</div>
                <div className="text-xs font-medium">{p.name.split(' ')[0]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Phone Number Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="0XX XXX XXXX"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={10}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your 10-digit mobile money number
          </p>
        </div>

        {/* Provider Info */}
        {selectedProvider && (
          <div className={`${selectedProvider.color} bg-opacity-10 rounded-lg p-3`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">{selectedProvider.name}</div>
                <div className="text-xs text-gray-600">Dial {selectedProvider.shortCode} to confirm</div>
              </div>
              <div className="text-2xl">{selectedProvider.logo}</div>
            </div>
          </div>
        )}

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
            disabled={isProcessing || !phoneNumber || phoneNumber.length !== 10}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4 mr-2" />
                Pay {formatCurrency(amount)}
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
            Bank-Level Security
          </div>
          <div className="flex items-center">
            <Lock className="h-3 w-3 mr-1" />
            OTP Protected
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMoneyPayment;
