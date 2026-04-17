'use client';

import { useEffect, useState } from 'react';
import { getApiClient } from '@/lib/api-client';
import Link from 'next/link';

interface PageContent {
  [key: string]: string;
}

export default function Home() {
  const [content, setContent] = useState<PageContent>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
    // Refresh every 5 seconds to catch admin changes
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

  const heroTitle = content.hero_title || 'Empowering Young People Through Education';
  const heroSubtitle = content.hero_subtitle || 'Building the Future Leaders of Tomorrow';
  const heroDescription = content.hero_description || 'We provide comprehensive education, mentorship, and skills development to underprivileged youth, creating pathways to success and transforming communities.';
  const heroButtonText = content.hero_button_text || '💚 Start Your Journey';

  const missionTitle = content.mission_title || 'Our Mission';
  const missionDescription = content.mission_description || 'To democratize quality education and create sustainable opportunities for underprivileged youth through innovative programs, dedicated mentorship, and community partnerships.';
  const visionTitle = content.vision_title || 'Our Vision';
  const visionDescription = content.vision_description || 'A world where every young person, regardless of background, has access to world-class education and the support to achieve their full potential.';

  const stat1Value = content.stat1_value || '5,000+';
  const stat1Label = content.stat1_label || 'Students Reached';
  const stat2Value = content.stat2_value || '500+';
  const stat2Label = content.stat2_label || 'Active Mentors';
  const stat3Value = content.stat3_value || '95%';
  const stat3Label = content.stat3_label || 'Success Rate';
  const stat4Value = content.stat4_value || '20+';
  const stat4Label = content.stat4_label || 'Communities';

  const program1Title = content.program1_title || 'Academic Excellence';
  const program1Desc = content.program1_desc || 'Personalized tutoring and mentorship in core subjects';
  const program2Title = content.program2_title || 'Skills Development';
  const program2Desc = content.program2_desc || 'Job-ready skills and vocational training';
  const program3Title = content.program3_title || 'Leadership Academy';
  const program3Desc = content.program3_desc || 'Leadership training and personal development';
  const program4Title = content.program4_title || 'Scholarships';
  const program4Desc = content.program4_desc || 'Financial assistance for higher education';
  const program5Title = content.program5_title || 'Mentorship';
  const program5Desc = content.program5_desc || 'One-on-one relationships with professional mentors';
  const program6Title = content.program6_title || 'Alumni Network';
  const program6Desc = content.program6_desc || 'Lifelong support and career advancement';

  const testimonial1Quote = content.testimonial1_quote || 'Wissen-Haus transformed my life. The mentorship helped me get into my dream university.';
  const testimonial1Author = content.testimonial1_author || 'Sarah Johnson';
  const testimonial1Role = content.testimonial1_role || 'Software Engineer';

  const testimonial2Quote = content.testimonial2_quote || 'The programs here are world-class. I gained skills I never thought I could develop.';
  const testimonial2Author = content.testimonial2_author || 'Michael Chen';
  const testimonial2Role = content.testimonial2_role || 'Business Analyst';

  const testimonial3Quote = content.testimonial3_quote || 'This organization builds confident leaders. Incredible support system!';
  const testimonial3Author = content.testimonial3_author || 'Amara Okafor';
  const testimonial3Role = content.testimonial3_role || 'Community Leader';

  const ctaTitle = content.cta_title || 'Make a Real Impact Today';
  const ctaDescription = content.cta_description || 'Your support directly impacts young lives. Join us in creating pathways to success.';
  const ctaButtonText = content.cta_button_text || '💚 Donate Now';

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-red-50 overflow-hidden">
        {/* Animated background shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-4 z-10 text-center">
          <div className="mb-6">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
              ✨ Transforming Lives Through Education
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 via-red-600 to-green-600 bg-clip-text text-transparent">
            {heroTitle}
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-4 font-semibold">
            {heroSubtitle}
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {heroButtonText}
            </Link>
            <Link
              href="#programs"
              className="px-8 py-4 border-2 border-red-600 text-red-600 rounded-lg font-bold text-lg hover:bg-red-50 transition-all duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border-2 border-green-200">
              <div className="text-5xl mb-4">🎯</div>
              <h2 className="text-3xl font-bold text-green-800 mb-4">{missionTitle}</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {missionDescription}
              </p>
            </div>

            {/* Vision */}
            <div className="p-8 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border-2 border-red-200">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-3xl font-bold text-red-800 mb-4">{visionTitle}</h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {visionDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-900 to-red-900 text-white">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { value: stat1Value, label: stat1Label },
              { value: stat2Value, label: stat2Label },
              { value: stat3Value, label: stat3Label },
              { value: stat4Value, label: stat4Label },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-green-300 to-red-300 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-lg text-gray-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Our Programs</h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Comprehensive educational initiatives designed to empower young people
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: program1Title, desc: program1Desc, icon: '📚', color: 'green' },
              { title: program2Title, desc: program2Desc, icon: '💼', color: 'red' },
              { title: program3Title, desc: program3Desc, icon: '🎯', color: 'green' },
              { title: program4Title, desc: program4Desc, icon: '🎓', color: 'red' },
              { title: program5Title, desc: program5Desc, icon: '🤝', color: 'green' },
              { title: program6Title, desc: program6Desc, icon: '⭐', color: 'red' },
            ].map((program, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                  program.color === 'green'
                    ? 'bg-green-50 border-green-200 hover:border-green-400'
                    : 'bg-red-50 border-red-200 hover:border-red-400'
                }`}
              >
                <div className="text-4xl mb-4">{program.icon}</div>
                <h3 className={`text-2xl font-bold mb-3 ${program.color === 'green' ? 'text-green-800' : 'text-red-800'}`}>
                  {program.title}
                </h3>
                <p className="text-gray-700">{program.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">Success Stories</h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Hear from students whose lives have been transformed
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { quote: testimonial1Quote, author: testimonial1Author, role: testimonial1Role, color: 'green' },
              { quote: testimonial2Quote, author: testimonial2Author, role: testimonial2Role, color: 'red' },
              { quote: testimonial3Quote, author: testimonial3Author, role: testimonial3Role, color: 'green' },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-xl border-l-4 bg-gradient-to-br ${
                  testimonial.color === 'green'
                    ? 'border-green-500 from-green-50 to-white'
                    : 'border-red-500 from-red-50 to-white'
                }`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={testimonial.color === 'green' ? 'text-green-500' : 'text-red-500'}>
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 text-lg mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.author}</p>
                  <p className={`text-sm ${testimonial.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-green-600 via-green-700 to-red-600">
        <div className="container mx-auto text-center text-white">
          <h2 className="text-5xl font-bold mb-6">{ctaTitle}</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            {ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/donate"
              className="px-8 py-4 bg-white text-green-700 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              {ctaButtonText}
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all duration-300"
            >
              Get Involved
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">About Us</h3>
              <p className="text-sm">
                Wissen-Haus Empowerment Foundation is dedicated to transforming lives through education.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Programs</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-green-400">Academic Excellence</Link></li>
                <li><Link href="#" className="hover:text-green-400">Skills Development</Link></li>
                <li><Link href="#" className="hover:text-green-400">Leadership</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-green-400">About</Link></li>
                <li><Link href="/contact" className="hover:text-green-400">Contact</Link></li>
                <li><Link href="/donate" className="hover:text-green-400">Donate</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
              <p className="text-sm mb-2">📧 {content.contact_email || 'hello@wissen-haus.org'}</p>
              <p className="text-sm">📱 {content.phone_number || '+1 (555) 123-4567'}</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2026 Wissen-Haus Empowerment Foundation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
