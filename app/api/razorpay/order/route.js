import { NextResponse } from "next/server"
import Razorpay from "razorpay"

export async function POST(req) {
  try {
    const { amount } = await req.json()

    if (!amount) {
      return NextResponse.json({ error: "Amount missing" }, { status: 400 })
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay needs paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    })

    return NextResponse.json(order)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
