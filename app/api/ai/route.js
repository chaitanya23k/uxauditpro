import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req) {
  try {
    const { audit } = await req.json()

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    // ✅ Working model name
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })

    const prompt = `
You are a UX expert.
Based on this UX audit report, give 8 clear improvement suggestions.
Use bullet points.
Audit Data:
${JSON.stringify(audit, null, 2)}
`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    return NextResponse.json({ suggestions: text })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
