export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-4xl px-4">
        <div className="card">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <div className="prose prose-lg max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p>
                Wissen-Haus Empowerment Foundation ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <p>
                We may collect information about you in a variety of ways. The information we may collect on the Site includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Personal Data: Email address, first name, last name, phone number, donation information</li>
                <li>Device Information: Browser type, IP address, operating system, pages visited</li>
                <li>Payment Information: Credit card details are processed by Stripe and not stored on our servers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Use of Your Information</h2>
              <p>
                Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Process your donations and send donation receipts</li>
                <li>Email you regarding updates, news, and administrative information</li>
                <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site</li>
                <li>Improve our website and customer service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Disclosure of Your Information</h2>
              <p>
                We may share your information in the following situations:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>By Law or to Protect Rights: If we believe the release of information about you is necessary to comply with the law</li>
                <li>Service Providers: We may share your information with third parties that perform services for us, including payment processors, email providers, and hosting providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Security of Your Information</h2>
              <p>
                We use administrative, technical, and physical security measures to protect your personal information. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p>
                If you have questions or comments about this Privacy Policy, please contact us at:
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
