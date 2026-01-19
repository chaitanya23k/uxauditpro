import Navbar from "@/components/Navbar"
import Footer from "@/app/page.js"

export const metadata = {
  title: "Privacy Policy | UXAuditPro",
  description: "Privacy Policy for UXAuditPro by WebDigiz",
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />

      <main className="bg-slate-50 min-h-screen py-14 px-4">
        <div className="max-w-4xl mx-auto bg-white border rounded-2xl shadow-sm p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Privacy Policy
          </h1>

          <p className="text-slate-600 mt-4 text-sm">
            Last Updated: {new Date().toLocaleDateString()}
          </p>

          <div className="mt-8 space-y-8 text-slate-700 leading-relaxed">
            {/* 1 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                1. Introduction
              </h2>
              <p className="mt-2">
                Welcome to <b>UXAuditPro</b>. This Privacy Policy explains how we
                collect, use, and protect your information when you use our website,
                services, and UX audit tools. UXAuditPro is operated by{" "}
                <b>WebDigiz</b> (www.webdigiz.com).
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                2. Information We Collect
              </h2>

              <ul className="mt-3 list-disc ml-6 space-y-2">
                <li>
                  <b>Account Information:</b> Name, email address, and login details
                  when you create an account.
                </li>
                <li>
                  <b>Website URLs:</b> The website links you submit for auditing.
                </li>
                <li>
                  <b>Usage Data:</b> Pages visited, features used, device type, and
                  performance analytics to improve our product.
                </li>
                <li>
                  <b>Payment Information:</b> Payments are handled by trusted third-party
                  providers (example: Razorpay / PayPal). We do not store your full
                  card details.
                </li>
              </ul>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                3. How We Use Your Data
              </h2>

              <ul className="mt-3 list-disc ml-6 space-y-2">
                <li>To create and manage your account.</li>
                <li>To generate UX audit reports and PDF downloads.</li>
                <li>To improve product features and user experience.</li>
                <li>To provide support and respond to your inquiries.</li>
                <li>To protect against misuse, fraud, or illegal activity.</li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                4. Screenshots & Report Content
              </h2>
              <p className="mt-2">
                UXAuditPro may capture website screenshots to generate PDF reports
                and highlight UX issues. These screenshots are used only for report
                generation and user access inside dashboards.
              </p>
              <p className="mt-2">
                We do not claim ownership of your website content. You are responsible
                for ensuring you have rights to audit the websites you submit.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                5. Cookies & Tracking
              </h2>
              <p className="mt-2">
                We may use cookies or similar technologies to improve your experience
                (example: remembering sessions, improving performance, and tracking
                product usage).
              </p>
              <p className="mt-2">
                You can disable cookies in your browser settings, but some features may
                not work properly.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                6. Data Sharing
              </h2>
              <p className="mt-2">
                We do not sell your personal data. We may share data only in these cases:
              </p>

              <ul className="mt-3 list-disc ml-6 space-y-2">
                <li>
                  <b>Service Providers:</b> For payments, hosting, analytics, and report
                  generation.
                </li>
                <li>
                  <b>Legal Requirements:</b> If required by law, regulation, or court
                  order.
                </li>
                <li>
                  <b>Security:</b> To prevent fraud or protect platform integrity.
                </li>
              </ul>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                7. Data Security
              </h2>
              <p className="mt-2">
                We take reasonable steps to protect your information using modern security
                practices. However, no system is 100% secure, and we cannot guarantee
                absolute protection.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                8. Data Retention
              </h2>
              <p className="mt-2">
                We keep your data only as long as needed to provide the service, improve
                reports, and meet legal requirements. You may request deletion at any time.
              </p>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                9. Your Rights
              </h2>
              <p className="mt-2">
                You may request access, correction, or deletion of your data by contacting us.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                10. Third-Party Links
              </h2>
              <p className="mt-2">
                Our website may contain links to third-party websites. We are not responsible
                for their privacy practices. Please review their policies separately.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                11. Changes to This Policy
              </h2>
              <p className="mt-2">
                We may update this Privacy Policy from time to time. Updates will be posted
                on this page with the latest revision date.
              </p>
            </section>

            {/* 12 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                12. Contact Us
              </h2>
              <p className="mt-2">
                If you have any questions about this Privacy Policy, contact us at:
              </p>

              <div className="mt-3 p-4 rounded-xl bg-slate-50 border">
                <p className="font-semibold text-slate-900">WebDigiz • UXAuditPro</p>
                <p className="text-sm text-slate-600">Website: www.webdigiz.com</p>
                <p className="text-sm text-slate-600">
                  Email: <b>support@webdigiz.com</b>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
