import HeroSection from '@/components/public/HeroSection';
import ImpactStats from '@/components/public/ImpactStats';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <HeroSection />
      <ImpactStats />

      {/* Mission Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 mb-8">
              To empower young people through access to knowledge, skills development, mentorship, and opportunities that foster personal growth, leadership, and sustainable success.
            </p>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6">Our Vision</h2>
            <p className="text-xl text-gray-600 mb-8">
              To see a world where young people are empowered, self-reliant, and equipped to shape their own futures and positively impact their communities.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-center mb-12">Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card">
              <h3 className="text-primary-600 mb-4">Empowerment</h3>
              <p className="text-gray-600">
                We believe every young person has unlimited potential waiting to be unlocked.
              </p>
            </div>
            <div className="card">
              <h3 className="text-primary-600 mb-4">Growth</h3>
              <p className="text-gray-600">
                We foster continuous learning, personal development, and skill-building.
              </p>
            </div>
            <div className="card">
              <h3 className="text-primary-600 mb-4">Community</h3>
              <p className="text-gray-600">
                We build supportive networks that inspire collective success and shared impact.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-white mb-6">Make a Difference Today</h2>
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
