'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 via-primary-900 to-slate-900 backdrop-blur-md border-b border-primary-500/20 shadow-2xl">
      <nav className="container py-4 flex justify-between items-center">
        <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent hover:from-primary-300 hover:to-primary-500 transition-all duration-300">
          ✨ Wissen-Haus
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium relative group">
            Home
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/about" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium relative group">
            About
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/blog" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium relative group">
            Blog
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/contact" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium relative group">
            Contact
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/faq" className="text-gray-300 hover:text-primary-400 transition-colors duration-300 font-medium relative group">
            FAQ
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-400 to-primary-600 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/donate" className="btn-primary-gradient">
            💝 Donate Now
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white hover:text-primary-400 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-primary-500/20 bg-slate-900/95 backdrop-blur-md">
          <div className="container py-4 space-y-4">
            <Link href="/" className="block text-gray-300 hover:text-primary-400 transition-colors font-medium">
              Home
            </Link>
            <Link href="/about" className="block text-gray-300 hover:text-primary-400 transition-colors font-medium">
              About
            </Link>
            <Link href="/blog" className="block text-gray-300 hover:text-primary-400 transition-colors font-medium">
              Blog
            </Link>
            <Link href="/contact" className="block text-gray-300 hover:text-primary-400 transition-colors font-medium">
              Contact
            </Link>
            <Link href="/faq" className="block text-gray-300 hover:text-primary-400 transition-colors font-medium">
              FAQ
            </Link>
            <Link href="/donate" className="block btn-primary-gradient w-full text-center">
              💝 Donate Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
