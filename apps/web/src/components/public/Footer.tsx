'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getApiClient } from '@/lib/api-client';

interface FooterSettings {
  site_name?: string;
  contact_email?: string;
  phone_number?: string;
  social_twitter?: string;
  social_facebook?: string;
  social_linkedin?: string;
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState<FooterSettings>({
    site_name: 'Wissen-Haus',
    contact_email: 'info@wissen-haus.org',
    phone_number: '+1 (555) 123-4567',
    social_twitter: '',
    social_facebook: '',
    social_linkedin: '',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const api = getApiClient();
        const response = await api.get('/settings');
        const allSettings = response.data.settings || {};
        setSettings({
          site_name: allSettings.site_name || 'Wissen-Haus',
          contact_email: allSettings.contact_email || 'info@wissen-haus.org',
          phone_number: allSettings.phone_number || '+1 (555) 123-4567',
          social_twitter: allSettings.social_twitter || '',
          social_facebook: allSettings.social_facebook || '',
          social_linkedin: allSettings.social_linkedin || '',
        });
      } catch (error) {
        console.error('Error fetching footer settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-primary-400 mb-4">{settings.site_name}</h3>
            <p className="text-gray-400">
              Empowering young people to reach their full potential.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-primary-400 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-400 transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-primary-400 transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/donate" className="hover:text-primary-400 transition">
                  Donate
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-400 transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/privacy" className="hover:text-primary-400 transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-400 transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-400 transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Get In Touch</h4>
            <ul className="space-y-2 text-gray-400">
              {settings.contact_email && (
                <li>Email: <a href={`mailto:${settings.contact_email}`} className="text-primary-400 hover:underline">{settings.contact_email}</a></li>
              )}
              {settings.phone_number && (
                <li>Phone: <a href={`tel:${settings.phone_number}`} className="text-primary-400 hover:underline">{settings.phone_number}</a></li>
              )}
              {(settings.social_twitter || settings.social_facebook || settings.social_linkedin) && (
                <li className="pt-2">
                  <div className="flex gap-4">
                    {settings.social_twitter && (
                      <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition">
                        Twitter
                      </a>
                    )}
                    {settings.social_facebook && (
                      <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition">
                        Facebook
                      </a>
                    )}
                    {settings.social_linkedin && (
                      <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary-400 transition">
                        LinkedIn
                      </a>
                    )}
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
            <p>&copy; {currentYear} {settings.site_name} Empowerment Foundation. All rights reserved.</p>
            <p>Empowering young people to reach their full potential.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
