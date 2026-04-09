'use client';

import { useState } from 'react';
import DonationForm from '@/components/public/DonationForm';

export default function DonatePage() {
  const [isDonating, setIsDonating] = useState(false);

  return (
    <>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">Make a Donation</h1>
          <p className="text-xl opacity-90">
            Your generosity fuels our mission to empower young people to reach their full potential.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Donation Form */}
            <div>
              <DonationForm />
            </div>

            {/* Impact Information */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your Impact</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-primary-600">$25</p>
                    <p className="text-sm text-gray-600">Provides mentorship sessions for one young person</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600">$100</p>
                    <p className="text-sm text-gray-600">Covers skills workshop materials for 10 participants</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600">$500</p>
                    <p className="text-sm text-gray-600">Funds comprehensive leadership program for a cohort</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600">$1,000</p>
                    <p className="text-sm text-gray-600">Enables a full scholarship for an exceptional youth</p>
                  </div>
                </div>
              </div>

              <div className="card bg-blue-50 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-900 mb-2">💡 Did You Know?</h3>
                <p className="text-sm text-blue-800">
                  100% of your donation supports our programs and initiatives. Our organization is run by passionate volunteers committed to making a difference.
                </p>
              </div>

              <div className="card">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Frequently Asked Questions</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-gray-900">Is my donation secure?</p>
                    <p className="text-gray-600">Yes, we use Stripe to securely process all payments.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Can I get a receipt?</p>
                    <p className="text-gray-600">Yes, you'll receive a receipt via email immediately.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Can I set up recurring donations?</p>
                    <p className="text-gray-600">Monthly donations are coming soon. Email us to discuss options.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
