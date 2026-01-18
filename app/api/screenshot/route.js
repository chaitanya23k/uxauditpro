import { NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req) {
  try {
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const key = process.env.SCREENSHOTONE_KEY
    if (!key) {
      return NextResponse.json(
        { error: "SCREENSHOTONE_KEY missing in env" },
        { status: 500 }
      )
    }

    const apiUrl = `https://api.screenshotone.com/take?access_key=${key}&url=${encodeURIComponent(
      url
    )}&full_page=true&format=png&viewport_width=1366&viewport_height=768&device_scale_factor=2&block_ads=true&block_cookie_banners=true&cache=false&timeout=60`

    const imageRes = await fetch(apiUrl)

    if (!imageRes.ok) {
      return NextResponse.json(
        { error: "Screenshot fetch failed", details: await imageRes.text() },
        { status: 500 }
      )
    }

    const arrayBuffer = await imageRes.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")

    return NextResponse.json({
      image: `data:image/png;base64,${base64}`,
    })
  } catch (err) {
    return NextResponse.json(
      { error: "Screenshot API failed", details: err.message },
      { status: 500 }
    )
  }
}
