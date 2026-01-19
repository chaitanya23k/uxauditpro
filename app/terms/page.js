import Navbar from "@/components/Navbar"
import Footer from "@/app/page.js"

export const metadata = {
  title: "Terms & Conditions | UXAuditPro",
  description: "Terms & Conditions for UXAuditPro by WebDigiz",
}

export default function TermsPage() {
  return (
    <>
      <Navbar />

      <main className="bg-slate-50 min-h-screen py-14 px-4">
        <div className="max-w-4xl mx-auto bg-white border rounded-2xl shadow-sm p-8 md:p-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Terms & Conditions
          </h1>

          <p className="text-slate-600 mt-4 text-sm">
            Last Updated: {new Date().toLocaleDateString()}
          </p>

          <div className="mt-8 space-y-8 text-slate-700 leading-relaxed">
            {/* 1 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                1. Agreement to Terms
              </h2>
              <p className="mt-2">
                By accessing or using <b>UXAuditPro</b>, you agree to follow these
                Terms & Conditions. If you do not agree, please stop using the service.
              </p>
            </section>

            {/* 2 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                2. About UXAuditPro
              </h2>
              <p className="mt-2">
                UXAuditPro is a UX audit and reporting platform operated by{" "}
                <b>WebDigiz</b> (www.webdigiz.com). We help users analyze websites
                for usability, accessibility, conversion, and UX improvements.
              </p>
            </section>

            {/* 3 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                3. Account Registration
              </h2>
              <ul className="mt-3 list-disc ml-6 space-y-2">
                <li>You must provide accurate information while signing up.</li>
                <li>You are responsible for keeping your account secure.</li>
                <li>
                  If you suspect unauthorized access, contact us immediately.
                </li>
              </ul>
            </section>

            {/* 4 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                4. Subscription Plans
              </h2>
              <p className="mt-2">
                UXAuditPro offers Free, Pro, and Agency plans. Features may vary by plan:
              </p>

              <ul className="mt-3 list-disc ml-6 space-y-2">
                <li>
                  <b>Free Plan:</b> Limited audits per day and no PDF export.
                </li>
                <li>
                  <b>Pro Plan:</b> Unlimited audits, category breakdown, PDF export.
                </li>
                <li>
                  <b>Agency Plan:</b> Agency dashboard, employee management, branding PDF.
                </li>
              </ul>

              <p className="mt-3">
                We may update features, pricing, or plan limits at any time.
              </p>
            </section>

            {/* 5 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                5. Payments & Billing
              </h2>
              <p className="mt-2">
                Payments are processed via trusted third-party providers such as
                Razorpay and PayPal. We do not store full card details on our servers.
              </p>

              <p className="mt-2">
                If a payment fails, the plan upgrade may not be applied until payment is successful.
              </p>
            </section>

            {/* 6 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                6. Refund Policy
              </h2>
              <p className="mt-2">
                Refunds are not guaranteed and are handled case-by-case. If you feel your
                payment was charged incorrectly, contact us at{" "}
                <b>support@webdigiz.com</b> within 7 days of purchase.
              </p>
            </section>

            {/* 7 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                7. Website Audits & Reports
              </h2>
              <p className="mt-2">
                UXAuditPro generates automated website audit reports, scores, screenshots,
                and recommendations. Results may not be 100% accurate and should be treated
                as guidance, not guaranteed outcomes.
              </p>

              <p className="mt-2">
                You are responsible for ensuring that you have permission to audit websites
                you submit.
              </p>
            </section>

            {/* 8 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                8. Prohibited Use
              </h2>
              <p className="mt-2">You agree NOT to:</p>

              <ul className="mt-3 list-disc ml-6 space-y-2">
                <li>Use the service for illegal activities.</li>
                <li>Attempt to hack, attack, or overload our system.</li>
                <li>Copy or resell our service without permission.</li>
                <li>Upload malicious or harmful content.</li>
              </ul>
            </section>

            {/* 9 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                9. Intellectual Property
              </h2>
              <p className="mt-2">
                UXAuditPro branding, design, code, and platform content belong to WebDigiz.
                You may not copy, distribute, or reuse without written permission.
              </p>
            </section>

            {/* 10 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                10. Limitation of Liability
              </h2>
              <p className="mt-2">
                UXAuditPro and WebDigiz are not responsible for business losses,
                conversion drops, revenue losses, or damages resulting from using our
                reports, suggestions, or analysis.
              </p>
            </section>

            {/* 11 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                11. Termination
              </h2>
              <p className="mt-2">
                We may suspend or terminate accounts that violate these Terms. Users may
                stop using the service anytime.
              </p>
            </section>

            {/* 12 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                12. Changes to These Terms
              </h2>
              <p className="mt-2">
                We may update these Terms at any time. Updates will be posted on this page
                with the latest revision date.
              </p>
            </section>

            {/* 13 */}
            <section>
              <h2 className="text-xl font-bold text-slate-900">
                13. Contact Us
              </h2>
              <p className="mt-2">
                For any questions, support, or refund issues, contact:
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
