import { useEffect, useState } from 'react';

export default function PrivacyPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-red-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl opacity-90">
            Your privacy is important to us. Learn how we protect your data.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 space-y-10">
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">📋</span> Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Wissen-Haus Empowerment Foundation ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
              </p>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🔍</span> Information We Collect
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may collect information about you in a variety of ways. The information we may collect on the Site includes:
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                  <h3 className="font-bold text-gray-900 mb-2">Personal Data</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Email address</li>
                    <li>• First & last name</li>
                    <li>• Phone number</li>
                    <li>• Donation info</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-600">
                  <h3 className="font-bold text-gray-900 mb-2">Device Information</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Browser type</li>
                    <li>• IP address</li>
                    <li>• Operating system</li>
                    <li>• Pages visited</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-600">
                  <h3 className="font-bold text-gray-900 mb-2">Payment Info</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Credit card details</li>
                    <li>• Never stored by us</li>
                    <li>• Processed by Stripe</li>
                    <li>• Industry standard</li>
                  </ul>
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">💼</span> Use of Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:
              </p>
              <div className="space-y-3">
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl flex-shrink-0">💝</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Process Donations</h3>
                    <p className="text-gray-600 text-sm">Process donations and send donation receipts</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl flex-shrink-0">📧</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Send Updates</h3>
                    <p className="text-gray-600 text-sm">Email regarding updates, news, and administrative information</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl flex-shrink-0">🎯</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Fulfill Transactions</h3>
                    <p className="text-gray-600 text-sm">Manage purchases, orders, payments, and other transactions</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                  <span className="text-2xl flex-shrink-0">⚡</span>
                  <div>
                    <h3 className="font-bold text-gray-900">Improve Services</h3>
                    <p className="text-gray-600 text-sm">Improve our website, services, and customer experience</p>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🔐</span> Disclosure of Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share your information in limited situations:
              </p>
              <div className="space-y-4">
                <div className="border-l-4 border-green-600 pl-6 py-4">
                  <h3 className="font-bold text-gray-900 mb-2">By Law or to Protect Rights</h3>
                  <p className="text-gray-600">If we believe the release of information is necessary to comply with the law or protect rights</p>
                </div>
                <div className="border-l-4 border-red-600 pl-6 py-4">
                  <h3 className="font-bold text-gray-900 mb-2">Service Providers</h3>
                  <p className="text-gray-600">Third parties that perform services for us, including payment processors, email providers, and hosting providers</p>
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">🛡️</span> Security of Your Information
              </h2>
              <div className="bg-green-50 p-8 rounded-lg border-l-4 border-green-600">
                <p className="text-gray-700 leading-relaxed">
                  We use administrative, technical, and physical security measures to protect your personal information. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security. Your security is a shared responsibility.
                </p>
              </div>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                <span className="text-3xl">📞</span> Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions or concerns about this Privacy Policy, please contact us:
              </p>
              <div className="bg-gradient-to-r from-green-50 to-red-50 p-8 rounded-lg border-2 border-green-600">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">📧 Email</p>
                    <a href="mailto:hello@wissen-haus.org" className="text-green-600 font-bold hover:underline">
                      hello@wissen-haus.org
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">📱 Phone</p>
                    <a href="tel:+1-555-123-4567" className="text-green-600 font-bold hover:underline">
                      +1 (555) 123-4567
                    </a>
                  </div>
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            <section>
              <p className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}
