export default function TermsPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-red-600 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl opacity-90">
            Please read these terms carefully before using our website.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 space-y-10">
            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">📋 Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms of Service ("Terms") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Wissen-Haus Empowerment Foundation ("we" or "Company"), concerning your access to and use of the website and all related applications, services, tools, and software available through the website (the "Site").
              </p>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">1️⃣ Intellectual Property Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                The Site and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio) are owned by the Company, its licensors, or other providers of such material and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">2️⃣ User Representations</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By using the Site, you represent and warrant that:
              </p>
              <div className="space-y-3">
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-green-600">
                  <span className="text-2xl flex-shrink-0">✓</span>
                  <p className="text-gray-700">All information you submit is true, accurate, current, and complete</p>
                </div>
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-red-600">
                  <span className="text-2xl flex-shrink-0">✓</span>
                  <p className="text-gray-700">You have the legal capacity and agree to comply with these Terms</p>
                </div>
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-green-600">
                  <span className="text-2xl flex-shrink-0">✓</span>
                  <p className="text-gray-700">You are not a minor in the jurisdiction in which you reside</p>
                </div>
                <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-red-600">
                  <span className="text-2xl flex-shrink-0">✓</span>
                  <p className="text-gray-700">You will not access the Site through automated or non-human means</p>
                </div>
              </div>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">3️⃣ User Registration</h2>
              <p className="text-gray-700 leading-relaxed">
                If the Site offers user accounts, you agree to register only with true and accurate information and to update such information to keep it true, accurate, current, and complete. You are responsible for all activity that occurs under your account.
              </p>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">4️⃣ Prohibited Activities</h2>
              <p className="text-gray-700 leading-relaxed">
                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those specifically endorsed or approved by us.
              </p>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">5️⃣ Donations and Payments</h2>
              <div className="bg-green-50 p-8 rounded-lg border-l-4 border-green-600">
                <p className="text-gray-700 leading-relaxed mb-4">
                  All donations are voluntary and greatly appreciated. By making a donation, you agree to provide accurate payment information.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Donations are processed securely through Stripe</li>
                  <li>✓ Donations are non-refundable except as required by law</li>
                  <li>✓ All donations are tax-deductible to the extent permitted by law</li>
                </ul>
              </div>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">6️⃣ Disclaimer of Warranties</h2>
              <p className="text-gray-700 leading-relaxed">
                The Site is provided on an "AS-IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, as to the operation of the Site or the information, content, or materials included on the Site.
              </p>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">7️⃣ Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                Except where prohibited by law, in no event shall Company be liable to you in connection with your use of, or inability to use, the contents of the Site or any linked websites, or for any indirect, incidental, special, consequential, or punitive damages.
              </p>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">8️⃣ Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless the Company and its officers, directors, employees, and agents from any claim, demand, loss, or expense arising from your use of the Site or your violation of these Terms.
              </p>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">9️⃣ Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Site. Your continued use of the Site following the posting of revised Terms means that you accept and agree to the changes.
              </p>
            </section>

            <hr className="border-gray-200" />

            <section>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🔟 Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
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
