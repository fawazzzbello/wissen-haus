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
      // Fallback to static content if API fails
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

  // Fallback content if sections not loaded
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

  const containerClass = section.sectionType === 'body' ? 'bg-gray-50' : '';

  return (
    <section style={sectionStyle} className={`py-12 md:py-16 ${containerClass}`}>
      <div className="container max-w-6xl mx-auto px-4">
        {/* Hero Section */}
        {section.sectionType === 'hero' && (
          <div className="min-h-96 flex items-center justify-center">
            <div className="max-w-4xl text-center">
              {section.imageUrl && (
                <img
                  src={section.imageUrl}
                  alt={section.title}
                  className="w-full max-h-64 object-cover rounded-lg mb-8"
                />
              )}
              {section.title && <h1 className="text-4xl md:text-5xl font-bold mb-6">{section.title}</h1>}
              {section.subtitle && <h2 className="text-xl md:text-2xl mb-6 opacity-90">{section.subtitle}</h2>}
              {section.description && <p className="text-lg mb-8 opacity-80">{section.description}</p>}
              {section.htmlContent && (
                <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
              )}
              {section.buttonText && section.buttonUrl && (
                <Link href={section.buttonUrl} className="btn-primary inline-block">
                  {section.buttonText}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Header Section */}
        {section.sectionType === 'header' && (
          <div className="max-w-3xl mx-auto text-center">
            {section.imageUrl && (
              <img
                src={section.imageUrl}
                alt={section.title}
                className="w-full max-h-48 object-cover rounded-lg mb-8"
              />
            )}
            {section.title && <h2 className="text-3xl md:text-4xl font-bold mb-6">{section.title}</h2>}
            {section.subtitle && <h3 className="text-lg md:text-xl mb-6 opacity-90">{section.subtitle}</h3>}
            {section.description && <p className="text-lg mb-8 opacity-80">{section.description}</p>}
            {section.htmlContent && (
              <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
            )}
            {section.buttonText && section.buttonUrl && (
              <Link href={section.buttonUrl} className="btn-primary inline-block">
                {section.buttonText}
              </Link>
            )}
          </div>
        )}

        {/* Body Section */}
        {section.sectionType === 'body' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {section.imageUrl && (
                <img
                  src={section.imageUrl}
                  alt={section.title}
                  className="w-full rounded-lg shadow-lg"
                />
              )}
              <div>
                {section.title && <h2 className="text-3xl font-bold mb-4">{section.title}</h2>}
                {section.subtitle && <h3 className="text-xl font-semibold mb-4 opacity-90">{section.subtitle}</h3>}
                {section.description && <p className="text-lg mb-6 opacity-80">{section.description}</p>}
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
          </div>
        )}

        {/* CTA Section */}
        {section.sectionType === 'cta' && (
          <div className="max-w-3xl mx-auto text-center py-12">
            {section.imageUrl && (
              <img
                src={section.imageUrl}
                alt={section.title}
                className="w-full max-h-48 object-cover rounded-lg mb-8"
              />
            )}
            {section.title && <h2 className="text-3xl md:text-4xl font-bold mb-6">{section.title}</h2>}
            {section.subtitle && <h3 className="text-xl md:text-2xl mb-6 opacity-90">{section.subtitle}</h3>}
            {section.description && <p className="text-lg mb-8 opacity-80">{section.description}</p>}
            {section.htmlContent && (
              <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
            )}
            {section.buttonText && section.buttonUrl && (
              <Link
                href={section.buttonUrl}
                className="btn-primary inline-block"
                style={{
                  backgroundColor: section.backgroundColor ? 'white' : undefined,
                  color: section.backgroundColor ? section.backgroundColor : undefined,
                }}
              >
                {section.buttonText}
              </Link>
            )}
          </div>
        )}

        {/* Footer Section */}
        {section.sectionType === 'footer' && (
          <div className="max-w-3xl mx-auto text-center">
            {section.imageUrl && (
              <img
                src={section.imageUrl}
                alt={section.title}
                className="w-full max-h-48 object-cover rounded-lg mb-8"
              />
            )}
            {section.title && <h2 className="text-3xl font-bold mb-6">{section.title}</h2>}
            {section.subtitle && <h3 className="text-xl mb-6 opacity-90">{section.subtitle}</h3>}
            {section.description && <p className="text-lg mb-8 opacity-80">{section.description}</p>}
            {section.htmlContent && (
              <div className="prose prose-lg max-w-none mb-8" dangerouslySetInnerHTML={{ __html: section.htmlContent }} />
            )}
            {section.buttonText && section.buttonUrl && (
              <Link href={section.buttonUrl} className="btn-primary inline-block">
                {section.buttonText}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// Fallback component if sections don't load
function FallbackHome() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Empowering Future Leaders</h1>
          <p className="text-xl mb-8 opacity-90">Educational opportunities for underprivileged youth</p>
          <Link href="/donate" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
            Donate Now
          </Link>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="container max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600">
              To empower young people through access to knowledge, skills development, mentorship, and opportunities that foster personal growth, leadership, and sustainable success.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-xl text-gray-600">
              To see a world where young people are empowered, self-reliant, and equipped to shape their own futures and positively impact their communities.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container max-w-6xl mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Make a Difference Today</h2>
            <p className="text-xl mb-8 opacity-90">
              Your donation helps us continue our mission to empower young people and transform lives.
            </p>
            <Link href="/donate" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
              Donate Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
