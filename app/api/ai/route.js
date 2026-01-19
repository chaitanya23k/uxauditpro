import { NextResponse } from "next/server"

// ✅ Clean text (avoid weird characters in output)
function cleanText(text = "") {
  return String(text)
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

// ✅ Suggest fixes based on keywords in issues
function generateSuggestions(audit) {
  const url = cleanText(audit?.url || "")
  const score = Number(audit?.uxScore || 0)

  const issues = (audit?.issues || []).map((x) => cleanText(x))
  const recs = (audit?.recommendations || []).map((x) => cleanText(x))

  const suggestions = []

  // ✅ Intro summary
  suggestions.push(
    `Website: ${url || "N/A"}`
  )
  suggestions.push(
    `UX Score: ${score}/100`
  )

  if (score >= 85) {
    suggestions.push(
      `✅ Great UX! Small improvements can boost conversions even more.`
    )
  } else if (score >= 70) {
    suggestions.push(
      `✅ Good UX. Fixing a few high-impact issues can improve clarity & conversion rate.`
    )
  } else {
    suggestions.push(
      `⚠️ UX needs improvement. Prioritize CTA visibility, layout, mobile experience & trust signals.`
    )
  }

  suggestions.push("")
  suggestions.push("===================================")
  suggestions.push("✅ AI-Style Suggestions (Fallback)")
  suggestions.push("===================================")
  suggestions.push("")

  // ✅ Analyze issue keywords
  const allText = issues.join(" ").toLowerCase()

  if (allText.includes("cta") || allText.includes("button")) {
    suggestions.push("🚀 CTA Optimization")
    suggestions.push("- Make primary CTA button more visible above the fold")
    suggestions.push("- Use high contrast + large size (minimum 44px height)")
    suggestions.push("- Keep CTA text action-driven (e.g., “Get Started Free”)")
    suggestions.push("Impact: High conversion boost | Priority: HIGH | Effort: MEDIUM")
    suggestions.push("")
  }

  if (allText.includes("contrast") || allText.includes("readability")) {
    suggestions.push("🎨 Improve Contrast & Readability")
    suggestions.push("- Increase text contrast for headlines & paragraphs")
    suggestions.push("- Avoid light gray text on white backgrounds")
    suggestions.push("- Use consistent font sizing (16px+ on body text)")
    suggestions.push("Impact: Better clarity + trust | Priority: MEDIUM | Effort: LOW")
    suggestions.push("")
  }

  if (allText.includes("mobile") || allText.includes("responsive")) {
    suggestions.push("📱 Mobile UX Fixes")
    suggestions.push("- Increase padding and spacing between blocks")
    suggestions.push("- Ensure nav links & buttons are easy to tap")
    suggestions.push("- Test layout on 360px width (small mobile screens)")
    suggestions.push("Impact: Huge mobile conversion gain | Priority: HIGH | Effort: MEDIUM")
    suggestions.push("")
  }

  if (allText.includes("speed") || allText.includes("load") || allText.includes("performance")) {
    suggestions.push("⚡ Performance Optimization")
    suggestions.push("- Compress images and use modern formats (WebP/AVIF)")
    suggestions.push("- Lazy-load heavy sections")
    suggestions.push("- Reduce unused scripts & third-party tracking")
    suggestions.push("Impact: Better SEO + faster conversion | Priority: HIGH | Effort: HIGH")
    suggestions.push("")
  }

  if (allText.includes("form")) {
    suggestions.push("📝 Form Optimization")
    suggestions.push("- Reduce form fields to only required ones")
    suggestions.push("- Add autofill + validation hints")
    suggestions.push("- Use single-column layout for mobile")
    suggestions.push("Impact: More signups | Priority: HIGH | Effort: LOW")
    suggestions.push("")
  }

  if (allText.includes("trust") || allText.includes("reviews") || allText.includes("badge")) {
    suggestions.push("🛡️ Trust Signals")
    suggestions.push("- Add customer testimonials near pricing/CTA")
    suggestions.push("- Add secure payment badges & privacy text")
    suggestions.push("- Show real logos / numbers (clients served, reviews)")
    suggestions.push("Impact: Higher trust + more payments | Priority: HIGH | Effort: LOW")
    suggestions.push("")
  }

  // ✅ If nothing matched, still return strong generic advice
  if (suggestions.length <= 9) {
    suggestions.push("✅ General UX Improvements")
    suggestions.push("- Make hero headline clearer (who + what + benefit)")
    suggestions.push("- Keep layout clean with consistent spacing")
    suggestions.push("- Highlight one primary CTA across the page")
    suggestions.push("- Add FAQ section to reduce purchase hesitation")
    suggestions.push("Impact: Better clarity | Priority: MEDIUM | Effort: MEDIUM")
    suggestions.push("")
  }

  // ✅ Add your recommendations too
  if (recs.length > 0) {
    suggestions.push("===================================")
    suggestions.push("📌 Your Recommendations List")
    suggestions.push("===================================")
    suggestions.push("")

    recs.slice(0, 8).forEach((r, i) => {
      suggestions.push(`${i + 1}. ${r}`)
    })
    suggestions.push("")
  }

  suggestions.push("✅ Done! Upgrade to Gemini later for advanced AI suggestions.")

  return suggestions.join("\n")
}

export async function POST(req) {
  try {
    const body = await req.json()
    const audit = body?.audit

    if (!audit) {
      return NextResponse.json(
        { error: "Audit object missing in request body" },
        { status: 400 }
      )
    }

    const suggestions = generateSuggestions(audit)

    return NextResponse.json({ suggestions })
  } catch (err) {
    return NextResponse.json(
      { error: "AI Suggestions failed", details: err.message },
      { status: 500 }
    )
  }
}
