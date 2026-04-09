'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function SuccessPage() {
  useEffect(() => {
    // Clear session storage after successful payment
    sessionStorage.removeItem('client_secret');
    sessionStorage.removeItem('donation_amount');
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-2xl px-4">
        <div className="card">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You for Your Donation!</h1>
            <p className="text-xl text-gray-600 mb-6">Your donation has been processed successfully.</p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">What Happens Next:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="mr-3">✓</span>
                  <span>We'll send you a confirmation email with receipt details</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">✓</span>
                  <span>Your donation will be used to support our mission</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3">✓</span>
                  <span>We'll keep you updated on the impact of your contribution</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link href="/" className="w-full inline-block btn-primary">
                Back to Home
              </Link>
              <Link href="/about" className="w-full inline-block btn-secondary">
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Make a Greater Impact</h2>
          <p className="text-gray-600 mb-4">Consider making a recurring donation to provide sustained support for our programs.</p>
          <Link href="/donate" className="inline-block btn-primary">
            Make Another Donation
          </Link>
        </div>
      </div>
    </div>
  );
}
