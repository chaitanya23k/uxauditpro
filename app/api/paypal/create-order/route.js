import { NextResponse } from "next/server"

export const runtime = "nodejs"

function getBase() {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"
}

// ✅ Get PayPal access token
async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_SECRET

  if (!clientId || !secret) {
    throw new Error("PayPal keys missing in env")
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64")

  const res = await fetch(`${getBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data?.error_description || "Token failed")

  return data.access_token
}

export async function POST(req) {
  try {
    const { plan } = await req.json()

    if (!plan) {
      return NextResponse.json({ error: "Plan required" }, { status: 400 })
    }

    const amount =
      plan === "pro" ? "29.00" : plan === "agency" ? "99.00" : "0.00"

    if (amount === "0.00") {
      return NextResponse.json({ error: "Free plan no payment needed" }, { status: 400 })
    }

    const token = await getAccessToken()

    const orderRes = await fetch(`${getBase()}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amount,
            },
            description: `UXAuditPro ${plan.toUpperCase()} Plan`,
          },
        ],
      }),
    })

    const orderData = await orderRes.json()
    if (!orderRes.ok) throw new Error(orderData?.message || "Order failed")

    return NextResponse.json({ orderID: orderData.id })
  } catch (err) {
    return NextResponse.json(
      { error: "PayPal create order failed", details: err.message },
      { status: 500 }
    )
  }
}
