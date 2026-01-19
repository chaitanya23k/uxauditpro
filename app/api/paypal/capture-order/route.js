import { NextResponse } from "next/server"

export const runtime = "nodejs"

function getBase() {
  return process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com"
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_SECRET

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
    const { orderID } = await req.json()

    if (!orderID) {
      return NextResponse.json({ error: "orderID required" }, { status: 400 })
    }

    const token = await getAccessToken()

    const captureRes = await fetch(
      `${getBase()}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )

    const captureData = await captureRes.json()
    if (!captureRes.ok) throw new Error(captureData?.message || "Capture failed")

    return NextResponse.json({ success: true, captureData })
  } catch (err) {
    return NextResponse.json(
      { error: "PayPal capture failed", details: err.message },
      { status: 500 }
    )
  }
}
