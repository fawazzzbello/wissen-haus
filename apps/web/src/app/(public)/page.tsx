'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getApiClient } from '@/lib/api-client';

interface HomepageSection {
  id: string;
  sectionName: string;
  sectionType: string;
  title?: string;
  subtitle?: string;
  description?: string;
  htmlContent?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export default function Home() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const api = getApiClient();
      const response = await api.get('/homepage');
      setSections(response.data.sections || []);
    } catch (error) {
      console.error('Error fetching homepage sections:', error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-8 h-8 mb-2 border-4 border-primary-600 border-t-transparent rounded-full spinner"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    return <FallbackHome />;
  }

  return (
    <>
      {sections.map((section) => (
        <HomepageSectionRenderer key={section.id} section={section} />
      ))}
    </>
  );
}

interface SectionProps {
  section: HomepageSection;
}

function HomepageSectionRenderer({ section }: SectionProps) {
  const sectionStyle: React.CSSProperties = {
    backgroundColor: section.backgroundColor || '#ffffff',
    color: section.textColor || '#000000',
  };

  return (
    <section style={sectionStyle} className="py-12 md:py-20">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Hero Section - Premium */}
        {section.sectionType === 'hero' && (
          <HeroSection section={section} />
        )}

        {/* Header Section */}
        {section.sectionType === 'header' && (
          <HeaderSection section={section} />
        )}

        {/* Body Section - Two Column */}
        {section.sectionType === 'body' && (
          <BodySection section={section} />
        )}

        {/* CTA Section - Call to Action */}
        {section.sectionType === 'cta' && (
          <CTASection section={section} />
        )}

        {/* Impact Stats Section */}
        {section.sectionType === 'stats' && (
          <StatsSection section={section} />
        )}

        {/* Programs/Services Section */}
        {section.sectionType === 'programs' && (
          <ProgramsSection section={section} />
        )}

        {/* Testimonials Section */}
        {section.sectionType === 'testimonials' && (
          <TestimonialsSection section={section} />
        )}

        {/* Footer Section */}
        {section.sectionType === 'footer' && (
          <FooterSection section={section} />
        )}

        {/* Generic HTML Section */}
        {section.sectionType === 'custom' && section.htmlContent && (
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
        )}
      </div>
    </section>
  );
}

function HeroSection({ section }: SectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {section.imageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={section.imageUrl}
            alt={section.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40"></div>
        </div>
      )}
      <div className="relative z-10 max-w-4xl text-center text-white">
        {section.title && <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">{section.title}</h1>}
        {section.subtitle && <h2 className="text-2xl md:text-3xl mb-6 opacity-90">{section.subtitle}</h2>}
        {section.description && <p className="text-lg md:text-xl mb-10 opacity-80 leading-relaxed max-w-2xl mx-auto">{section.description}</p>}
        {section.htmlContent && (
          <div className="mb-10 text-white" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
        )}
        {section.buttonText && section.buttonUrl && (
          <Link href={section.buttonUrl} className="btn-primary inline-block px-8 py-4 text-lg hover:scale-105 transition-transform">
            {section.buttonText}
          </Link>
        )}
      </div>
    </div>
  );
}

function HeaderSection({ section }: SectionProps) {
  return (
    <div className="max-w-4xl mx-auto text-center">
      {section.imageUrl && (
        <img
          src={section.imageUrl}
          alt={section.title}
          className="w-full max-h-80 object-cover rounded-xl mb-8 shadow-lg"
        />
      )}
      {section.title && <h2 className="text-4xl md:text-5xl font-bold mb-6">{section.title}</h2>}
      {section.subtitle && <h3 className="text-xl md:text-2xl mb-6 opacity-75">{section.subtitle}</h3>}
      {section.description && <p className="text-lg mb-8 opacity-80 leading-relaxed">{section.description}</p>}
      {section.htmlContent && (
        <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
      )}
      {section.buttonText && section.buttonUrl && (
        <Link href={section.buttonUrl} className="btn-primary inline-block">
          {section.buttonText}
        </Link>
      )}
    </div>
  );
}

function BodySection({ section }: SectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {section.imageUrl && (
        <div className="order-2 lg:order-1">
          <img
            src={section.imageUrl}
            alt={section.title}
            className="w-full rounded-xl shadow-2xl"
          />
        </div>
      )}
      <div className={section.imageUrl ? 'order-1 lg:order-2' : ''}>
        {section.title && <h2 className="text-4xl font-bold mb-4">{section.title}</h2>}
        {section.subtitle && <h3 className="text-xl font-semibold mb-6 text-primary-600">{section.subtitle}</h3>}
        {section.description && <p className="text-lg mb-6 opacity-80 leading-relaxed">{section.description}</p>}
        {section.htmlContent && (
          <div className="prose prose-lg max-w-none mb-6" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
        )}
        {section.buttonText && section.buttonUrl && (
          <Link href={section.buttonUrl} className="btn-primary inline-block">
            {section.buttonText}
          </Link>
        )}
      </div>
    </div>
  );
}

function StatsSection({ section }: SectionProps) {
  const stats = section.htmlContent ? parseStatsFromHTML(section.htmlContent) : [];

  return (
    <div>
      {section.title && <h2 className="text-4xl font-bold text-center mb-12">{section.title}</h2>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.length > 0 ? stats.map((stat, idx) => (
          <div key={idx} className="text-center p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
            <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">{stat.number}</div>
            <p className="text-lg font-semibold text-gray-800">{stat.label}</p>
          </div>
        )) : (
          <div className="col-span-full prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.htmlContent || '' }} />
        )}
      </div>
    </div>
  );
}

function ProgramsSection({ section }: SectionProps) {
  const programs = section.htmlContent ? parseCardsFromHTML(section.htmlContent) : [];

  return (
    <div>
      {section.title && <h2 className="text-4xl font-bold text-center mb-4">{section.title}</h2>}
      {section.subtitle && <p className="text-xl text-center text-gray-600 mb-12 max-w-2xl mx-auto">{section.subtitle}</p>}

      {programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.map((program, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-8 border-t-4 border-primary-600">
              {program.icon && <div className="text-4xl mb-4">{program.icon}</div>}
              <h3 className="text-2xl font-bold mb-3 text-gray-800">{program.title}</h3>
              <p className="text-gray-600 mb-4">{program.description}</p>
              {program.link && (
                <Link href={program.link} className="text-primary-600 font-semibold hover:underline">
                  Learn More →
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.htmlContent || '' }} />
      )}
    </div>
  );
}

function TestimonialsSection({ section }: SectionProps) {
  const testimonials = section.htmlContent ? parseTestimonialsFromHTML(section.htmlContent) : [];

  return (
    <div>
      {section.title && <h2 className="text-4xl font-bold text-center mb-12">{section.title}</h2>}
      {testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-md">
              <div className="text-yellow-400 mb-4">★★★★★</div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
              <div>
                <p className="font-bold text-gray-900">{testimonial.author}</p>
                <p className="text-sm text-gray-600">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.htmlContent || '' }} />
      )}
    </div>
  );
}

function CTASection({ section }: SectionProps) {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      {section.imageUrl && (
        <img
          src={section.imageUrl}
          alt={section.title}
          className="w-full max-h-96 object-cover rounded-xl mb-8"
        />
      )}
      {section.title && <h2 className="text-4xl md:text-5xl font-bold mb-6">{section.title}</h2>}
      {section.subtitle && <h3 className="text-2xl mb-6 opacity-90">{section.subtitle}</h3>}
      {section.description && <p className="text-xl mb-10 opacity-80 max-w-2xl mx-auto leading-relaxed">{section.description}</p>}
      {section.htmlContent && (
        <div className="mb-10" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
      )}
      {section.buttonText && section.buttonUrl && (
        <Link
          href={section.buttonUrl}
          className="btn-primary inline-block px-10 py-4 text-lg hover:scale-105 transition-transform"
          style={{
            backgroundColor: section.backgroundColor !== '#ffffff' ? section.backgroundColor : undefined,
          }}
        >
          {section.buttonText}
        </Link>
      )}
    </div>
  );
}

function FooterSection({ section }: SectionProps) {
  return (
    <div className="max-w-4xl mx-auto text-center py-8">
      {section.imageUrl && (
        <img
          src={section.imageUrl}
          alt={section.title}
          className="w-32 h-32 mx-auto mb-8 rounded-full"
        />
      )}
      {section.title && <h2 className="text-3xl font-bold mb-4">{section.title}</h2>}
      {section.subtitle && <h3 className="text-lg mb-6 opacity-75">{section.subtitle}</h3>}
      {section.description && <p className="text-lg mb-8 opacity-80">{section.description}</p>}
      {section.htmlContent && (
        <div className="prose prose-sm max-w-none mb-8" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
      )}
      {section.buttonText && section.buttonUrl && (
        <Link href={section.buttonUrl} className="btn-secondary inline-block">
          {section.buttonText}
        </Link>
      )}
    </div>
  );
}

// Helper functions to parse structured data from HTML
function parseStatsFromHTML(html: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const statElements = doc.querySelectorAll('[data-stat]');

    if (statElements.length === 0) return [];

    return Array.from(statElements).map(el => ({
      number: el.querySelector('[data-number]')?.textContent || '0',
      label: el.querySelector('[data-label]')?.textContent || 'Stat',
    }));
  } catch {
    return [];
  }
}

function parseCardsFromHTML(html: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const cards = doc.querySelectorAll('[data-card]');

    if (cards.length === 0) return [];

    return Array.from(cards).map(card => ({
      icon: card.querySelector('[data-icon]')?.textContent || '',
      title: card.querySelector('[data-title]')?.textContent || 'Program',
      description: card.querySelector('[data-description]')?.textContent || '',
      link: card.querySelector('[data-link]')?.getAttribute('href') || '',
    }));
  } catch {
    return [];
  }
}

function parseTestimonialsFromHTML(html: string) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const testimonials = doc.querySelectorAll('[data-testimonial]');

    if (testimonials.length === 0) return [];

    return Array.from(testimonials).map(testimonial => ({
      quote: testimonial.querySelector('[data-quote]')?.textContent || '',
      author: testimonial.querySelector('[data-author]')?.textContent || 'Anonymous',
      role: testimonial.querySelector('[data-role]')?.textContent || '',
    }));
  } catch {
    return [];
  }
}

// Fallback Home Component
function FallbackHome() {
  return (
    <>
      {/* Premium Hero */}
      <section className="min-h-screen bg-gradient-to-r from-slate-900 via-primary-900 to-slate-900 text-white flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        <div className="relative z-10 max-w-4xl text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">Empowering Future Leaders</h1>
          <p className="text-xl md:text-2xl mb-4 opacity-90">Building pathways to success for underprivileged youth</p>
          <p className="text-lg mb-12 opacity-80 max-w-2xl mx-auto">Through education, mentorship, and opportunities, we transform lives and create lasting change in our communities.</p>
          <Link href="/donate" className="btn-primary inline-block px-10 py-4 text-lg hover:scale-105 transition-transform bg-white text-primary-600">
            💝 Donate Now
          </Link>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            To empower young people through access to quality education, skills development, mentorship, and opportunities that foster personal growth, leadership, and sustainable success.
          </p>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-20 bg-gradient-to-r from-primary-50 to-blue-50">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: '5,000+', label: 'Students Reached' },
              { number: '500+', label: 'Active Mentors' },
              { number: '95%', label: 'Success Rate' },
              { number: '20+', label: 'Communities' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-8 bg-white rounded-xl shadow-lg">
                <div className="text-5xl font-bold text-primary-600 mb-2">{stat.number}</div>
                <p className="text-lg font-semibold text-gray-700">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4">Our Programs</h2>
          <p className="text-xl text-center text-gray-600 mb-16 max-w-2xl mx-auto">Comprehensive educational initiatives designed to transform lives</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📚', title: 'Academic Excellence', description: 'Personalized tutoring and mentorship programs' },
              { icon: '💼', title: 'Skills Development', description: 'Job readiness and vocational training' },
              { icon: '🎯', title: 'Leadership Academy', description: 'Leadership training and personal development' }
            ].map((program, idx) => (
              <div key={idx} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-primary-600">
                <div className="text-5xl mb-4">{program.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{program.title}</h3>
                <p className="text-gray-700">{program.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl mb-12 opacity-90 leading-relaxed">Your support can transform the life of a young person. Together, we're creating opportunities and building futures.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/donate" className="btn-primary bg-white text-primary-600 hover:bg-gray-100 px-8 py-4">
              💝 Donate Now
            </Link>
            <Link href="/contact" className="btn-secondary border-2 border-white text-white hover:bg-white/10 px-8 py-4">
              Get Involved
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
