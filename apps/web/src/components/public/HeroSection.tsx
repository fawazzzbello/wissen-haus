'use client';

import Link from 'next/link';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-24">
      <div className="container">
        <div className="max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Empower Young People to Shape Their Future
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 leading-relaxed">
            Wissen-Haus is a youth-focused non-profit committed to inspiring growth, building capacity, and creating pathways for young people to develop the confidence, skills, and mindset needed to navigate life and contribute meaningfully to society.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/donate"
              className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-center"
            >
              Support Our Mission
            </Link>
            <Link
              href="/about"
              className="btn-outline border-white text-white hover:bg-white hover:bg-opacity-10 text-center"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
