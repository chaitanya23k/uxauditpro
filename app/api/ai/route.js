import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export const runtime = "nodejs"

export async function POST(req) {
  try {
    const { audit } = await req.json()

    if (!audit) {
      return NextResponse.json({ error: "Audit data missing" }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY missing in .env.local" },
        { status: 500 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    // ✅ MOST SAFE MODEL NAME (works for majority of users)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `
You are a senior UX consultant.

Website: ${audit.url}
UX Score: ${audit.uxScore}

Issues:
${(audit.issues || []).map((x, i) => `${i + 1}. ${x}`).join("\n")}

Recommendations:
${(audit.recommendations || []).map((x, i) => `${i + 1}. ${x}`).join("\n")}

Now write a clean UX improvement report with:
✅ Priority (High/Medium/Low)
✅ Conversion impact
✅ Fix effort (Low/Medium/High)
✅ Quick wins first
✅ A short final summary
`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return NextResponse.json({
      suggestions: text,
    })
  } catch (err) {
    return NextResponse.json(
      { error: "AI Suggestions failed", details: err.message },
      { status: 500 }
    )
  }
}
