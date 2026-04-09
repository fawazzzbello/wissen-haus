'use client';

import { useState } from 'react';

const faqs = [
  {
    question: 'What is Wissen-Haus?',
    answer:
      'Wissen-Haus is a youth-focused non-profit organization dedicated to empowering young people through knowledge transfer, skills development, and mentorship programs.',
  },
  {
    question: 'Who can benefit from your programs?',
    answer:
      'Our programs are designed for young people of all backgrounds aged 13-30. We welcome anyone passionate about personal growth and making a difference in their community.',
  },
  {
    question: 'How much does it cost to participate?',
    answer:
      'Most of our programs are free or low-cost. We believe quality education and development should be accessible to everyone regardless of financial status.',
  },
  {
    question: 'How can I donate?',
    answer:
      'You can make a secure donation through our website using your credit card or bank transfer. All donations are tax-deductible and directly support our programs.',
  },
  {
    question: 'Can I volunteer with Wissen-Haus?',
    answer:
      'Absolutely! We\'re always looking for passionate volunteers and mentors. Please contact us at info@wissen-haus.org to learn about opportunities.',
  },
  {
    question: 'What programs do you offer?',
    answer:
      'We offer skills development workshops, leadership training, mentorship programs, career counseling, and personal development coaching tailored to individual goals.',
  },
  {
    question: 'How are donations used?',
    answer:
      'Donations directly support program delivery, mentor training, educational materials, and scholarships. We maintain transparent financial practices and publish annual reports.',
  },
  {
    question: 'Is my donation secure?',
    answer:
      'Yes! We use Stripe to securely process payments. We never store credit card information and maintain industry-standard security practices.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl opacity-90">Find answers to common questions about Wissen-Haus</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full text-left flex justify-between items-center py-2"
                >
                  <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                  <span className={`text-2xl transition-transform ${openIndex === index ? 'rotate-45' : ''}`}>
                    +
                  </span>
                </button>

                {openIndex === index && (
                  <div className="mt-4 pt-4 border-t text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-12 card bg-blue-50 border border-blue-200">
            <h3 className="text-lg font-bold text-blue-900 mb-2">Have more questions?</h3>
            <p className="text-blue-800">
              Contact us at{' '}
              <a href="mailto:info@wissen-haus.org" className="font-semibold hover:underline">
                info@wissen-haus.org
              </a>{' '}
              or call us at +1 (555) 123-4567
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
