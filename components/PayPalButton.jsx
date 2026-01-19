"use client"

import { useEffect, useRef, useState } from "react"

export default function PayPalButton({ amount, onSuccess }) {
  const paypalRef = useRef(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

    if (!clientId) {
      setError("PayPal Client ID missing in env ✅")
      return
    }

    // ✅ Prevent duplicate script
    const existingScript = document.getElementById("paypal-sdk")
    if (existingScript) {
      setLoaded(true)
      renderButton()
      return
    }

    const script = document.createElement("script")
    script.id = "paypal-sdk"
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=USD`
    script.async = true

    script.onload = () => {
      setLoaded(true)
      renderButton()
    }

    script.onerror = () => {
      setError("PayPal SDK failed to load ❌ (blocked or invalid client ID)")
    }

    document.body.appendChild(script)

    function renderButton() {
      if (!window.paypal || !paypalRef.current) return

      window.paypal
        .Buttons({
          style: {
            layout: "vertical",
            color: "gold",
            shape: "rect",
            label: "paypal",
          },

          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    value: String(amount),
                  },
                },
              ],
            })
          },

          onApprove: async (data, actions) => {
            const details = await actions.order.capture()
            onSuccess(details)
          },

          onError: (err) => {
            console.log("PayPal Error:", err)
            setError("PayPal Payment failed ❌")
          },
        })
        .render(paypalRef.current)
    }
  }, [amount])

  return (
    <div className="w-full">
      {error && (
        <p className="text-red-600 text-sm font-semibold mb-2">{error}</p>
      )}

      {!loaded && !error && (
        <p className="text-slate-500 text-sm mb-2">Loading PayPal...</p>
      )}

      <div ref={paypalRef} />
    </div>
  )
}
