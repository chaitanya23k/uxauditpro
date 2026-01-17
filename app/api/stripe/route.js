import Stripe from "stripe"
import { NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST() {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "UXAuditPro Pro Plan"
          },
          unit_amount: 2900,
          recurring: { interval: "month" }
        },
        quantity: 1
      }
    ],
    success_url: "http://localhost:3000/dashboard",
    cancel_url: "http://localhost:3000/pricing"
  })

  return NextResponse.json({ url: session.url })
}
