'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe, Stripe as StripeType } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = ({ clientSecret }: { clientSecret: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError('Payment system not loaded. Please refresh and try again.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || 'Payment failed');
        setIsProcessing(false);
        return;
      }

      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/donate/success`,
        },
      });

      if (confirmError) {
        setError(confirmError.message || 'Payment processing failed');
      } else if (paymentIntent?.status === 'succeeded') {
        router.push('/donate/success');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement options={{ layout: 'tabs' }} />
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'Processing...' : 'Complete Payment'}
        </button>

        <button
          type="button"
          onClick={() => router.push('/donate')}
          className="w-full btn-secondary"
        >
          ← Back to Donation Form
        </button>
      </div>
    </form>
  );
};

export default function CheckoutPage() {
  const router = useRouter();
  const [stripe, setStripe] = useState<StripeType | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const initStripe = async () => {
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        setError('Stripe configuration is missing. Please contact support.');
        setIsLoading(false);
        return;
      }

      try {
        const stripeInstance = await loadStripe(publishableKey);
        if (!stripeInstance) {
          setError('Failed to load Stripe. Please refresh and try again.');
          setIsLoading(false);
          return;
        }

        setStripe(stripeInstance);

        // Get client secret from session storage
        const secret = sessionStorage.getItem('client_secret');
        if (!secret) {
          setError('Missing payment information. Please start over from the donation form.');
          setIsLoading(false);
          return;
        }

        setClientSecret(secret);
        setIsLoading(false);
      } catch (err) {
        console.error('Stripe initialization error:', err);
        setError('Failed to initialize payment system. Please try again.');
        setIsLoading(false);
      }
    };

    initStripe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full px-4">
          <div className="card">
            <h2 className="text-xl font-bold text-red-600 mb-4">Payment Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/donate')}
              className="w-full btn-primary"
            >
              ← Back to Donation Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-2xl px-4">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Donation</h2>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🔒 Your payment is secure and processed by Stripe. We never store your credit card information.
            </p>
          </div>

          {stripe && clientSecret && (
            <Elements stripe={stripe} options={{ clientSecret, appearance: { theme: 'light' } }}>
              <CheckoutForm clientSecret={clientSecret} />
            </Elements>
          )}
        </div>

        <div className="mt-8 card bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Next Steps</h3>
          <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
            <li>Enter your card details</li>
            <li>Complete 3D Secure verification if required</li>
            <li>You'll receive a confirmation email</li>
            <li>Your donation will be processed immediately</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
