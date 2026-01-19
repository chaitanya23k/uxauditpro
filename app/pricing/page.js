"use client"

import { useState } from "react"
import Navbar from "@/components/Navbar"
import { getUser, upgradePlan } from "@/lib/auth"
import { loadScript } from "@paypal/paypal-js"

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [paypalOpen, setPaypalOpen] = useState(false)

  async function payWithRazorpay(plan, amountUSD) {
    const user = getUser()

    if (!user) {
      alert("Please login/signup first.")
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
        alert("❌ Order creation failed: " + (data?.details || data?.error))
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
        description: `${plan.toUpperCase()} Plan Upgrade`,
        order_id: order.id,
        handler: function () {
          upgradePlan(plan)
          alert(`✅ Payment successful! Upgraded to ${plan.toUpperCase()}.`)
          if (plan === "agency") window.location.href = "/agency"
          else window.location.href = "/dashboard"
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: { color: "#4f46e5" },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      alert("❌ Payment failed: " + err.message)
    }

    setLoadingPlan(null)
  }

  async function payWithPayPal(plan) {
    const user = getUser()

    if (!user) {
      alert("Please login/signup first.")
      window.location.href = "/signup"
      return
    }

    setLoadingPlan(plan)
    setPaypalOpen(true)

    try {
      await loadScript({
        "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
        currency: "USD",
      })

      const orderRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        alert("❌ PayPal order failed: " + (orderData.details || orderData.error))
        setLoadingPlan(null)
        setPaypalOpen(false)
        return
      }

      const orderID = orderData.orderID

      window.paypal
        .Buttons({
          createOrder: () => orderID,
          onApprove: async (data) => {
            const captureRes = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID }),
            })

            const captureData = await captureRes.json()

            if (!captureRes.ok) {
              alert("❌ PayPal capture failed: " + (captureData.details || captureData.error))
              return
            }

            upgradePlan(plan)
            alert(`✅ PayPal payment successful! Upgraded to ${plan.toUpperCase()}.`)
            if (plan === "agency") window.location.href = "/agency"
            else window.location.href = "/dashboard"
          },
          onCancel: () => alert("❌ Payment cancelled."),
          onError: (err) => alert("❌ PayPal error: " + err.message),
        })
        .render("#paypal-button-container")
    } catch (err) {
      alert("❌ PayPal failed: " + err.message)
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

      <main className="bg-slate-50 py-12 px-4">
        {/* ✅ Header */}
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            Pricing
          </h1>
          <p className="text-slate-600 mt-3 text-base">
            Upgrade anytime. Pay with Razorpay (India) or PayPal (International) ✅
          </p>

          <div className="mt-5 flex items-center justify-center gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <img src="/payments/razorpay.svg" alt="Razorpay" className="h-5" />
              <span>Razorpay</span>
            </div>
            <span className="text-slate-400">|</span>
            <div className="flex items-center gap-2">
              <img src="/payments/paypal.svg" alt="PayPal" className="h-5" />
              <span>PayPal</span>
            </div>
          </div>
        </div>

        {/* ✅ Cards (Perfect Size) */}
        <div className="max-w-5xl mx-auto mt-10 grid md:grid-cols-3 gap-6">
          {/* ✅ Free */}
          <PlanCard
            title="Free"
            subtitle="Best for trying out"
            price="$0"
            features={[
              "✅ 1 audit/day",
              "✅ UX score",
              "✅ Basic issues",
              "❌ AI Suggestions",
              "❌ PDF Export",
            ]}
            buttonText="Choose Free"
            onClick={chooseFree}
            buttonStyle="border hover:bg-white"
          />

          {/* ✅ Pro */}
          <PlanCard
            featured
            title="Pro"
            subtitle="For founders & marketers"
            price="$35"
            subPrice="per month"
            features={[
              "✅ Unlimited audits",
              "✅ AI Suggestions",
              "✅ PDF Export",
              "✅ Audit history",
            ]}
            buttonText={loadingPlan === "pro" ? "Processing..." : "Pay with Razorpay"}
            onClick={() => payWithRazorpay("pro", 29)}
            buttonStyle="bg-indigo-600 text-white hover:bg-indigo-700"
            extraButton={{
              text: "Pay with PayPal",
              onClick: () => payWithPayPal("pro"),
            }}
            loading={loadingPlan === "pro"}
          />

          {/* ✅ Agency */}
          <PlanCard
            title="Agency"
            subtitle="For teams & clients"
            price="$99"
            subPrice="per month"
            features={[
              "✅ Employee management",
              "✅ Reports dashboard",
              "✅ Team access",
              "✅ Priority support",
            ]}
            buttonText={loadingPlan === "agency" ? "Processing..." : "Pay with Razorpay"}
            onClick={() => payWithRazorpay("agency", 99)}
            buttonStyle="bg-slate-900 text-white hover:bg-black"
            extraButton={{
              text: "Pay with PayPal",
              onClick: () => payWithPayPal("agency"),
            }}
            loading={loadingPlan === "agency"}
          />
        </div>

        {/* ✅ PayPal Section */}
        {paypalOpen && (
          <div className="mt-10 max-w-lg mx-auto bg-white border rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 text-center">
              PayPal Checkout
            </h3>
            <p className="text-sm text-slate-600 text-center mt-2">
              Secure international payment powered by PayPal ✅
            </p>

            <div id="paypal-button-container" className="mt-5" />

            <button
              onClick={() => setPaypalOpen(false)}
              className="mt-5 w-full px-5 py-2.5 rounded-xl border font-semibold hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        )}
      </main>
    </>
  )
}

/* ✅ Reusable Plan Card */
function PlanCard({
  title,
  subtitle,
  price,
  subPrice,
  features,
  buttonText,
  onClick,
  buttonStyle,
  featured,
  extraButton,
  loading,
}) {
  return (
    <div
      className={`bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition ${
        featured ? "border-2 border-indigo-600 scale-[1.02]" : ""
      }`}
    >
      {featured && (
        <p className="text-[11px] inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold">
          MOST POPULAR
        </p>
      )}

      <h2 className="text-lg font-bold mt-3 text-slate-900">{title}</h2>
      <p className="text-slate-600 text-sm mt-1">{subtitle}</p>

      <p className="text-3xl font-extrabold mt-5 text-slate-900">{price}</p>
      {subPrice && <p className="text-xs text-slate-500 -mt-1">{subPrice}</p>}

      <ul className="mt-5 space-y-2 text-sm text-slate-700">
        {features.map((f, idx) => (
          <li key={idx}>{f}</li>
        ))}
      </ul>

      <button
        disabled={loading}
        onClick={onClick}
        className={`mt-6 w-full px-5 py-2.5 rounded-xl font-semibold transition disabled:opacity-60 ${buttonStyle}`}
      >
        {buttonText}
      </button>

      {extraButton && (
        <button
          onClick={extraButton.onClick}
          disabled={loading}
          className="mt-3 w-full px-5 py-2.5 rounded-xl border font-semibold hover:bg-slate-50 transition disabled:opacity-60"
        >
          {extraButton.text}
        </button>
      )}
    </div>
  )
}

/* ✅ Razorpay SDK Loader */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}


