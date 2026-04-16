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
    <section style={sectionStyle} className="w-full">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Hero Premium */}
        {section.sectionType === 'hero-premium' && (
          <HeroPremiumSection section={section} />
        )}

        {/* Stats Advanced */}
        {section.sectionType === 'stats-advanced' && (
          <StatsAdvancedSection section={section} />
        )}

        {/* Programs Grid */}
        {section.sectionType === 'programs-grid' && (
          <ProgramsGridSection section={section} />
        )}

        {/* Features List */}
        {section.sectionType === 'features-list' && (
          <FeaturesListSection section={section} />
        )}

        {/* Team Section */}
        {section.sectionType === 'team' && (
          <TeamSection section={section} />
        )}

        {/* Testimonials Carousel */}
        {section.sectionType === 'testimonials-advanced' && (
          <TestimonialsAdvancedSection section={section} />
        )}

        {/* Newsletter */}
        {section.sectionType === 'newsletter' && (
          <NewsletterSection section={section} />
        )}

        {/* FAQ Accordion */}
        {section.sectionType === 'faq-accordion' && (
          <FAQAccordionSection section={section} />
        )}

        {/* Partners */}
        {section.sectionType === 'partners' && (
          <PartnersSection section={section} />
        )}

        {/* Event Highlights */}
        {section.sectionType === 'events' && (
          <EventsSection section={section} />
        )}

        {/* Donation Tiers */}
        {section.sectionType === 'donation-tiers' && (
          <DonationTiersSection section={section} />
        )}

        {/* Timeline */}
        {section.sectionType === 'timeline' && (
          <TimelineSection section={section} />
        )}

        {/* Two Column Advanced */}
        {section.sectionType === 'two-column-advanced' && (
          <TwoColumnAdvancedSection section={section} />
        )}

        {/* CTA Banner */}
        {section.sectionType === 'cta-banner' && (
          <CTABannerSection section={section} />
        )}

        {/* Custom HTML */}
        {section.sectionType === 'custom' && section.htmlContent && (
          <div className="prose prose-lg max-w-none py-12 md:py-20" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
        )}
      </div>
    </section>
  );
}

// Premium Hero with animated stats
function HeroPremiumSection({ section }: SectionProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 md:py-0">
      {/* Background Image */}
      {section.imageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={section.imageUrl}
            alt={section.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
        </div>
      )}
      
      {/* Animated Background Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center text-white px-4">
        {section.title && (
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tighter">
            {section.title}
          </h1>
        )}
        
        {section.subtitle && (
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-8 opacity-95 leading-relaxed">
            {section.subtitle}
          </h2>
        )}
        
        {section.description && (
          <p className="text-lg md:text-xl mb-12 opacity-85 leading-relaxed max-w-2xl mx-auto">
            {section.description}
          </p>
        )}

        {section.htmlContent && (
          <div className="mb-12 text-white/90" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {section.buttonText && section.buttonUrl && (
            <Link
              href={section.buttonUrl}
              className="btn-primary px-10 py-4 text-lg font-bold hover:scale-105 transition-transform shadow-2xl"
            >
              {section.buttonText}
            </Link>
          )}
          <Link
            href="/contact"
            className="px-10 py-4 text-lg font-bold border-2 border-white text-white hover:bg-white/10 transition rounded-lg"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}

// Advanced Stats with animations
function StatsAdvancedSection({ section }: SectionProps) {
  const stats = parseAdvancedStats(section.htmlContent || '');

  return (
    <div className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative z-10">
        {section.title && <h2 className="text-5xl md:text-6xl font-black text-center mb-4">{section.title}</h2>}
        {section.subtitle && <p className="text-xl text-center text-gray-300 mb-16">{section.subtitle}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.length > 0
            ? stats.map((stat, idx) => (
                <div key={idx} className="group relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl opacity-0 group-hover:opacity-100 transition blur"></div>
                  <div className="relative bg-slate-900 rounded-2xl p-8 text-center hover:translate-y-[-4px] transition">
                    <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400 mb-3">
                      {stat.number}
                    </div>
                    <p className="text-lg font-semibold text-gray-300">{stat.label}</p>
                    {stat.description && <p className="text-sm text-gray-400 mt-2">{stat.description}</p>}
                  </div>
                </div>
              ))
            : section.htmlContent && (
                <div className="col-span-full prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
              )}
        </div>
      </div>
    </div>
  );
}

// Programs Grid with hover effects
function ProgramsGridSection({ section }: SectionProps) {
  const programs = parsePrograms(section.htmlContent || '');

  return (
    <div className="py-16 md:py-24">
      {section.title && <h2 className="text-5xl md:text-6xl font-black text-center mb-4">{section.title}</h2>}
      {section.subtitle && <p className="text-xl text-center text-gray-600 mb-16 max-w-2xl mx-auto">{section.subtitle}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {programs.length > 0
          ? programs.map((program, idx) => (
              <div
                key={idx}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:translate-y-[-8px]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-blue-600 opacity-0 group-hover:opacity-5 transition"></div>
                <div className="relative p-8 md:p-10">
                  <div className="text-6xl mb-4 transform group-hover:scale-110 transition duration-300">
                    {program.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{program.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{program.description}</p>
                  {program.link && (
                    <Link href={program.link} className="inline-flex items-center text-primary-600 font-bold hover:gap-2 transition-all">
                      Learn More
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-600 to-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform"></div>
              </div>
            ))
          : section.htmlContent && (
              <div className="col-span-full prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
            )}
      </div>
    </div>
  );
}

// Features List with checkmarks
function FeaturesListSection({ section }: SectionProps) {
  const features = parseFeatures(section.htmlContent || '');

  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          {section.title && <h2 className="text-5xl font-black mb-6 text-gray-900">{section.title}</h2>}
          {section.subtitle && <p className="text-xl text-gray-600 mb-8">{section.subtitle}</p>}
          {section.description && <p className="text-lg text-gray-700 mb-8 leading-relaxed">{section.description}</p>}

          <div className="space-y-4">
            {features.length > 0
              ? features.map((feature, idx) => (
                  <div key={idx} className="flex gap-4 items-start group">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center mt-1 group-hover:scale-110 transition">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{feature.title}</h4>
                      <p className="text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))
              : section.htmlContent && (
                  <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
                )}
          </div>
        </div>

        {section.imageUrl && (
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl opacity-20 blur-xl"></div>
            <img
              src={section.imageUrl}
              alt={section.title}
              className="relative rounded-2xl shadow-2xl object-cover w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Team Section
function TeamSection({ section }: SectionProps) {
  const members = parseTeamMembers(section.htmlContent || '');

  return (
    <div className="py-16 md:py-24">
      {section.title && <h2 className="text-5xl md:text-6xl font-black text-center mb-4">{section.title}</h2>}
      {section.subtitle && <p className="text-xl text-center text-gray-600 mb-16 max-w-2xl mx-auto">{section.subtitle}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {members.length > 0
          ? members.map((member, idx) => (
              <div key={idx} className="group text-center">
                <div className="relative mb-6 overflow-hidden rounded-2xl">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-full aspect-square object-cover group-hover:scale-105 transition duration-300" />
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-primary-400 to-blue-400 flex items-center justify-center text-white text-5xl font-bold">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-primary-600 font-semibold mt-1">{member.role}</p>
                {member.bio && <p className="text-gray-600 text-sm mt-3">{member.bio}</p>}
              </div>
            ))
          : section.htmlContent && (
              <div className="col-span-full prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
            )}
      </div>
    </div>
  );
}

// Advanced Testimonials
function TestimonialsAdvancedSection({ section }: SectionProps) {
  const testimonials = parseTestimonials(section.htmlContent || '');

  return (
    <div className="py-16 md:py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {section.title && <h2 className="text-5xl md:text-6xl font-black text-center mb-16">{section.title}</h2>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.length > 0
            ? testimonials.map((testimonial, idx) => (
                <div key={idx} className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-8 border border-slate-600">
                  <div className="text-yellow-400 text-xl mb-4">★★★★★</div>
                  <p className="text-xl italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                  <div className="flex items-center gap-4">
                    {testimonial.image ? (
                      <img src={testimonial.image} alt={testimonial.author} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
                        {testimonial.author.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-lg">{testimonial.author}</p>
                      <p className="text-sm text-gray-300">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))
            : section.htmlContent && (
                <div className="col-span-full prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
              )}
        </div>
      </div>
    </div>
  );
}

// Newsletter Signup
function NewsletterSection({ section }: SectionProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <div className="py-16 md:py-24 bg-gradient-to-r from-primary-600 to-blue-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {section.title && <h2 className="text-4xl md:text-5xl font-black mb-4">{section.title}</h2>}
        {section.subtitle && <p className="text-xl mb-8 opacity-95">{section.subtitle}</p>}
        {section.description && <p className="text-lg mb-8 opacity-90 leading-relaxed">{section.description}</p>}

        {subscribed ? (
          <div className="bg-white/20 border border-white/40 rounded-lg p-4 text-center">
            <p className="font-bold text-lg">✓ Thank you for subscribing!</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-primary-600 font-bold rounded-lg hover:bg-gray-100 transition"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// FAQ Accordion
function FAQAccordionSection({ section }: SectionProps) {
  const faqs = parseFAQs(section.htmlContent || '');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="py-16 md:py-24">
      {section.title && <h2 className="text-5xl font-black text-center mb-16">{section.title}</h2>}

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.length > 0
          ? faqs.map((faq, idx) => (
              <div key={idx} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-primary-600 transition">
                <button
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left font-bold text-lg text-gray-900 hover:bg-gray-50 transition flex justify-between items-center"
                >
                  {faq.question}
                  <svg
                    className={`w-6 h-6 transform transition ${openIdx === idx ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
                {openIdx === idx && (
                  <div className="px-6 py-4 bg-gray-50 border-t-2 border-gray-200 text-gray-700 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          : section.htmlContent && (
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
            )}
      </div>
    </div>
  );
}

// Partners Section
function PartnersSection({ section }: SectionProps) {
  const partners = parsePartners(section.htmlContent || '');

  return (
    <div className="py-16 md:py-24 bg-gray-50">
      {section.title && <h2 className="text-5xl font-black text-center mb-16">{section.title}</h2>}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
        {partners.length > 0
          ? partners.map((partner, idx) => (
              <div key={idx} className="flex items-center justify-center p-4 bg-white rounded-xl hover:shadow-lg transition">
                {partner.logo ? (
                  <img src={partner.logo} alt={partner.name} className="max-w-full h-16 object-contain" />
                ) : (
                  <p className="font-bold text-gray-700 text-center">{partner.name}</p>
                )}
              </div>
            ))
          : section.htmlContent && (
              <div className="col-span-full prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
            )}
      </div>
    </div>
  );
}

// Events Section
function EventsSection({ section }: SectionProps) {
  const events = parseEvents(section.htmlContent || '');

  return (
    <div className="py-16 md:py-24">
      {section.title && <h2 className="text-5xl font-black text-center mb-16">{section.title}</h2>}

      <div className="space-y-6 max-w-3xl mx-auto">
        {events.length > 0
          ? events.map((event, idx) => (
              <div key={idx} className="flex gap-6 p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl border-l-4 border-primary-600 hover:shadow-lg transition">
                <div className="flex-shrink-0 text-center bg-primary-600 text-white rounded-lg p-4 min-w-max">
                  <p className="text-2xl font-black">{event.day}</p>
                  <p className="font-bold text-sm">{event.month}</p>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                  <p className="text-primary-600 font-semibold mt-1">{event.location}</p>
                  <p className="text-gray-700 mt-2">{event.description}</p>
                </div>
              </div>
            ))
          : section.htmlContent && (
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
            )}
      </div>
    </div>
  );
}

// Donation Tiers
function DonationTiersSection({ section }: SectionProps) {
  const tiers = parseDonationTiers(section.htmlContent || '');

  return (
    <div className="py-16 md:py-24 bg-gradient-to-b from-gray-50 to-white">
      {section.title && <h2 className="text-5xl font-black text-center mb-16">{section.title}</h2>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {tiers.length > 0
          ? tiers.map((tier, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 transition transform hover:scale-105 ${
                  tier.featured
                    ? 'bg-gradient-to-br from-primary-600 to-blue-600 text-white shadow-2xl relative'
                    : 'bg-white border-2 border-gray-200 text-gray-900'
                }`}
              >
                {tier.featured && <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">Most Popular</div>}
                <h3 className="text-3xl font-black mb-2">{tier.name}</h3>
                <p className={`text-4xl font-black mb-4 ${tier.featured ? '' : 'text-primary-600'}`}>${tier.amount}</p>
                <p className={`mb-6 ${tier.featured ? 'opacity-90' : 'text-gray-600'}`}>{tier.description}</p>
                <ul className="space-y-3 mb-8">
                  {tier.benefits.map((benefit, bidx) => (
                    <li key={bidx} className="flex gap-3 items-start">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/donate"
                  className={`block w-full text-center py-3 rounded-lg font-bold transition ${
                    tier.featured ? 'bg-white text-primary-600 hover:bg-gray-100' : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  Donate {tier.amount}
                </Link>
              </div>
            ))
          : section.htmlContent && (
              <div className="col-span-full prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
            )}
      </div>
    </div>
  );
}

// Timeline Section
function TimelineSection({ section }: SectionProps) {
  const events = parseTimeline(section.htmlContent || '');

  return (
    <div className="py-16 md:py-24">
      {section.title && <h2 className="text-5xl font-black text-center mb-16">{section.title}</h2>}

      <div className="max-w-3xl mx-auto">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-600 to-blue-600"></div>

          {/* Events */}
          <div className="space-y-8">
            {events.map((event, idx) => (
              <div key={idx} className={`flex gap-8 ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className="w-1/2">
                  <div className={`${idx % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                    <p className="text-primary-600 font-bold mt-1">{event.year}</p>
                    <p className="text-gray-700 mt-2">{event.description}</p>
                  </div>
                </div>
                <div className="w-auto flex justify-center">
                  <div className="w-4 h-4 rounded-full bg-primary-600 border-4 border-white shadow-lg relative z-10"></div>
                </div>
                <div className="w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Two Column Advanced
function TwoColumnAdvancedSection({ section }: SectionProps) {
  return (
    <div className="py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {section.imageUrl && (
          <div className="order-2 lg:order-1 relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl opacity-20 group-hover:opacity-40 blur-xl transition"></div>
            <img
              src={section.imageUrl}
              alt={section.title}
              className="relative rounded-2xl shadow-2xl w-full object-cover"
            />
          </div>
        )}
        <div className={section.imageUrl ? 'order-1 lg:order-2' : ''}>
          {section.title && <h2 className="text-5xl font-black mb-6">{section.title}</h2>}
          {section.subtitle && <p className="text-2xl font-bold text-primary-600 mb-6">{section.subtitle}</p>}
          {section.description && <p className="text-lg text-gray-700 leading-relaxed mb-8">{section.description}</p>}
          {section.htmlContent && (
            <div className="prose prose-lg mb-8" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
          )}
          {section.buttonText && section.buttonUrl && (
            <Link href={section.buttonUrl} className="btn-primary inline-block px-8 py-4 text-lg font-bold">
              {section.buttonText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// CTA Banner
function CTABannerSection({ section }: SectionProps) {
  return (
    <div className="py-16 md:py-24 relative overflow-hidden">
      {section.imageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={section.imageUrl}
            alt={section.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
        {section.title && <h2 className="text-5xl md:text-6xl font-black mb-6">{section.title}</h2>}
        {section.subtitle && <p className="text-2xl font-bold mb-6">{section.subtitle}</p>}
        {section.description && <p className="text-xl mb-10 opacity-90 leading-relaxed max-w-2xl mx-auto">{section.description}</p>}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {section.buttonText && section.buttonUrl && (
            <Link href={section.buttonUrl} className="btn-primary px-10 py-4 text-lg font-bold hover:scale-105 transition">
              {section.buttonText}
            </Link>
          )}
          <Link href="/contact" className="px-10 py-4 text-lg font-bold border-2 border-white hover:bg-white/20 transition rounded-lg">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

// Parsing functions
function parseAdvancedStats(html: string) {
  try {
    const regex = /<div[^>]*data-stat[^>]*>[\s\S]*?<\/div>/g;
    const matches = html.match(regex) || [];
    return matches.map(match => {
      const numberMatch = match.match(/<span[^>]*data-number[^>]*>([^<]+)<\/span>/);
      const labelMatch = match.match(/<span[^>]*data-label[^>]*>([^<]+)<\/span>/);
      const descMatch = match.match(/<span[^>]*data-description[^>]*>([^<]+)<\/span>/);
      return {
        number: numberMatch ? numberMatch[1] : '0',
        label: labelMatch ? labelMatch[1] : 'Stat',
        description: descMatch ? descMatch[1] : '',
      };
    });
  } catch {
    return [];
  }
}

function parsePrograms(html: string) {
  try {
    const regex = /<div[^>]*data-card[^>]*>[\s\S]*?<\/div>/g;
    const matches = html.match(regex) || [];
    return matches.map(match => ({
      icon: match.match(/<span[^>]*data-icon[^>]*>([^<]+)<\/span>/)?.[1] || '📦',
      title: match.match(/<span[^>]*data-title[^>]*>([^<]+)<\/span>/)?.[1] || 'Program',
      description: match.match(/<span[^>]*data-description[^>]*>([^<]+)<\/span>/)?.[1] || '',
      link: match.match(/<span[^>]*data-link[^>]*href="([^"]+)"/)?.[1] || '',
    }));
  } catch {
    return [];
  }
}

function parseFeatures(html: string) {
  try {
    const regex = /<div[^>]*data-feature[^>]*>[\s\S]*?<\/div>/g;
    const matches = html.match(regex) || [];
    return matches.map(match => ({
      title: match.match(/<span[^>]*data-title[^>]*>([^<]+)<\/span>/)?.[1] || 'Feature',
      description: match.match(/<span[^>]*data-description[^>]*>([^<]+)<\/span>/)?.[1] || '',
    }));
  } catch {
    return [];
  }
}

function parseTeamMembers(html: string) {
  try {
    const regex = /<div[^>]*data-member[^>]*>[\s\S]*?<\/div>/g;
    const matches = html.match(regex) || [];
    return matches.map(match => ({
      name: match.match(/<span[^>]*data-name[^>]*>([^<]+)<\/span>/)?.[1] || 'Team Member',
      role: match.match(/<span[^>]*data-role[^>]*>([^<]+)<\/span>/)?.[1] || 'Role',
      bio: match.match(/<span[^>]*data-bio[^>]*>([^<]+)<\/span>/)?.[1] || '',
      image: match.match(/<img[^>]*src="([^"]+)"/)?.[1] || '',
    }));
  } catch {
    return [];
  }
}

function parseTestimonials(html: string) {
  try {
    const regex = /<div[^>]*data-testimonial[^>]*>[\s\S]*?<\/div>/g;
    const matches = html.match(regex) || [];
    return matches.map(match => ({
      quote: match.match(/<span[^>]*data-quote[^>]*>([^<]+)<\/span>/)?.[1] || 'Great experience',
      author: match.match(/<span[^>]*data-author[^>]*>([^<]+)<\/span>/)?.[1] || 'Anonymous',
      role: match.match(/<span[^>]*data-role[^>]*>([^<]+)<\/span>/)?.[1] || '',
      image: match.match(/<img[^>]*src="([^"]+)"/)?.[1] || '',
    }));
  } catch {
    return [];
  }
}

function parseFAQs(html: string) {
  try {
    const regex = /<div[^>]*data-faq[^>]*>[\s\S]*?<\/div>/g;
    const matches = html.match(regex) || [];
    return matches.map(match => ({
      question: match.match(/<span[^>]*data-question[^>]*>([^<]+)<\/span>/)?.[1] || 'Question?',
      answer: match.match(/<span[^>]*data-answer[^>]*>([^<]+)<\/span>/)?.[1] || 'Answer',
    }));
  } catch {
    return [];
  }
}

function parsePartners(html: string) {
  try {
    const regex = /<div[^>]*data-partner[^>]*>[\s\S]*?<\/div>/g;
    const matches = html.match(regex) || [];
    return matches.map(match => ({
      name: match.match(/<span[^>]*data-name[^>]*>([^<]+)<\/span>/)?.[1] || 'Partner',
      logo: match.match(/<img[^>]*src="([^"]+)"/)?.[1] || '',
    }));
  } catch {
    return [];
  }
}

function parseEvents(html: string) {
  try {
    const regex = /<div[^>]*data-event[^>]*>[\s\S]*?<\/div>/g;
    const matches = html.match(regex) || [];
    return matches.map(match => ({
      title: match.match(/<span[^>]*data-title[^>]*>([^<]+)<\/span>/)?.[1] || 'Event',
      day: match.match(/<span[^>]*data-day[^>]*>([^<]+)<\/span>/)?.[1] || '01',
      month: match.match(/<span[^>]*data-month[^>]*>([^<]+)<\/span>/)?.[1] || 'Jan',
      location: match.match(/<span[^>]*data-location[^>]*>([^<]+)<\/span>/)?.[1] || 'Location',
      description: match.match(/<span[^>]*data-description[^>]*>([^<]+)<\/span>/)?.[1] || '',
    }));
  } catch {
    return [];
  }
}

function parseDonationTiers(html: string) {
  try {
    const regex = /<div[^>]*data-tier[^>]*>[\s\S]*?<\/div>/g;
    const matches = html.match(regex) || [];
    return matches.map(match => ({
      name: match.match(/<span[^>]*data-name[^>]*>([^<]+)<\/span>/)?.[1] || 'Tier',
      amount: match.match(/<span[^>]*data-amount[^>]*>([^<]+)<\/span>/)?.[1] || '0',
      description: match.match(/<span[^>]*data-description[^>]*>([^<]+)<\/span>/)?.[1] || '',
      benefits: Array.from(match.matchAll(/<span[^>]*data-benefit[^>]*>([^<]+)<\/span>/g)).map(m => m[1]),
      featured: match.includes('data-featured'),
    }));
  } catch {
    return [];
  }
}

function parseTimeline(html: string) {
  try {
    const regex = /<div[^>]*data-timeline-event[^>]*>[\s\S]*?<\/div>/g;
    const matches = html.match(regex) || [];
    return matches.map(match => ({
      title: match.match(/<span[^>]*data-title[^>]*>([^<]+)<\/span>/)?.[1] || 'Event',
      year: match.match(/<span[^>]*data-year[^>]*>([^<]+)<\/span>/)?.[1] || '2024',
      description: match.match(/<span[^>]*data-description[^>]*>([^<]+)<\/span>/)?.[1] || '',
    }));
  } catch {
    return [];
  }
}

// Fallback Home Component
function FallbackHome() {
  return (
    <>
      <HeroPremiumSection section={{
        id: '1',
        sectionName: 'hero',
        sectionType: 'hero-premium',
        title: 'Empowering Future Leaders',
        subtitle: 'Building pathways to success for underprivileged youth',
        description: 'Through education, mentorship, and opportunities, we transform lives and create lasting change in our communities.',
        buttonText: '💝 Donate Now',
        buttonUrl: '/donate',
        displayOrder: 1,
        isActive: true,
      }} />

      <StatsAdvancedSection section={{
        id: '2',
        sectionName: 'stats',
        sectionType: 'stats-advanced',
        title: 'Our Impact',
        subtitle: 'Making a difference every day',
        htmlContent: `
          <div data-stat><span data-number>5,000+</span><span data-label>Students Reached</span><span data-description>Across multiple programs</span></div>
          <div data-stat><span data-number>500+</span><span data-label>Active Mentors</span><span data-description>Dedicated professionals</span></div>
          <div data-stat><span data-number>95%</span><span data-label>Success Rate</span><span data-description>Program completion</span></div>
          <div data-stat><span data-number>20+</span><span data-label>Communities</span><span data-description>Across the region</span></div>
        `,
        displayOrder: 2,
        isActive: true,
      }} />

      <ProgramsGridSection section={{
        id: '3',
        sectionName: 'programs',
        sectionType: 'programs-grid',
        title: 'Our Programs',
        subtitle: 'Comprehensive educational initiatives designed to transform lives',
        htmlContent: `
          <div data-card>
            <span data-icon>📚</span>
            <span data-title>Academic Excellence</span>
            <span data-description>Personalized tutoring, mentorship, and academic support programs</span>
          </div>
          <div data-card>
            <span data-icon>💼</span>
            <span data-title>Skills Development</span>
            <span data-description>Job readiness training, vocational skills, and career preparation</span>
          </div>
          <div data-card>
            <span data-icon>🎯</span>
            <span data-title>Leadership Academy</span>
            <span data-description>Leadership training, personal development, and civic engagement</span>
          </div>
        `,
        displayOrder: 3,
        isActive: true,
      }} />

      <NewsletterSection section={{
        id: '4',
        sectionName: 'newsletter',
        sectionType: 'newsletter',
        title: 'Stay Updated',
        subtitle: 'Get the latest news and updates from Wissen-Haus',
        description: 'Subscribe to our newsletter to stay informed about our programs, events, and impact stories.',
        displayOrder: 4,
        isActive: true,
      }} />

      <CTABannerSection section={{
        id: '5',
        sectionName: 'cta',
        sectionType: 'cta-banner',
        title: 'Make a Difference Today',
        subtitle: 'Join us in transforming lives through education and mentorship',
        description: 'Your support enables us to provide quality education, mentorship, and opportunities to young people in our community.',
        buttonText: '💝 Donate Now',
        buttonUrl: '/donate',
        displayOrder: 5,
        isActive: true,
      }} />
    </>
  );
}
