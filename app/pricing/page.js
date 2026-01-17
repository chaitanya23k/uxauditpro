"use client"
import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import { getUser, upgradePlan } from "@/lib/auth"

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState(null)

  // ✅ Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)
  }, [])

  // ✅ Free Plan Upgrade (instant)
  function chooseFreePlan() {
    const user = getUser()
    if (!user) {
      alert("Please login/signup first to select a plan.")
      window.location.href = "/signup"
      return
    }

    upgradePlan("free")
    alert("✅ Plan activated: FREE")
    window.location.href = "/dashboard"
  }

  // ✅ Razorpay Payment (Pro / Agency)
  async function payNow(plan) {
    const user = getUser()
    if (!user) {
      alert("Please login/signup first to purchase a plan.")
      window.location.href = "/signup"
      return
    }

    setLoadingPlan(plan)

    try {
      // ✅ Amounts in INR (you can change)
      const amount = plan === "pro" ? 499 : 1999

      // ✅ 1) Create Order from backend
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })

      const order = await res.json()

      if (!res.ok || order.error) {
        alert("❌ Order creation failed: " + (order.error || "Unknown error"))
        setLoadingPlan(null)
        return
      }

      // ✅ 2) Open Razorpay popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "UXAuditPro",
        description: plan === "pro" ? "Pro Plan Upgrade" : "Agency Plan Upgrade",
        image: "/razorpay.svg",
        order_id: order.id,

        prefill: {
          name: user?.name || "User",
          email: user?.email || "",
        },

        theme: {
          color: "#4F46E5",
        },

        handler: async function (response) {
          // ✅ 3) Verify Payment Signature
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          })

          const verifyData = await verifyRes.json()

          if (!verifyRes.ok || !verifyData.success) {
            alert("❌ Payment verification failed!")
            return
          }

          // ✅ 4) Upgrade plan after success
          upgradePlan(plan)

          alert("✅ Payment successful! Plan upgraded to " + plan.toUpperCase())

          window.location.href = "/dashboard"
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      alert("❌ Payment failed: " + err.message)
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <>
      <Navbar />

      <main className="fade-page bg-glow min-h-screen px-4 py-16">
        <div className="container-main">

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900">
              Pricing
            </h1>
            <p className="text-slate-600 mt-4 text-lg">
              Choose a plan that fits your goals. Upgrade anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">

            {/* ✅ FREE */}
            <div className="bg-white border rounded-2xl p-8 shadow-sm hover:shadow-lg transition card-hover">
              <h2 className="text-xl font-bold text-slate-900">Free</h2>
              <p className="text-slate-600 mt-1">Best for trying out</p>

              <p className="text-4xl font-extrabold mt-6 text-slate-900">
                ₹0
              </p>

              <ul className="mt-6 space-y-2 text-slate-600">
                <li>✅ 1 audit/day</li>
                <li>✅ UX score</li>
                <li>✅ Basic issues</li>
                <li>❌ AI Suggestions</li>
                <li>❌ PDF Export</li>
              </ul>

              <button
                onClick={chooseFreePlan}
                className="mt-8 w-full px-6 py-3 rounded-xl border font-semibold hover:bg-slate-50 transition"
              >
                Choose Free
              </button>
            </div>

            {/* ✅ PRO */}
            <div className="bg-white border-2 border-indigo-600 rounded-2xl p-8 shadow-sm hover:shadow-lg transition card-hover relative">
              <p className="absolute -top-3 left-6 text-xs px-3 py-1 rounded-full bg-indigo-600 text-white font-bold shadow">
                MOST POPULAR
              </p>

              <h2 className="text-xl font-bold text-slate-900 mt-4">Pro</h2>
              <p className="text-slate-600 mt-1">For founders & marketers</p>

              <p className="text-4xl font-extrabold mt-6 text-slate-900">
                $29
                <span className="text-base font-semibold text-slate-500">/month</span>
              </p>

              <ul className="mt-6 space-y-2 text-slate-600">
                <li>✅ Unlimited audits</li>
                <li>✅ AI Suggestions</li>
                <li>✅ PDF Export</li>
                <li>✅ Audit history</li>
              </ul>

              <button
                onClick={() => payNow("pro")}
                disabled={loadingPlan === "pro"}
                className="mt-8 w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {loadingPlan === "pro" ? "Processing..." : "Buy Pro Plan"}
              </button>

              {/* ✅ Razorpay Trust */}
              <div className="flex justify-center mt-4 opacity-95">
                <img src="/razorpay.svg" alt="Razorpay Trusted" className="h-8" />
              </div>
            </div>

            {/* ✅ AGENCY */}
            <div className="bg-white border rounded-2xl p-8 shadow-sm hover:shadow-lg transition card-hover">
              <h2 className="text-xl font-bold text-slate-900">Agency</h2>
              <p className="text-slate-600 mt-1">For teams & clients</p>

              <p className="text-4xl font-extrabold mt-6 text-slate-900">
                $99
                <span className="text-base font-semibold text-slate-500">/month</span>
              </p>

              <ul className="mt-6 space-y-2 text-slate-600">
                <li>✅ Employees management</li>
                <li>✅ Reports dashboard</li>
                <li>✅ Team access</li>
                <li>✅ Priority support</li>
              </ul>

              <button
                onClick={() => payNow("agency")}
                disabled={loadingPlan === "agency"}
                className="mt-8 w-full px-6 py-3 rounded-xl border font-semibold hover:bg-slate-50 transition disabled:opacity-60"
              >
                {loadingPlan === "agency" ? "Processing..." : "Buy Agency Plan"}
              </button>

              {/* ✅ Razorpay Trust */}
              <div className="flex justify-center mt-4 opacity-95">
                <img src="/razorpay.svg" alt="Razorpay Trusted" className="h-8" />
              </div>
            </div>
          </div>

          {/* ✅ Bottom Trust Note */}
          <div className="mt-12 text-center text-sm text-slate-500">
            ✅ Secure payments powered by Razorpay — UPI, Cards, Netbanking supported.
          </div>

        </div>
      </main>
    </>
  )
}
