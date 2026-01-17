import { NextResponse } from "next/server"

function scoreFromUrl(url) {
  let sum = 0
  for (let i = 0; i < url.length; i++) sum += url.charCodeAt(i)
  return 55 + (sum % 45) // score between 55–99
}

function pickIssues(score) {
  const all = [
    "Missing alt attributes on images",
    "Low contrast text detected",
    "CTA not clearly visible above the fold",
    "Too many form fields",
    "Navigation is confusing on mobile",
    "Slow page load on 3G network",
    "Inconsistent button styling",
    "Lack of trust signals near CTA"
  ]

  const count = score < 70 ? 5 : score < 85 ? 4 : 3
  return all.slice(0, count)
}

function pickRecommendations() {
  return [
    "Move your primary CTA above the fold",
    "Reduce form fields (only ask required data)",
    "Add testimonials & trust badges near CTA",
    "Improve text contrast for readability",
    "Optimize images and lazy-load heavy sections"
  ]
}

export async function POST(request) {
  try {
    const { url } = await request.json()
    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const uxScore = scoreFromUrl(url)
    const issues = pickIssues(uxScore)
    const recommendations = pickRecommendations().slice(0, issues.length)

    return NextResponse.json({
      url,
      uxScore,
      issues,
      recommendations,
      createdAt: new Date().toISOString()
    })
  } catch (e) {
    return NextResponse.json({ error: "Audit failed" }, { status: 500 })
  }
}
