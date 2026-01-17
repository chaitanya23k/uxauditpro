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
      <footer className="border-t py-8 bg-white">
        <div className="container-main">
          <p className="text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} UXAuditPro — Built for growth 🚀 || A product of <a href="https://www.webdigiz.com">WEBDIGIZ</a>
          </p>
        </div>
      </footer>
    </>
  )
}
