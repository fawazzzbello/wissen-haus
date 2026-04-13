export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl px-4">
        <div className="card">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
              <p>
                These Terms of Service ("Terms") constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and Wissen-Haus Empowerment Foundation ("we" or "Company"), concerning your access to and use of the wissenhaus.org website and all related applications, services, tools, and software available through the website (the "Site").
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Intellectual Property Rights</h2>
              <p>
                The Site and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio) are owned by the Company, its licensors, or other providers of such material and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. User Representations</h2>
              <p>
                By using the Site, you represent and warrant that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All information you submit is true, accurate, current, and complete</li>
                <li>You have the legal capacity and you agree to comply with these Terms and Conditions</li>
                <li>You are not a minor in the jurisdiction in which you reside</li>
                <li>You will not access the Site through automated or non-human means</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Registration</h2>
              <p>
                If the Site offers user accounts, you agree to register only with true and accurate information and to update such information to keep it true, accurate, current, and complete. You are responsible for all activity that occurs under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Prohibited Activities</h2>
              <p>
                You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those specifically endorsed or approved by us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Donations and Payments</h2>
              <p>
                All donations are voluntary. By making a donation, you agree to provide accurate payment information. Donations are processed securely through Stripe and are non-refundable except as required by law. All donations are tax-deductible to the extent permitted by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Disclaimer of Warranties</h2>
              <p>
                The Site is provided on an "AS-IS" and "AS AVAILABLE" basis. We make no representations or warranties of any kind, express or implied, as to the operation of the Site or the information, content, or materials included on the Site.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p>
                Except where prohibited by law, in no event shall Company be liable to you in connection with your use of, or inability to use, the contents of the Site or any linked websites, or for any indirect, incidental, special, consequential, or punitive damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless the Company and its officers, directors, employees, and agents from any claim, demand, loss, or expense arising from your use of the Site or your violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting to the Site. Your continued use of the Site following the posting of revised Terms means that you accept and agree to the changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Information</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                Email: info@wissen-haus.org<br />
                Phone: +1 (555) 123-4567
              </p>
            </section>

            <p className="text-sm text-gray-500 pt-8 border-t">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
