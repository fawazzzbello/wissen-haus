'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 text-white py-32 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl">
          <div className="mb-4 inline-block">
            <span className="badge">🚀 Transforming Young Lives</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent">
            Empower Young People to Shape Their Future
          </h1>

          <p className="text-xl md:text-2xl opacity-90 mb-10 leading-relaxed font-light max-w-2xl">
            Wissen-Haus is a youth-focused non-profit committed to inspiring growth, building capacity, and creating pathways for young people to develop the confidence, skills, and mindset needed to navigate life and contribute meaningfully to society.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link
              href="/donate"
              className="btn-primary-gradient text-center"
            >
              💝 Support Our Mission
            </Link>
            <button className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-base font-semibold rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-all duration-300 hover:border-primary-400">
              <Link href="/about">
                ↓ Learn More
              </Link>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 pt-8 border-t border-primary-500/20">
            <div>
              <div className="text-3xl font-bold text-primary-400">10K+</div>
              <div className="text-sm text-gray-400">Lives Impacted</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-400">500+</div>
              <div className="text-sm text-gray-400">Mentors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-400">50+</div>
              <div className="text-sm text-gray-400">Programs</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
