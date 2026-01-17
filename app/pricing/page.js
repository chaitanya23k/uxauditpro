"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import { getUser, upgradePlan } from "@/lib/auth"

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState(null)

  async function payAndUpgrade(plan, amountUSD) {
    const user = getUser()

    if (!user) {
      alert("Please login/signup first.")
      window.location.href = "/signup"
      return
    }

    setLoadingPlan(plan)

    try {
      // ✅ Step 1: Create Razorpay order
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountUSD, // we send USD amount, backend will handle INR conversion if needed
          plan,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert("❌ Order creation failed: " + (data?.error || data?.details || "Unknown error"))
        setLoadingPlan(null)
        return
      }

      const order = data.order

      // ✅ Step 2: Load Razorpay script
      const loaded = await loadRazorpayScript()
      if (!loaded) {
        alert("❌ Razorpay SDK failed to load. Check your internet connection.")
        setLoadingPlan(null)
        return
      }

      // ✅ Step 3: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // ✅ must be set in env
        amount: order.amount,
        currency: order.currency,
        name: "UXAuditPro",
        description: `${plan.toUpperCase()} Plan Upgrade`,
        order_id: order.id,

        handler: function () {
          // ✅ Payment successful → upgrade user plan
          upgradePlan(plan)
          alert(`✅ Payment successful! Upgraded to ${plan.toUpperCase()} plan.`)

          // ✅ Redirect
          if (plan === "agency") window.location.href = "/agency"
          else window.location.href = "/dashboard"
        },

        prefill: {
          name: user.name || "",
          email: user.email || "",
        },

        theme: {
          color: "#4f46e5",
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      alert("❌ Payment failed: " + err.message)
    }

    setLoadingPlan(null)
  }

  function chooseFree() {
    const user = getUser()

    if (!user) {
      alert("Please login/signup first.")
      window.location.href = "/signup"
      return
    }

    upgradePlan("free")
    alert("✅ You are now on FREE plan!")
    window.location.href = "/dashboard"
  }

  return (
    <>
      <Navbar />

      <main className="container-main py-16">
        {/* ✅ Header */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-4xl font-extrabold text-slate-900">Pricing</h1>

          <p className="text-slate-600 mt-4 text-lg">
            Upgrade anytime. International payments supported ✅
          </p>

          {/* ✅ Payment trust strip */}
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap text-sm text-slate-500">
            <img src="/payments/razorpay.svg" alt="Razorpay" className="h-6" />
            <img src="/payments/paypal.svg" alt="PayPal" className="h-6" />
            <span className="font-semibold text-slate-600">
              Secured Checkout (Razorpay / PayPal)
            </span>
          </div>
        </div>

        {/* ✅ Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-14">
          {/* ✅ Free */}
          <div className="border rounded-2xl p-8 bg-white shadow-sm hover:shadow-lg transition">
            <h2 className="text-xl font-bold text-slate-900">Free</h2>
            <p className="text-slate-600 mt-1">Best for trying out</p>

            <p className="text-4xl font-extrabold mt-6 text-slate-900">$0</p>

            <ul className="mt-6 space-y-2 text-slate-600">
              <li>✅ 1 audit/day</li>
              <li>✅ UX score</li>
              <li>✅ Basic issues</li>
              <li>❌ AI Suggestions</li>
              <li>❌ PDF Export</li>
            </ul>

            <button
              onClick={chooseFree}
              className="mt-8 w-full px-6 py-3 rounded-xl border font-semibold hover:bg-slate-50 transition"
            >
              Choose Free
            </button>
          </div>

          {/* ✅ Pro */}
          <div className="border-2 border-indigo-600 rounded-2xl p-8 bg-white shadow-md hover:shadow-xl transition">
            <p className="text-xs inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold">
              MOST POPULAR
            </p>

            <h2 className="text-xl font-bold mt-4 text-slate-900">Pro</h2>
            <p className="text-slate-600 mt-1">For founders & marketers</p>

            <p className="text-4xl font-extrabold mt-6 text-slate-900">$29</p>
            <p className="text-sm text-slate-500 -mt-1">per month</p>

            <ul className="mt-6 space-y-2 text-slate-600">
              <li>✅ Unlimited audits</li>
              <li>✅ AI Suggestions</li>
              <li>✅ PDF Export</li>
              <li>✅ Audit history</li>
            </ul>

            <button
              onClick={() => payAndUpgrade("pro", 29)}
              disabled={loadingPlan === "pro"}
              className="mt-8 w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {loadingPlan === "pro" ? "Processing..." : "Buy Pro Plan"}
            </button>

            <PaymentTrust />
          </div>

          {/* ✅ Agency */}
          <div className="border rounded-2xl p-8 bg-white shadow-sm hover:shadow-lg transition">
            <h2 className="text-xl font-bold text-slate-900">Agency</h2>
            <p className="text-slate-600 mt-1">For teams & clients</p>

            <p className="text-4xl font-extrabold mt-6 text-slate-900">$99</p>
            <p className="text-sm text-slate-500 -mt-1">per month</p>

            <ul className="mt-6 space-y-2 text-slate-600">
              <li>✅ Employees management</li>
              <li>✅ Reports dashboard</li>
              <li>✅ Team access</li>
              <li>✅ Priority support</li>
            </ul>

            <button
              onClick={() => payAndUpgrade("agency", 99)}
              disabled={loadingPlan === "agency"}
              className="mt-8 w-full px-6 py-3 rounded-xl border font-semibold hover:bg-slate-50 transition disabled:opacity-60"
            >
              {loadingPlan === "agency" ? "Processing..." : "Buy Agency Plan"}
            </button>

            <PaymentTrust />
          </div>
        </div>
      </main>
    </>
  )
}

/* ✅ Razorpay script loader */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

/* ✅ Trust footer (reusable) */
function PaymentTrust() {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 text-xs text-slate-500">
      <div className="flex items-center gap-2">
        <img src="/payments/razorpay.svg" alt="Razorpay" className="h-5" />
        <span className="text-slate-400">|</span>
        <img src="/payments/paypal.svg" alt="PayPal" className="h-5" />
      </div>

      <p className="text-center">
        International payments supported ✅
      </p>
    </div>
  )
}
