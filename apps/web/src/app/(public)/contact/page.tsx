'use client';

import { useState, useEffect } from 'react';
import { getApiClient } from '@/lib/api-client';

interface PageContent {
  [key: string]: string;
}

export default function ContactPage() {
  const [content, setContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const api = getApiClient();
      await api.post('/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '', phone: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-5xl font-bold mb-6">{content.contact_title || 'Get In Touch'}</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            {content.contact_subtitle || 'Have questions or want to collaborate? We\'d love to hear from you.'}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Contact Information</h2>
              <div className="space-y-8">
                {/* Email */}
                <div className="flex gap-4">
                  <div className="text-3xl flex-shrink-0">📧</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                    <a
                      href={`mailto:${content.contact_email || 'hello@wissen-haus.org'}`}
                      className="text-green-600 hover:text-green-700 font-semibold break-all"
                    >
                      {content.contact_email || 'hello@wissen-haus.org'}
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="text-3xl flex-shrink-0">📱</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Phone</h3>
                    <a
                      href={`tel:${content.phone_number || '+1 (555) 123-4567'}`}
                      className="text-green-600 hover:text-green-700 font-semibold"
                    >
                      {content.phone_number || '+1 (555) 123-4567'}
                    </a>
                  </div>
                </div>

                {/* Address */}
                <div className="flex gap-4">
                  <div className="text-3xl flex-shrink-0">📍</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Address</h3>
                    <p className="text-gray-600">
                      {content.contact_address || '123 Impact Street, Berlin, Germany 10115'}
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="flex gap-4">
                  <div className="text-3xl flex-shrink-0">🕐</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Hours</h3>
                    <p className="text-gray-600">
                      {content.contact_hours || 'Monday - Friday\n9:00 AM - 6:00 PM CET'}
                    </p>
                  </div>
                </div>

                {/* Social Links */}
                <div className="pt-8 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    {content.social_twitter && (
                      <a href={content.social_twitter} target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition">
                        𝕏
                      </a>
                    )}
                    {content.social_facebook && (
                      <a href={content.social_facebook} target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition">
                        f
                      </a>
                    )}
                    {content.social_linkedin && (
                      <a href={content.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition">
                        in
                      </a>
                    )}
                    {content.social_instagram && (
                      <a href={content.social_instagram} target="_blank" rel="noopener noreferrer" className="text-2xl hover:scale-110 transition">
                        📷
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-green-600">
                <h2 className="text-3xl font-bold mb-8 text-gray-900">Send us a Message</h2>

                {submitted && (
                  <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                    <p className="text-green-700 font-semibold">
                      ✅ Thank you! Your message has been sent successfully. We'll get back to you soon.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                    <p className="text-red-700 font-semibold">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your message here..."
                      required
                      rows={5}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-3 bg-gradient-to-r from-green-600 to-red-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-900">Response Time</h2>
          <p className="text-lg text-gray-600 mb-6">
            {content.contact_response_info || 'We typically respond to all inquiries within 24-48 business hours. For urgent matters, please call us directly at the number above.'}
          </p>
        </div>
      </section>
    </div>
  );
}
