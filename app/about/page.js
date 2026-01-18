"use client"
import Navbar from "@/components/Navbar"

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="container-main py-16">
        <div className="max-w-4xl mx-auto bg-white border rounded-3xl shadow-sm p-10 md:p-14 card-hover">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
            About UXAuditPro
          </h1>

          <p className="text-slate-600 mt-5 text-lg leading-relaxed">
            UXAuditPro is a website UX Audit SaaS built to help founders, agencies,
            and teams quickly identify UX problems and improve conversions with
            clear actionable recommendations.
          </p>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="p-7 rounded-2xl bg-slate-50 border">
              <h3 className="font-extrabold text-slate-900 text-lg">
                Our Mission
              </h3>
              <p className="text-slate-600 mt-3 leading-relaxed">
                Make UX auditing simple, fast, and accessible — so businesses can
                take quick action and grow faster.
              </p>
            </div>

            <div className="p-7 rounded-2xl bg-slate-50 border">
              <h3 className="font-extrabold text-slate-900 text-lg">
                Who Built UXAuditPro?
              </h3>
              <p className="text-slate-600 mt-3 leading-relaxed">
                UXAuditPro is developed by{" "}
                <span className="font-bold text-slate-900">WebDigiz</span>, a web
                development & digital marketing company.
              </p>
            </div>
          </div>

          <div className="mt-10 p-7 rounded-2xl bg-indigo-50 border border-indigo-200">
            <h3 className="font-extrabold text-indigo-900 text-lg">
              WebDigiz
            </h3>
            <p className="text-indigo-800 mt-2 leading-relaxed">
              We build modern websites, SaaS products, and growth-focused digital
              solutions for startups and businesses.
            </p>

            <a
              href="https://www.webdigiz.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex mt-5 px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
            >
              Visit www.webdigiz.com →
            </a>
          </div>

          <div className="mt-10 flex gap-4 flex-wrap">
            <a href="/pricing" className="btn-primary">
              View Pricing →
            </a>
            <a href="/contact" className="btn-outline">
              Contact Us
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
