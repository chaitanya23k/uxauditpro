import { NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"

// ✅ Remove emojis & special symbols that break PDF fonts
function cleanText(text = "") {
  return text
    .replace(/[✅❌🚀💡⚡🌍]/g, "") // remove emojis
    .replace(/[^\x00-\x7F]/g, "") // remove non-ascii characters
    .trim()
}

function wrapText(text, maxChars = 90) {
  const safe = cleanText(text)
  const words = safe.split(" ")
  const lines = []
  let line = ""

  for (let w of words) {
    if ((line + w).length > maxChars) {
      lines.push(line.trim())
      line = w + " "
    } else {
      line += w + " "
    }
  }
  if (line.trim()) lines.push(line.trim())
  return lines
}

function getExamples(issue) {
  const i = cleanText(issue).toLowerCase()

  if (i.includes("cta") || i.includes("button")) {
    return "Example: Shopify uses bold CTA buttons with high contrast and clear action text."
  }
  if (i.includes("mobile")) {
    return "Example: Airbnb keeps mobile spacing large with readable text for smooth navigation."
  }
  if (i.includes("speed") || i.includes("load")) {
    return "Example: Google optimizes pages using compressed images and minimal scripts for fast loading."
  }
  if (i.includes("form")) {
    return "Example: Stripe reduces form fields to make checkout faster and smoother."
  }
  if (i.includes("trust")) {
    return "Example: Amazon shows reviews, ratings, and secure payment badges near the buy button."
  }

  return "Example: Lattice.com uses clean spacing, sections, and clear typography for better readability."
}

export async function POST(req) {
  try {
    const audit = await req.json()

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595, 842]) // A4
    const { width, height } = page.getSize()

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

    let y = height - 40

    // ✅ HEADER BAR
    page.drawRectangle({
      x: 0,
      y: height - 90,
      width,
      height: 90,
      color: rgb(79 / 255, 70 / 255, 229 / 255),
    })

    page.drawText("UXAuditPro - UX Audit Report", {
      x: 40,
      y: height - 55,
      size: 20,
      font: fontBold,
      color: rgb(1, 1, 1),
    })

    page.drawText(`Website: ${cleanText(audit.url || "N/A")}`, {
      x: 40,
      y: height - 75,
      size: 11,
      font,
      color: rgb(1, 1, 1),
    })

    // ✅ SCORE BOX
    y = height - 140
    page.drawRectangle({
      x: 40,
      y,
      width: width - 80,
      height: 60,
      color: rgb(245 / 255, 245 / 255, 255 / 255),
      borderColor: rgb(220 / 255, 220 / 255, 240 / 255),
      borderWidth: 1,
    })

    page.drawText("UX Score", {
      x: 60,
      y: y + 35,
      size: 14,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    })

    const score = Number(audit.uxScore || 0)

    page.drawText(`${score}/100`, {
      x: 60,
      y: y + 12,
      size: 22,
      font: fontBold,
      color: score >= 75 ? rgb(0.1, 0.7, 0.2) : rgb(0.8, 0.2, 0.2),
    })

    y -= 30

    // ✅ Section Title
    function sectionTitle(title) {
      y -= 35
      page.drawText(title, {
        x: 40,
        y,
        size: 14,
        font: fontBold,
        color: rgb(0.12, 0.12, 0.2),
      })
      y -= 10
      page.drawLine({
        start: { x: 40, y },
        end: { x: width - 40, y },
        thickness: 1,
        color: rgb(0.85, 0.85, 0.92),
      })
      y -= 20
    }

    // ✅ If page overflow → add new page
    function checkNewPage() {
      if (y < 80) {
        const newPage = pdfDoc.addPage([595, 842])
        y = 800
        return newPage
      }
      return page
    }

    // ✅ ISSUES
    sectionTitle("Issues Found")
    let currentPage = page

    const issues = audit.issues || []
    if (issues.length === 0) {
      currentPage.drawText("No issues detected.", {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0.4, 0.4, 0.4),
      })
      y -= 20
    } else {
      issues.slice(0, 8).forEach((issue, idx) => {
        currentPage = checkNewPage()

        const lines = wrapText(`${idx + 1}. ${issue}`, 85)
        lines.forEach((line) => {
          currentPage.drawText(line, {
            x: 55,
            y,
            size: 11,
            font,
            color: rgb(0.2, 0.2, 0.2),
          })
          y -= 16
        })

        const example = getExamples(issue)
        const exampleLines = wrapText(`Example: ${example}`, 85)

        exampleLines.forEach((line) => {
          currentPage.drawText(line, {
            x: 70,
            y,
            size: 10,
            font,
            color: rgb(0.1, 0.35, 0.75),
          })
          y -= 14
        })

        y -= 12
      })
    }

    // ✅ RECOMMENDATIONS
    sectionTitle("Recommendations")

    const recs = audit.recommendations || []
    if (recs.length === 0) {
      currentPage.drawText("No recommendations generated.", {
        x: 50,
        y,
        size: 11,
        font,
        color: rgb(0.4, 0.4, 0.4),
      })
      y -= 20
    } else {
      recs.slice(0, 8).forEach((rec, idx) => {
        currentPage = checkNewPage()

        const lines = wrapText(`${idx + 1}. ${rec}`, 85)
        lines.forEach((line) => {
          currentPage.drawText(line, {
            x: 55,
            y,
            size: 11,
            font,
            color: rgb(0.18, 0.18, 0.18),
          })
          y -= 16
        })
        y -= 10
      })
    }

    // ✅ FOOTER
    currentPage.drawLine({
      start: { x: 40, y: 60 },
      end: { x: width - 40, y: 60 },
      thickness: 1,
      color: rgb(0.9, 0.9, 0.95),
    })

    currentPage.drawText("Generated by UXAuditPro - Improve UX, boost conversions", {
      x: 40,
      y: 40,
      size: 10,
      font,
      color: rgb(0.45, 0.45, 0.45),
    })

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
