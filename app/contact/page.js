"use client"
import Navbar from "@/components/Navbar"

export default function ContactPage() {
  return (
    <>
      <Navbar />

      <main className="container-main py-16">
        <div className="max-w-3xl mx-auto bg-white border rounded-3xl shadow-sm p-10 card-hover">
          <h1 className="text-4xl font-extrabold text-slate-900 text-center">
            Contact Us
          </h1>

          <p className="text-center text-slate-600 mt-4 text-lg">
            Need help, support, or want to work with us?  
            We’re happy to help ✅
          </p>

          <div className="mt-10 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-50 border">
              <p className="text-sm font-bold text-slate-900">Official Email</p>
              <p className="text-slate-700 mt-2">
                📩 <span className="font-semibold">support@webdigiz.com</span>
              </p>
              <p className="text-xs text-slate-500 mt-2">
                (If you want a website, saas products, uxui design, contact us)
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border">
              <p className="text-sm font-bold text-slate-900">Website</p>
              <p className="text-slate-700 mt-2">
                🌐{" "}
                <a
                  href="https://www.webdigiz.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  www.webdigiz.com
                </a>
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border">
              <p className="text-sm font-bold text-slate-900">
                Business Partnerships
              </p>
              <p className="text-slate-700 mt-2">
                For agency partnerships, collaborations, and enterprise inquiries,
                email us and we’ll respond ASAP.
              </p>
            </div>
          </div>

          <div className="mt-10 flex justify-center gap-4 flex-wrap">
            <a href="/pricing" className="btn-primary">
              View Pricing →
            </a>
            <a href="/dashboard" className="btn-outline">
              Go to Dashboard
            </a>
          </div>
        </div>
      </main>
    </>
  )
}
