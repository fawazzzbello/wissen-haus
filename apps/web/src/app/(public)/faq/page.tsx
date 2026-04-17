'use client';

import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';

interface PageContent {
  [key: string]: string;
}

const defaultFAQs = [
  {
    question: 'What is Wissen-Haus?',
    answer: 'Wissen-Haus is a youth-focused non-profit organization dedicated to empowering young people through knowledge transfer, skills development, and mentorship programs.',
  },
  {
    question: 'Who can benefit from your programs?',
    answer: 'Our programs are designed for young people of all backgrounds aged 13-30. We welcome anyone passionate about personal growth and making a difference in their community.',
  },
  {
    question: 'How much does it cost to participate?',
    answer: 'Most of our programs are free or low-cost. We believe quality education and development should be accessible to everyone regardless of financial status.',
  },
  {
    question: 'How can I donate?',
    answer: 'You can make a secure donation through our website using your credit card or bank transfer. All donations are tax-deductible and directly support our programs.',
  },
  {
    question: 'Can I volunteer with Wissen-Haus?',
    answer: 'Absolutely! We\'re always looking for passionate volunteers and mentors. Please contact us to learn about opportunities.',
  },
  {
    question: 'What programs do you offer?',
    answer: 'We offer skills development workshops, leadership training, mentorship programs, career counseling, and personal development coaching tailored to individual goals.',
  },
  {
    question: 'How are donations used?',
    answer: 'Donations directly support program delivery, mentor training, educational materials, and scholarships. We maintain transparent financial practices and publish annual reports.',
  },
  {
    question: 'Is my donation secure?',
    answer: 'Yes! We use Stripe to securely process payments. We never store credit card information and maintain industry-standard security practices.',
  },
];

export default function FAQPage() {
  const [content, setContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchContent();
    const interval = setInterval(fetchContent, 5000);
    return () => clearInterval(interval);
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
          <h1 className="text-5xl font-bold mb-6">{content.faq_title || 'Frequently Asked Questions'}</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            {content.faq_subtitle || 'Find answers to common questions about Wissen-Haus and our programs'}
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {defaultFAQs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-green-600">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                >
                  <h3 className="font-semibold text-gray-900 text-lg text-left">
                    {content[`faq${index + 1}_question`] || faq.question}
                  </h3>
                  <span
                    className={`text-3xl text-green-600 flex-shrink-0 ml-4 transition-transform duration-300 ${
                      openIndex === index ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>

                {openIndex === index && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed">
                      {content[`faq${index + 1}_answer`] || faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional Help Section */}
          <div className="mt-16 p-8 bg-gradient-to-r from-green-50 to-red-50 rounded-2xl border-2 border-green-600">
            <div className="flex items-start gap-4">
              <span className="text-4xl flex-shrink-0">💬</span>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {content.faq_support_title || 'Still have questions?'}
                </h3>
                <p className="text-gray-700 mb-4">
                  {content.faq_support_description || 'We\'re here to help! Reach out to our support team and we\'ll get back to you as soon as possible.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={`mailto:${content.contact_email || 'hello@wissen-haus.org'}`}
                    className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-300"
                  >
                    📧 Email Us
                  </a>
                  <a
                    href="/contact"
                    className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors duration-300"
                  >
                    📞 Contact Form
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16 px-4 mt-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of young people transforming their lives through our programs.
          </p>
          <a href="/donate" className="px-8 py-3 bg-gradient-to-r from-green-600 to-red-600 text-white font-bold rounded-lg hover:shadow-lg transition-all duration-300">
            💝 Support Our Mission
          </a>
        </div>
      </section>
    </div>
  );
}
