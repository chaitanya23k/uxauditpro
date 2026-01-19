"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import { getUser, upgradePlan } from "@/lib/auth"
import PayPalButton from "@/components/PayPalButton"

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [showPayPal, setShowPayPal] = useState(null) // "pro" | "agency"

  // ✅ Get logged-in user
  const user = getUser()
  const isLoggedIn = !!user

  async function payWithRazorpay(plan, amountUSD) {
    if (!isLoggedIn) {
      alert("Please login/signup first ✅")
      window.location.href = "/signup"
      return
    }

    setLoadingPlan(plan)

    try {
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountUSD, plan }),
      })

      const data = await res.json()

      if (!res.ok) {
        alert("❌ Order creation failed: " + (data?.error || data?.details))
        setLoadingPlan(null)
        return
      }

      const order = data.order

      const loaded = await loadRazorpayScript()
      if (!loaded) {
        alert("❌ Razorpay SDK failed to load.")
        setLoadingPlan(null)
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "UXAuditPro",
        description: `${plan.toUpperCase()} Plan`,
        order_id: order.id,

        handler: function () {
          upgradePlan(plan)
          alert(`✅ Payment successful! Upgraded to ${plan.toUpperCase()}`)
          window.location.href = plan === "agency" ? "/agency" : "/dashboard"
        },

        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },

        theme: { color: "#4f46e5" },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      alert("❌ Razorpay failed: " + err.message)
    }

    setLoadingPlan(null)
  }

  function chooseFree() {
    if (!isLoggedIn) {
      alert("Please login/signup first ✅")
      window.location.href = "/signup"
      return
    }

    upgradePlan("free")
    alert("✅ You are now on FREE plan")
    window.location.href = "/dashboard"
  }

  function onPayPalSuccess(details, plan) {
    upgradePlan(plan)
    alert(`✅ PayPal payment successful! Upgraded to ${plan.toUpperCase()}`)
    window.location.href = plan === "agency" ? "/agency" : "/dashboard"
  }

  function togglePayPal(plan) {
    if (!isLoggedIn) {
      alert("Please login/signup first ✅")
      window.location.href = "/signup"
      return
    }

    setShowPayPal(showPayPal === plan ? null : plan)
  }

  return (
    <>
      <Navbar />

      <main className="bg-slate-50 min-h-screen py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-extrabold text-slate-900">Pricing</h1>
            <p className="text-slate-600 mt-4 text-lg">
              Upgrade anytime. International payments supported ✅
            </p>

            <div className="mt-5 flex items-center justify-center gap-4 flex-wrap text-sm text-slate-500">
              <img src="/payments/razorpay.svg" alt="Razorpay" className="h-6" />
              <img src="/payments/paypal.svg" alt="PayPal" className="h-6" />
              <span className="font-semibold text-slate-700">
                Secure checkout (Razorpay / PayPal)
              </span>
            </div>

            {!isLoggedIn && (
              <p className="mt-4 text-sm text-red-500 font-semibold">
                ⚠️ Please login to purchase Pro or Agency plan.
              </p>
            )}
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {/* Free */}
            <PlanCard
              title="Free"
              price="$0"
              subtitle="Best for trying out"
              features={[
                "1 audit/day",
                "UX score",
                "Basic issues",
                "No AI Suggestions",
                "No PDF Export",
              ]}
              buttonText="Choose Free"
              onClick={chooseFree}
              type="outline"
            />

            {/* Pro */}
            <PlanCard
              highlight
              title="Pro"
              price="$29"
              subtitle="For founders & marketers"
              features={["Unlimited audits", "AI Suggestions", "PDF Export", "Audit history"]}
              buttonText={loadingPlan === "pro" ? "Processing..." : "Pay with Razorpay"}
              onClick={() => payWithRazorpay("pro", 29)}
              type="primary"
              disabled={loadingPlan === "pro" || !isLoggedIn}
              extra={
                <>
                  <button
                    onClick={() => togglePayPal("pro")}
                    disabled={!isLoggedIn}
                    className="w-full mt-3 border rounded-xl py-3 font-semibold hover:bg-white disabled:opacity-50"
                  >
                    Pay with PayPal
                  </button>

                  {showPayPal === "pro" && isLoggedIn && (
                    <div className="mt-4">
                      <PayPalButton
                        amount={29}
                        onSuccess={(details) => onPayPalSuccess(details, "pro")}
                      />
                    </div>
                  )}
                </>
              }
            />

            {/* Agency */}
            <PlanCard
              title="Agency"
              price="$99"
              subtitle="For teams & clients"
              features={[
                "Employees management",
                "Reports dashboard",
                "Team access",
                "Priority support",
              ]}
              buttonText={loadingPlan === "agency" ? "Processing..." : "Pay with Razorpay"}
              onClick={() => payWithRazorpay("agency", 99)}
              type="outline"
              disabled={loadingPlan === "agency" || !isLoggedIn}
              extra={
                <>
                  <button
                    onClick={() => togglePayPal("agency")}
                    disabled={!isLoggedIn}
                    className="w-full mt-3 border rounded-xl py-3 font-semibold hover:bg-white disabled:opacity-50"
                  >
                    Pay with PayPal
                  </button>

                  {showPayPal === "agency" && isLoggedIn && (
                    <div className="mt-4">
                      <PayPalButton
                        amount={99}
                        onSuccess={(details) => onPayPalSuccess(details, "agency")}
                      />
                    </div>
                  )}
                </>
              }
            />
          </div>
        </div>
      </main>
    </>
  )
}

/* ✅ Plan Card UI */
function PlanCard({
  title,
  price,
  subtitle,
  features,
  buttonText,
  onClick,
  type = "outline",
  highlight = false,
  disabled = false,
  extra = null,
}) {
  return (
    <div
      className={`bg-white border rounded-2xl p-7 shadow-sm hover:shadow-lg transition ${
        highlight ? "border-2 border-indigo-600" : ""
      }`}
    >
      {highlight && (
        <p className="text-xs inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold">
          MOST POPULAR
        </p>
      )}

      <h2 className="text-xl font-bold mt-4 text-slate-900">{title}</h2>
      <p className="text-slate-600 mt-1">{subtitle}</p>

      <p className="text-4xl font-extrabold mt-6 text-slate-900">{price}</p>
      {title !== "Free" && <p className="text-sm text-slate-500 -mt-1">per month</p>}

      <ul className="mt-6 space-y-2 text-slate-600 text-sm">
        {features.map((f, i) => (
          <li key={i}>✅ {f}</li>
        ))}
      </ul>

      <button
        onClick={onClick}
        disabled={disabled}
        className={`mt-8 w-full px-6 py-3 rounded-xl font-bold transition disabled:opacity-60 ${
          type === "primary"
            ? "bg-indigo-600 text-white hover:bg-indigo-700"
            : "border hover:bg-slate-50"
        }`}
      >
        {buttonText}
      </button>

      {extra}
    </div>
  )
}

/* ✅ Razorpay loader */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
