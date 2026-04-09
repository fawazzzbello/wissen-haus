'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe, Stripe } from '@stripe/stripe-js';

export default function CheckoutPage() {
  const router = useRouter();
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize Stripe
    const initStripe = async () => {
      const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      if (!publishableKey) {
        setError('Stripe configuration is missing');
        setIsLoading(false);
        return;
      }

      try {
        const stripeInstance = await loadStripe(publishableKey);
        setStripe(stripeInstance);

        // Get client secret from session storage
        const secret = sessionStorage.getItem('client_secret');
        if (!secret) {
          setError('Missing payment information. Please start over.');
          setIsLoading(false);
          return;
        }

        setClientSecret(secret);

        // Redirect to Stripe Payment Element page
        // In production, you'd use Stripe Payment Element or hosted checkout
        setIsLoading(false);
      } catch (err) {
        console.error('Stripe initialization error:', err);
        setError('Failed to initialize payment form');
        setIsLoading(false);
      }
    };

    initStripe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 border-4 border-primary-600 border-t-transparent rounded-full spinner"></div>
          <p className="text-gray-600">Loading payment form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full">
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
      <div className="container max-w-2xl">
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Donation</h2>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              🔒 Your payment is secure and processed by Stripe. We never store your credit card information.
            </p>
          </div>

          {/* Stripe Elements will be rendered here */}
          <div id="payment-element" className="mb-6 p-4 border border-gray-300 rounded-lg">
            <p className="text-gray-600">
              Payment form will appear here. This is a placeholder for Stripe Payment Element or Hosted Checkout.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              In production, you would either:
            </p>
            <ul className="text-sm text-gray-500 list-disc list-inside mt-2">
              <li>Use Stripe Payment Element (recommended)</li>
              <li>Use Stripe Hosted Checkout</li>
              <li>Use custom Stripe Elements (Card element)</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              className="w-full btn-primary disabled:opacity-50"
              disabled={!stripe || !clientSecret}
            >
              Complete Payment
            </button>

            <button
              type="button"
              onClick={() => router.push('/donate')}
              className="w-full btn-secondary"
            >
              ← Back to Donation Form
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Client Secret: {clientSecret ? clientSecret.substring(0, 20) + '...' : 'Loading'}
          </p>
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
