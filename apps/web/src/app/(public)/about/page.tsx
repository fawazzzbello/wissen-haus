'use client';

export const metadata = {
  title: 'About Us - Wissen-Haus',
  description: 'Learn about the Wissen-Haus Empowerment Foundation and our mission to empower young people.',
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container">
          <h1 className="text-4xl font-bold mb-4">About Wissen-Haus</h1>
          <p className="text-xl opacity-90">
            Empowering young people to reach their full potential and create positive change
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Organization</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Wissen-Haus Empowerment Foundation is a youth-focused, non-profit organization committed to empowering young people to reach their full potential. We exist to inspire growth, build capacity, and create pathways that help young individuals develop the confidence, skills, and mindset needed to navigate life and contribute meaningfully to society.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Founded on the belief that every young person has unlimited potential, we work tirelessly to unlock that potential through mentorship, skills development, and community support.
              </p>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">Our Approach</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="card">
                  <div className="text-4xl mb-4">📚</div>
                  <h3 className="text-xl font-bold mb-3">Knowledge Transfer</h3>
                  <p className="text-gray-600">
                    We provide access to quality education and learning resources tailored to individual needs and aspirations.
                  </p>
                </div>
                <div className="card">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold mb-3">Skills Development</h3>
                  <p className="text-gray-600">
                    Through hands-on training and practical experience, we help young people develop in-demand skills.
                  </p>
                </div>
                <div className="card">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-bold mb-3">Mentorship & Support</h3>
                  <p className="text-gray-600">
                    Our experienced mentors provide guidance, inspiration, and personalized support throughout their journey.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">Our Impact</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">10,000+</div>
                  <p className="text-gray-600">Young People Reached</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
                  <p className="text-gray-600">Mentors & Volunteers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
                  <p className="text-gray-600">Skills Programs</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">$2.5M+</div>
                  <p className="text-gray-600">Impact Generated</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
