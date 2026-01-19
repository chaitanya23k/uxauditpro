"use client"
import Navbar from "@/components/Navbar"

export default function Home() {
  return (
    <>
      {/* ✅ Navbar will auto-change based on role */}
      <Navbar />

      {/* ✅ Background glow + smooth page fade */}
      <main className="fade-page bg-glow">
        <div className="container-main pt-32 md:pt-40 pb-16">

          {/* ✅ HERO SECTION */}
          <section className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div className="animate-fadeIn">
              <p className="text-indigo-600 font-semibold mb-3 tracking-wide uppercase text-sm">
                UX Audit SaaS Platform
              </p>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-slate-900">
                Improve your website UX{" "}
                <span className="text-indigo-600">&</span> increase conversions
              </h1>

              <p className="text-slate-600 mt-5 text-lg md:text-xl leading-relaxed">
                Run instant UX audits, generate PDF reports, and get AI-powered
                suggestions to boost your business performance.
              </p>

              {/* ✅ Buttons */}
              <div className="mt-8 flex gap-4 flex-wrap">
                <a href="/signup" className="btn-primary">
                  Get Started Free →
                </a>

                <a href="/pricing" className="btn-outline">
                  View Pricing
                </a>
              </div>

              <p className="text-sm text-slate-500 mt-6 flex items-center gap-2">
                ✅ No credit card required.
              </p>
            </div>

            {/* Right Card */}
            <div className="card-hover p-8 bg-white rounded-2xl shadow-md border animate-fadeUp">
              <h3 className="font-extrabold text-xl mb-4 text-slate-900">
                Example UX Audit
              </h3>

              <div className="flex justify-between text-slate-700 text-lg">
                <span className="font-semibold">UX Score</span>
                <span className="font-extrabold text-indigo-600">82/100</span>
              </div>

              <ul className="mt-5 space-y-3 text-slate-600 text-base">
                <li>✅ Improve CTA visibility</li>
                <li>✅ Reduce form fields</li>
                <li>✅ Fix mobile layout spacing</li>
                <li>✅ Add trust badges</li>
              </ul>

              <a
                href="/dashboard"
                className="btn-primary block text-center mt-7"
              >
                Run My Audit →
              </a>

              <p className="text-xs text-slate-500 mt-4 text-center">
                Takes less than 10 seconds ⚡
              </p>
            </div>
          </section>

          {/* ✅ FEATURES */}
          <section className="mt-24">
            <h2 className="text-3xl md:text-4xl font-extrabold text-center text-slate-900">
              Everything you need to improve UX fast
            </h2>

            <p className="text-center text-slate-600 mt-4 max-w-2xl mx-auto text-lg">
              Simple workflow. Powerful insights. Exportable reports. Built for
              founders, agencies, and teams.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mt-12">

              <div className="card-hover p-7 rounded-2xl bg-white shadow-sm border animate-fadeUp">
                <h3 className="font-bold text-lg text-slate-900">UX Score</h3>
                <p className="text-slate-600 mt-3 leading-relaxed">
                  Get a clear UX score and most important issues instantly.
                </p>
              </div>

              <div className="card-hover p-7 rounded-2xl bg-white shadow-sm border animate-fadeUp delay-150">
                <h3 className="font-bold text-lg text-slate-900">
                  AI Suggestions
                </h3>
                <p className="text-slate-600 mt-3 leading-relaxed">
                  Conversion-focused recommendations powered by AI for quick fixes.
                </p>
              </div>

              <div className="card-hover p-7 rounded-2xl bg-white shadow-sm border animate-fadeUp delay-300">
                <h3 className="font-bold text-lg text-slate-900">PDF Reports</h3>
                <p className="text-slate-600 mt-3 leading-relaxed">
                  Download clean professional reports and share with your clients.
                </p>
              </div>

            </div>
          </section>

          {/* ✅ WHY CHOOSE UXAUDITPRO */}
<section className="mt-24">
  <div className="text-center max-w-3xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
      Why choose <span className="text-indigo-600">UXAuditPro</span>?
    </h2>
    <p className="text-slate-600 mt-4 text-lg">
      Most tools give you generic reports. UXAuditPro gives you fast, actionable
      fixes that actually improve conversion and user experience.
    </p>
  </div>

  <div className="grid md:grid-cols-3 gap-6 mt-12">
    <div className="card-hover p-7 bg-white rounded-2xl border shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">
        ⚡
      </div>
      <h3 className="font-extrabold text-lg mt-4 text-slate-900">
        Instant Audit Results
      </h3>
      <p className="text-slate-600 mt-2 leading-relaxed">
        Get a UX score + top issues in seconds. No waiting, no heavy setup.
      </p>
    </div>

    <div className="card-hover p-7 bg-white rounded-2xl border shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">
        🎯
      </div>
      <h3 className="font-extrabold text-lg mt-4 text-slate-900">
        Actionable Recommendations
      </h3>
      <p className="text-slate-600 mt-2 leading-relaxed">
        Clear suggestions that improve trust, readability, CTA placement, and
        conversion.
      </p>
    </div>

    <div className="card-hover p-7 bg-white rounded-2xl border shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">
        📄
      </div>
      <h3 className="font-extrabold text-lg mt-4 text-slate-900">
        Client-Ready PDF Reports
      </h3>
      <p className="text-slate-600 mt-2 leading-relaxed">
        Export clean reports that look professional and easy to understand.
      </p>
    </div>
  </div>
</section>

{/* ✅ COMPARISON TABLE */}
<section className="mt-24">
  <div className="text-center max-w-3xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
      UXAuditPro vs Others
    </h2>
    <p className="text-slate-600 mt-4 text-lg">
      Here’s why founders, agencies, and teams prefer UXAuditPro.
    </p>
  </div>

  <div className="mt-12 overflow-hidden rounded-3xl border bg-white shadow-sm">
    <div className="grid md:grid-cols-2">

      {/* LEFT (UXAuditPro) */}
      <div className="p-8 md:p-10 bg-gradient-to-br from-indigo-600 to-indigo-500 text-white">
        <h3 className="text-2xl font-extrabold">UXAuditPro</h3>
        <p className="text-white/90 mt-2">
          Built for speed, clarity, and real conversion improvement.
        </p>

        <ul className="mt-6 space-y-3 text-white/95 font-semibold">
          <li className="flex gap-3">
            <span className="text-white">✅</span> Instant UX Score + Problems
          </li>
          <li className="flex gap-3">
            <span className="text-white">✅</span> Simple + clear recommendations
          </li>
          <li className="flex gap-3">
            <span className="text-white">✅</span> PDF reports for clients
          </li>
          <li className="flex gap-3">
            <span className="text-white">✅</span> Agency dashboard + employee system
          </li>
          <li className="flex gap-3">
            <span className="text-white">✅</span> Built for mobile + desktop UX
          </li>
        </ul>
      </div>

      {/* RIGHT (Others) */}
      <div className="p-8 md:p-10">
        <h3 className="text-2xl font-extrabold text-slate-900">Other Tools</h3>
        <p className="text-slate-600 mt-2">
          Usually complex, slow, or too technical for fast actions.
        </p>

        <ul className="mt-6 space-y-3 text-slate-700 font-semibold">
          <li className="flex gap-3">
            <span className="text-red-500">✖</span> Generic reports with no direction
          </li>
          <li className="flex gap-3">
            <span className="text-red-500">✖</span> Hard-to-understand audit output
          </li>
          <li className="flex gap-3">
            <span className="text-red-500">✖</span> No client-friendly PDF report
          </li>
          <li className="flex gap-3">
            <span className="text-red-500">✖</span> No agency/team features
          </li>
          <li className="flex gap-3">
            <span className="text-red-500">✖</span> Too technical for business owners
          </li>
        </ul>

        <div className="mt-8">
          <a
            href="/pricing"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-black transition"
          >
            Upgrade & Unlock Features →
          </a>
        </div>
      </div>

    </div>
  </div>
</section>

{/* ✅ FAQ SECTION */}
<section className="mt-24">
  <div className="text-center max-w-3xl mx-auto">
    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
      Frequently Asked Questions
    </h2>
    <p className="text-slate-600 mt-4 text-lg">
      Everything you need to know before starting with UXAuditPro.
    </p>
  </div>

  <div className="mt-12 grid md:grid-cols-2 gap-6">
    {/* FAQ Card */}
    <div className="card-hover p-7 bg-white rounded-2xl border shadow-sm">
      <h3 className="font-extrabold text-lg text-slate-900">
        What is UXAuditPro?
      </h3>
      <p className="text-slate-600 mt-3 leading-relaxed">
        UXAuditPro is a UX audit SaaS that analyzes your website and gives you a
        UX score, common UX issues, and improvement recommendations to boost
        conversions.
      </p>
    </div>

    <div className="card-hover p-7 bg-white rounded-2xl border shadow-sm">
      <h3 className="font-extrabold text-lg text-slate-900">
        Who should use UXAuditPro?
      </h3>
      <p className="text-slate-600 mt-3 leading-relaxed">
        Founders, marketers, agencies, and teams who want quick UX fixes,
        clearer conversion improvements, and professional reports for clients.
      </p>
    </div>

    <div className="card-hover p-7 bg-white rounded-2xl border shadow-sm">
      <h3 className="font-extrabold text-lg text-slate-900">
        Does Free plan have limitations?
      </h3>
      <p className="text-slate-600 mt-3 leading-relaxed">
        Yes. Free plan allows limited audits per day. Pro and Agency unlock
        unlimited audits, extra features, and premium report exports.
      </p>
    </div>

    <div className="card-hover p-7 bg-white rounded-2xl border shadow-sm">
      <h3 className="font-extrabold text-lg text-slate-900">
        Will I get AI suggestions?
      </h3>
      <p className="text-slate-600 mt-3 leading-relaxed">
        Yes. Pro and Agency plans include AI-powered suggestions (we’ll keep
        improving it for more detailed UX fixes and conversion improvements).
      </p>
    </div>

    <div className="card-hover p-7 bg-white rounded-2xl border shadow-sm">
      <h3 className="font-extrabold text-lg text-slate-900">
        Can agencies manage employees?
      </h3>
      <p className="text-slate-600 mt-3 leading-relaxed">
        Yes. Agency dashboard allows employee management, team access, and
        client-friendly workflow for scaling audits.
      </p>
    </div>

    <div className="card-hover p-7 bg-white rounded-2xl border shadow-sm">
      <h3 className="font-extrabold text-lg text-slate-900">
        Can I upgrade anytime?
      </h3>
      <p className="text-slate-600 mt-3 leading-relaxed">
        Absolutely. You can upgrade to Pro or Agency anytime from the Pricing
        page, and your dashboard features will unlock immediately after payment.
      </p>
    </div>
  </div>
</section>



          {/* ✅ CTA SECTION */}
          <section className="mt-24">
            <div className="card-hover p-12 rounded-3xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-center shadow-lg animate-fadeUp">
              <h3 className="text-3xl md:text-4xl font-extrabold">
                Ready to audit your website?
              </h3>

              <p className="text-white/90 mt-4 text-lg max-w-xl mx-auto">
                Start free and discover improvements that increase leads and sales.
              </p>

              <div className="mt-8 flex justify-center gap-4 flex-wrap">
                <a
                  href="/signup"
                  className="px-6 py-3 rounded-xl bg-white text-indigo-700 font-bold shadow hover:scale-105 transition"
                >
                  Create Free Account →
                </a>

                <a
                  href="/pricing"
                  className="px-6 py-3 rounded-xl border border-white/50 font-bold hover:bg-white/10 transition"
                >
                  View Pricing
                </a>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* ✅ Footer */}
      <footer className="border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} UXAuditPro • Powered by WebDigiz
        </p>

        <div className="flex gap-5 text-sm font-semibold text-slate-700 flex-wrap justify-center">
          <a href="/about" className="hover:text-indigo-600">
            About
          </a>

          <a href="/contact" className="hover:text-indigo-600">
            Contact
          </a>

          <a href="/privacy-policy" className="hover:text-indigo-600">
            Privacy Policy
          </a>

          <a href="/terms" className="hover:text-indigo-600">
            Terms & Conditions
          </a>
        </div>
      </div>
    </footer>
    </>
  )
}
