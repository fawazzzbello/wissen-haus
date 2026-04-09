'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary-600">
          Wissen-Haus
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-700 hover:text-primary-600 transition">
            Home
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-primary-600 transition">
            About
          </Link>
          <Link href="/contact" className="text-gray-700 hover:text-primary-600 transition">
            Contact
          </Link>
          <Link href="/donate" className="btn-primary">
            Donate
          </Link>
          <Link href="/admin/login" className="text-gray-700 hover:text-primary-600 transition">
            Admin
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
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
        <div className="md:hidden border-t">
          <div className="container py-4 space-y-4">
            <Link href="/" className="block text-gray-700 hover:text-primary-600">
              Home
            </Link>
            <Link href="/about" className="block text-gray-700 hover:text-primary-600">
              About
            </Link>
            <Link href="/contact" className="block text-gray-700 hover:text-primary-600">
              Contact
            </Link>
            <Link href="/donate" className="block btn-primary">
              Donate
            </Link>
            <Link href="/admin/login" className="block text-gray-700 hover:text-primary-600">
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
