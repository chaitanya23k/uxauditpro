import { NextResponse } from "next/server"
import Razorpay from "razorpay"

export async function POST(req) {
  try {
    const { amount, plan } = await req.json()

    if (!amount || !plan) {
      return NextResponse.json(
        { error: "amount and plan are required" },
        { status: 400 }
      )
    }

    // ✅ Razorpay keys must be SERVER SIDE ONLY
    const key_id = process.env.RAZORPAY_KEY_ID
    const key_secret = process.env.RAZORPAY_KEY_SECRET

    if (!key_id || !key_secret) {
      return NextResponse.json(
        { error: "Razorpay keys missing in environment variables" },
        { status: 500 }
      )
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    })

    // ✅ Convert USD → INR (Approx)
    // You can change this rate anytime
    const usdToInrRate = 83
    const amountInINR = Math.round(Number(amount) * usdToInrRate)

    const order = await razorpay.orders.create({
      amount: amountInINR * 100, // ✅ paise
      currency: "INR",
      receipt: `receipt_${plan}_${Date.now()}`,
      notes: {
        plan,
        originalUSD: amount,
      },
    })

    return NextResponse.json({ order })
  } catch (err) {
    return NextResponse.json(
      {
        error: "Order creation failed",
        details: err?.message || "Unknown error",
      },
      { status: 500 }
    )
  }
}
