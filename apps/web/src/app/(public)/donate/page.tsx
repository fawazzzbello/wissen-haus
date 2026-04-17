'use client';

import { useState, useEffect } from 'react';
import { getApiClient } from '@/lib/api-client';
import DonationForm from '@/components/public/DonationForm';

interface PageContent {
  [key: string]: string;
}

export default function DonatePage() {
  const [content, setContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const api = getApiClient();
      const response = await api.get('/settings');
      setContent(response.data.settings || {});
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 mb-4 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-red-600 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-6">{content.donate_title || 'Make a Donation'}</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            {content.donate_subtitle || 'Your generosity fuels our mission to empower young people to reach their full potential.'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            {/* Donation Form */}
            <div className="md:col-span-1">
              <DonationForm />
            </div>

            {/* Impact Information */}
            <div className="md:col-span-2 space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Your Impact</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Impact Item 1 */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-600 hover:shadow-xl transition-all duration-300">
                    <div className="text-4xl font-bold text-green-600 mb-2">$25</div>
                    <p className="text-gray-700 font-semibold mb-2">
                      {content.donate_impact1 || 'Mentorship Sessions'}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {content.donate_impact1_desc || 'Provides mentorship sessions for one young person'}
                    </p>
                  </div>

                  {/* Impact Item 2 */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-600 hover:shadow-xl transition-all duration-300">
                    <div className="text-4xl font-bold text-red-600 mb-2">$100</div>
                    <p className="text-gray-700 font-semibold mb-2">
                      {content.donate_impact2 || 'Skills Workshop'}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {content.donate_impact2_desc || 'Covers skills workshop materials for 10 participants'}
                    </p>
                  </div>

                  {/* Impact Item 3 */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-600 hover:shadow-xl transition-all duration-300">
                    <div className="text-4xl font-bold text-green-600 mb-2">$500</div>
                    <p className="text-gray-700 font-semibold mb-2">
                      {content.donate_impact3 || 'Leadership Program'}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {content.donate_impact3_desc || 'Funds comprehensive leadership program for a cohort'}
                    </p>
                  </div>

                  {/* Impact Item 4 */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-600 hover:shadow-xl transition-all duration-300">
                    <div className="text-4xl font-bold text-red-600 mb-2">$1,000</div>
                    <p className="text-gray-700 font-semibold mb-2">
                      {content.donate_impact4 || 'Full Scholarship'}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {content.donate_impact4_desc || 'Enables a full scholarship for an exceptional youth'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transparency Section */}
              <div className="bg-green-50 rounded-xl p-8 border-l-4 border-green-600">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">💡 Why Donate to Wissen-Haus?</h3>
                <p className="text-gray-700 leading-relaxed">
                  {content.donate_why || '100% of your donation supports our programs and initiatives. Our organization is run by passionate volunteers committed to making a real difference in young people\'s lives. Every contribution directly enables educational programs, mentorship, skills development, and life-changing opportunities.'}
                </p>
              </div>

              {/* FAQ Section */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Common Questions</h3>
                <div className="space-y-6">
                  <div>
                    <p className="font-bold text-gray-900 mb-2">🔒 Is my donation secure?</p>
                    <p className="text-gray-600">
                      {content.donate_faq1 || 'Yes, we use Stripe to securely process all payments. Your financial information is never stored on our servers.'}
                    </p>
                  </div>
                  <div className="border-t pt-6">
                    <p className="font-bold text-gray-900 mb-2">📧 Will I receive a receipt?</p>
                    <p className="text-gray-600">
                      {content.donate_faq2 || 'Yes, you\'ll receive a donation receipt via email immediately after your contribution.'}
                    </p>
                  </div>
                  <div className="border-t pt-6">
                    <p className="font-bold text-gray-900 mb-2">🔄 Can I set up recurring donations?</p>
                    <p className="text-gray-600">
                      {content.donate_faq3 || 'Yes, monthly donations are available. Select the recurring option during checkout.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badge Section */}
          <div className="bg-gradient-to-r from-gray-900 to-slate-800 text-white rounded-2xl p-12">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl mb-2">🛡️</div>
                <p className="font-bold mb-1">Secure Payments</p>
                <p className="text-gray-300 text-sm">Powered by Stripe</p>
              </div>
              <div>
                <div className="text-4xl mb-2">✅</div>
                <p className="font-bold mb-1">Tax Deductible</p>
                <p className="text-gray-300 text-sm">501(c)(3) Organization</p>
              </div>
              <div>
                <div className="text-4xl mb-2">🌍</div>
                <p className="font-bold mb-1">Global Impact</p>
                <p className="text-gray-300 text-sm">20+ Communities</p>
              </div>
              <div>
                <div className="text-4xl mb-2">💚</div>
                <p className="font-bold mb-1">Transparent</p>
                <p className="text-gray-300 text-sm">Annual Reports</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Additional CTA */}
      <section className="bg-gray-50 py-16 px-4 mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Other Ways to Help</h2>
          <p className="text-lg text-gray-600 mb-8">
            Can't donate right now? There are many other ways to support our mission.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-300">
              🤝 Volunteer with Us
            </a>
            <a href="/about" className="px-8 py-3 border-2 border-green-600 text-green-600 font-bold rounded-lg hover:bg-green-50 transition-colors duration-300">
              📖 Learn More
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
