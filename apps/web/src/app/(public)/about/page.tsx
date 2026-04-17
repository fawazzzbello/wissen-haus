'use client';

import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';

interface PageContent {
  [key: string]: string;
}

export default function AboutPage() {
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
          <h1 className="text-5xl font-bold mb-6">{content.about_title || 'About Wissen-Haus'}</h1>
          <p className="text-xl opacity-90 max-w-3xl">{content.about_subtitle || 'Empowering young people to reach their full potential and create positive change'}</p>
        </div>
      </section>

      {/* Our Organization */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-gray-900">Our Organization</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {content.about_org_description || 'Wissen-Haus Empowerment Foundation is a youth-focused, non-profit organization committed to empowering young people to reach their full potential. We exist to inspire growth, build capacity, and create pathways that help young individuals develop the confidence, skills, and mindset needed to navigate life.'}
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                {content.about_org_description2 || 'Founded on the belief that every young person has unlimited potential, we work tirelessly to unlock that potential through mentorship, skills development, and community support.'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-8 border-l-4 border-green-600">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🎯</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Mission-Driven</h3>
                    <p className="text-gray-600">Dedicated to transforming lives through education</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">🌍</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Community-Focused</h3>
                    <p className="text-gray-600">Building pathways for sustainable change</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-3xl">💚</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Impact-Oriented</h3>
                    <p className="text-gray-600">Measurable results that transform communities</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-gray-900 text-center">Our Approach</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-t-4 border-green-600">
              <div className="p-8">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Knowledge Transfer</h3>
                <p className="text-gray-600 leading-relaxed">
                  {content.about_approach1 || 'We provide access to quality education and learning resources tailored to individual needs and aspirations.'}
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-t-4 border-red-600">
              <div className="p-8">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Skills Development</h3>
                <p className="text-gray-600 leading-relaxed">
                  {content.about_approach2 || 'Through hands-on training and practical experience, we help young people develop in-demand skills.'}
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border-t-4 border-green-600">
              <div className="p-8">
                <div className="text-5xl mb-4">🤝</div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Mentorship & Support</h3>
                <p className="text-gray-600 leading-relaxed">
                  {content.about_approach3 || 'Our experienced mentors provide guidance, inspiration, and personalized support throughout their journey.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="bg-gradient-to-r from-gray-900 to-slate-800 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-8 mb-4">
                <div className="text-4xl font-bold">{content.about_impact1_value || '10,000+'}</div>
              </div>
              <p className="text-gray-300 text-lg">{content.about_impact1_label || 'Young People Reached'}</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-lg p-8 mb-4">
                <div className="text-4xl font-bold">{content.about_impact2_value || '500+'}</div>
              </div>
              <p className="text-gray-300 text-lg">{content.about_impact2_label || 'Mentors & Volunteers'}</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg p-8 mb-4">
                <div className="text-4xl font-bold">{content.about_impact3_value || '50+'}</div>
              </div>
              <p className="text-gray-300 text-lg">{content.about_impact3_label || 'Skills Programs'}</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-lg p-8 mb-4">
                <div className="text-4xl font-bold">{content.about_impact4_value || '$2.5M+'}</div>
              </div>
              <p className="text-gray-300 text-lg">{content.about_impact4_label || 'Impact Generated'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-gray-900 text-center">Our Core Values</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-50 border-l-4 border-green-600 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🌱 Growth Mindset</h3>
              <p className="text-gray-700 leading-relaxed">
                {content.about_value1 || 'We believe every individual has the potential to grow and achieve their goals with proper support, mentorship, and opportunities.'}
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-600 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">💪 Equity & Access</h3>
              <p className="text-gray-700 leading-relaxed">
                {content.about_value2 || 'We are committed to breaking barriers and ensuring all young people, regardless of background, have equal access to quality education and opportunities.'}
              </p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-600 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🤲 Community Care</h3>
              <p className="text-gray-700 leading-relaxed">
                {content.about_value3 || 'We foster a culture of mutual support, collaboration, and shared responsibility for uplifting one another and our communities.'}
              </p>
            </div>
            <div className="bg-red-50 border-l-4 border-red-600 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">⭐ Excellence</h3>
              <p className="text-gray-700 leading-relaxed">
                {content.about_value4 || 'We strive for excellence in everything we do, delivering high-quality programs and support that create lasting positive change.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-red-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">{content.about_cta_title || 'Join Our Mission'}</h2>
          <p className="text-xl mb-8 opacity-90">
            {content.about_cta_description || 'Help us transform lives and create lasting change in communities. Whether through donations, volunteering, or partnership, your support makes a real difference.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/donate" className="px-8 py-3 bg-white text-green-600 font-bold rounded-lg hover:shadow-lg transition-all duration-300">
              💝 Donate Now
            </a>
            <a href="/contact" className="px-8 py-3 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-red-600 transition-all duration-300">
              Get Involved
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
