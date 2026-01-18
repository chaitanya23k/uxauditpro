import { NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import sharp from "sharp"

export const runtime = "nodejs"

// ✅ Clean safe text
function cleanText(text = "") {
  return String(text)
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function wrapText(text, maxChars = 90) {
  const safe = cleanText(text)
  const words = safe.split(" ")
  const lines = []
  let line = ""

  for (let w of words) {
    if ((line + " " + w).trim().length > maxChars) {
      lines.push(line.trim())
      line = w
    } else {
      line = (line + " " + w).trim()
    }
  }
  if (line.trim()) lines.push(line.trim())
  return lines
}

// ✅ Categories scoring (demo)
function buildCategoryScores(score = 70) {
  const base = Number(score || 70)
  const clamp = (n) => Math.max(10, Math.min(98, n))

  return [
    { name: "Clarity & Messaging", score: clamp(base - 5) },
    { name: "Visual Hierarchy", score: clamp(base - 8) },
    { name: "Navigation", score: clamp(base - 10) },
    { name: "Mobile UX", score: clamp(base - 12) },
    { name: "Accessibility", score: clamp(base - 14) },
    { name: "Performance", score: clamp(base - 9) },
    { name: "Trust Signals", score: clamp(base - 11) },
    { name: "Conversion Optimization", score: clamp(base - 7) },
  ]
}

// ✅ Suggest annotation boxes based on issues
function getAnnotations(issues = []) {
  const lower = issues.map((i) => String(i).toLowerCase())
  const annotations = []

  if (lower.some((x) => x.includes("cta"))) {
    annotations.push({
      label: "CTA Visibility",
      color: rgb(1, 0.2, 0.2),
      x: 60,
      y: 360,
      w: 180,
      h: 80,
    })
  }

  if (lower.some((x) => x.includes("contrast"))) {
    annotations.push({
      label: "Low Contrast",
      color: rgb(1, 0.6, 0.0),
      x: 280,
      y: 320,
      w: 200,
      h: 80,
    })
  }

  if (lower.some((x) => x.includes("mobile"))) {
    annotations.push({
      label: "Mobile Layout",
      color: rgb(0.2, 0.6, 1),
      x: 60,
      y: 250,
      w: 160,
      h: 70,
    })
  }

  if (lower.some((x) => x.includes("trust"))) {
    annotations.push({
      label: "Trust Signals",
      color: rgb(0.2, 0.8, 0.3),
      x: 280,
      y: 240,
      w: 190,
      h: 70,
    })
  }

  return annotations.slice(0, 4)
}

// ✅ Priority & Effort logic
function priorityEffort(issue = "") {
  const i = String(issue).toLowerCase()

  if (i.includes("cta") || i.includes("conversion")) {
    return { priority: "HIGH", effort: "MEDIUM", impact: "Big conversion impact" }
  }
  if (i.includes("speed") || i.includes("load") || i.includes("performance")) {
    return { priority: "HIGH", effort: "HIGH", impact: "Revenue + SEO impact" }
  }
  if (i.includes("contrast") || i.includes("accessibility")) {
    return { priority: "MEDIUM", effort: "LOW", impact: "Improves readability & trust" }
  }
  if (i.includes("mobile")) {
    return { priority: "HIGH", effort: "MEDIUM", impact: "Mobile users convert more" }
  }

  return { priority: "MEDIUM", effort: "MEDIUM", impact: "Improves UX clarity" }
}

// ✅ Add new page helper
function addNewPage(pdfDoc) {
  return pdfDoc.addPage([595, 842])
}

export async function POST(req) {
  try {
    const audit = await req.json()

    const role = audit?.role || "user"
    const plan = audit?.plan || "free"

    const isAgency = plan === "agency" || role === "agency"
    const isProOrAgency = plan === "pro" || plan === "agency" || role === "admin"

    const pdfDoc = await PDFDocument.create()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    const primary = rgb(79 / 255, 70 / 255, 229 / 255)
    const grayText = rgb(0.35, 0.35, 0.35)

    // ✅ PAGE 1: COVER PAGE
    {
      const page = addNewPage(pdfDoc)
      const { width, height } = page.getSize()

      page.drawRectangle({ x: 0, y: 0, width, height, color: primary })

      page.drawText("UX Audit Report", {
        x: 60,
        y: height - 140,
        size: 34,
        font: fontBold,
        color: rgb(1, 1, 1),
      })

      page.drawText(`Website: ${cleanText(audit.url || "N/A")}`, {
        x: 60,
        y: height - 190,
        size: 14,
        font,
        color: rgb(1, 1, 1),
      })

      page.drawText(`UX Score: ${Number(audit.uxScore || 0)}/100`, {
        x: 60,
        y: height - 220,
        size: 14,
        font,
        color: rgb(1, 1, 1),
      })

      if (isAgency) {
        const agencyName = cleanText(audit.agencyName || "Your Agency")
        const agencyWebsite = cleanText(audit.agencyWebsite || "website.com")

        page.drawText("Client Ready • White Label PDF", {
          x: 60,
          y: height - 260,
          size: 14,
          font: fontBold,
          color: rgb(1, 1, 1),
        })

        page.drawText(`Prepared by: ${agencyName}`, {
          x: 60,
          y: height - 290,
          size: 13,
          font,
          color: rgb(1, 1, 1),
        })

        page.drawText(`Agency Website: ${agencyWebsite}`, {
          x: 60,
          y: height - 315,
          size: 12,
          font,
          color: rgb(1, 1, 1),
        })
      } else {
        page.drawText("Prepared by UXAuditPro • WebDigiz", {
          x: 60,
          y: height - 270,
          size: 14,
          font: fontBold,
          color: rgb(1, 1, 1),
        })

        page.drawText("www.webdigiz.com", {
          x: 60,
          y: height - 295,
          size: 12,
          font,
          color: rgb(1, 1, 1),
        })
      }
    }

    // ✅ PAGE 2: CATEGORY SCORES
    {
      const page = addNewPage(pdfDoc)
      const { width, height } = page.getSize()

      page.drawRectangle({
        x: 0,
        y: height - 80,
        width,
        height: 80,
        color: primary,
      })

      page.drawText("UXAuditPro — Detailed Report", {
        x: 40,
        y: height - 52,
        size: 18,
        font: fontBold,
        color: rgb(1, 1, 1),
      })

      page.drawText(`Website: ${cleanText(audit.url || "N/A")}`, {
        x: 40,
        y: height - 70,
        size: 11,
        font,
        color: rgb(1, 1, 1),
      })

      const score = Number(audit.uxScore || 0)

      page.drawRectangle({
        x: 40,
        y: height - 170,
        width: width - 80,
        height: 70,
        color: rgb(0.97, 0.97, 1),
        borderColor: rgb(0.9, 0.9, 0.96),
        borderWidth: 1,
      })

      page.drawText("UX Score", {
        x: 60,
        y: height - 140,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      })

      page.drawText(`${score}/100`, {
        x: 60,
        y: height - 160,
        size: 22,
        font: fontBold,
        color: score >= 75 ? rgb(0.1, 0.7, 0.2) : rgb(0.9, 0.2, 0.2),
      })

      page.drawText("Category Score Breakdown", {
        x: 40,
        y: height - 240,
        size: 14,
        font: fontBold,
        color: rgb(0.1, 0.1, 0.1),
      })

      const categories = buildCategoryScores(score)
      let y = height - 270

      categories.forEach((cat) => {
        page.drawText(cat.name, {
          x: 45,
          y,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2),
        })

        page.drawRectangle({
          x: 220,
          y: y - 3,
          width: 280,
          height: 10,
          color: rgb(0.92, 0.92, 0.95),
        })

        page.drawRectangle({
          x: 220,
          y: y - 3,
          width: (280 * cat.score) / 100,
          height: 10,
          color: primary,
        })

        page.drawText(String(cat.score), {
          x: 515,
          y,
          size: 10,
          font: fontBold,
          color: rgb(0.2, 0.2, 0.2),
        })

        y -= 20
      })
    }

    // ✅ PAGE 3: SCREENSHOT + ANNOTATIONS
    if (isProOrAgency) {
      const page = addNewPage(pdfDoc)
      const { width, height } = page.getSize()

      page.drawRectangle({
        x: 0,
        y: height - 70,
        width,
        height: 70,
        color: primary,
      })

      page.drawText("Website Screenshot (Auto Captured)", {
        x: 40,
        y: height - 45,
        size: 16,
        font: fontBold,
        color: rgb(1, 1, 1),
      })

      let screenshotPng = null

      if (audit?.screenshot && audit.screenshot.startsWith("data:image")) {
        const base64 = audit.screenshot.split(",")[1]
        const imgBuffer = Buffer.from(base64, "base64")

        const safePng = await sharp(imgBuffer).png().toBuffer()
        screenshotPng = await pdfDoc.embedPng(safePng)
      }

      if (screenshotPng) {
        const maxW = width - 80
        const maxH = 420

        const imgDims = screenshotPng.scale(1)
        const ratio = Math.min(maxW / imgDims.width, maxH / imgDims.height)

        const drawW = imgDims.width * ratio
        const drawH = imgDims.height * ratio

        const x = 40
        const y = height - 520

        page.drawRectangle({
          x: 35,
          y: y - 5,
          width: drawW + 10,
          height: drawH + 10,
          color: rgb(1, 1, 1),
          borderColor: rgb(0.85, 0.85, 0.9),
          borderWidth: 1,
        })

        page.drawImage(screenshotPng, {
          x,
          y,
          width: drawW,
          height: drawH,
        })

        const annotations = getAnnotations(audit.issues || [])

        annotations.forEach((a) => {
          page.drawRectangle({
            x: x + a.x,
            y: y + a.y,
            width: a.w,
            height: a.h,
            borderColor: a.color,
            borderWidth: 3,
          })

          page.drawText(a.label, {
            x: x + a.x,
            y: y + a.y + a.h + 6,
            size: 10,
            font: fontBold,
            color: a.color,
          })
        })
      } else {
        page.drawText("Screenshot not available for this website.", {
          x: 40,
          y: height - 140,
          size: 11,
          font,
          color: rgb(0.6, 0.2, 0.2),
        })
      }
    }

    // ✅ PAGE 4: ISSUES + WHY THIS MATTERS
    {
      const page = addNewPage(pdfDoc)
      const { width, height } = page.getSize()

      page.drawRectangle({
        x: 0,
        y: height - 70,
        width,
        height: 70,
        color: primary,
      })

      page.drawText("Issues + Why This Matters", {
        x: 40,
        y: height - 45,
        size: 16,
        font: fontBold,
        color: rgb(1, 1, 1),
      })

      let y = height - 110

      const issues = audit.issues || []
      issues.slice(0, 7).forEach((issue, idx) => {
        const meta = priorityEffort(issue)

        page.drawRectangle({
          x: 40,
          y: y - 65,
          width: width - 80,
          height: 70,
          color: rgb(0.98, 0.98, 1),
          borderColor: rgb(0.9, 0.9, 0.96),
          borderWidth: 1,
        })

        page.drawText(`${idx + 1}. ${cleanText(issue)}`, {
          x: 55,
          y: y - 20,
          size: 11,
          font: fontBold,
          color: rgb(0.15, 0.15, 0.15),
        })

        page.drawText(`Impact: ${meta.impact}`, {
          x: 55,
          y: y - 38,
          size: 10,
          font,
          color: grayText,
        })

        page.drawText(`Priority: ${meta.priority}  |  Fix Effort: ${meta.effort}`, {
          x: 55,
          y: y - 53,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2),
        })

        y -= 85
      })
    }

    // ✅ PAGE 5: RECOMMENDATIONS + BEFORE/AFTER
    {
      const page = addNewPage(pdfDoc)
      const { height } = page.getSize()

      page.drawRectangle({
        x: 0,
        y: height - 70,
        width: 595,
        height: 70,
        color: primary,
      })

      page.drawText("Recommendations + Ideal Layout Example", {
        x: 40,
        y: height - 45,
        size: 16,
        font: fontBold,
        color: rgb(1, 1, 1),
      })

      let y = height - 110
      const recs = audit.recommendations || []

      recs.slice(0, 6).forEach((rec, idx) => {
        const lines = wrapText(`${idx + 1}. ${rec}`, 95)
        lines.forEach((line) => {
          page.drawText(line, {
            x: 45,
            y,
            size: 11,
            font,
            color: rgb(0.2, 0.2, 0.2),
          })
          y -= 16
        })
        y -= 6
      })
    }

    const pdfBytes = await pdfDoc.save()

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=ux-audit-report.pdf",
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "PDF generation failed", details: error.message },
      { status: 500 }
    )
  }
}
