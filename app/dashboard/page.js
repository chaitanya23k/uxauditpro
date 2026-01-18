"use client"
import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { getUser } from "@/lib/auth"
import { db } from "@/lib/firebase"
import { addDoc, collection } from "firebase/firestore"

export default function Dashboard() {
  const [user, setUser] = useState(null)

  const [url, setUrl] = useState("")
  const [result, setResult] = useState(null)

  const [aiText, setAiText] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => {
    const u = getUser()
    setUser(u)
    const saved = JSON.parse(localStorage.getItem("audit_history") || "[]")
    setHistory(saved)
  }, [])

  const role = user?.role || "user"
  const plan = user?.plan || "free"

  const canUseAI = plan === "pro" || plan === "agency" || role === "admin"
  const canDownloadPDF = plan === "pro" || plan === "agency" || role === "admin"

  async function runAudit() {
    if (!url.trim()) {
      alert("Please enter a website URL")
      return
    }

    // ✅ Free limitation: 1 audit/day
    if (plan === "free") {
      const today = new Date().toDateString()
      const usedToday = history.some((h) => h.day === today)
      if (usedToday) {
        alert("❌ Free plan allows only 1 audit/day. Upgrade to Pro!")
        return
      }
    }

    setLoading(true)
    setAiText("")
    setResult(null)

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })

      if (!res.ok) throw new Error("Audit API failed")

      const data = await res.json()
      setResult(data)

      // ✅ HISTORY (local)
      const newItem = {
        id: Date.now(),
        url: data.url,
        uxScore: data.uxScore,
        createdAt: new Date().toLocaleString(),
        fullReport: data,
        day: new Date().toDateString(),
      }

      setHistory((prev) => {
        const updated = [newItem, ...prev].slice(0, 10)
        localStorage.setItem("audit_history", JSON.stringify(updated))
        return updated
      })

      // ✅ AGENCY REPORT SAVE (Local + Firebase)
      if (role === "agency") {
        const reportItem = {
          agencyId: user?.uid || "",
          agencyEmail: user?.email || "",
          url: data.url,
          uxScore: data.uxScore,
          createdAt: new Date().toISOString(),
          fullReport: data,
        }

        // ✅ Local save (prevent duplicates)
        const old = JSON.parse(localStorage.getItem("agency_reports") || "[]")
        const filteredOld = old.filter((r) => r.url !== reportItem.url)

        localStorage.setItem(
          "agency_reports",
          JSON.stringify([reportItem, ...filteredOld])
        )

        // ✅ Firebase save
        try {
          await addDoc(collection(db, "reports"), reportItem)
        } catch (e) {
          console.log("Firebase report save failed:", e.message)
        }
      }
    } catch (err) {
      alert("❌ " + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function getAiSuggestions() {
    if (!result) return alert("Run audit first!")

    if (!canUseAI) {
      alert("❌ AI Suggestions are only for PRO/AGENCY/ADMIN.")
      return
    }

    setAiLoading(true)
    setAiText("")

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audit: result }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setAiText("❌ AI Error: " + (data.error || "Something went wrong"))
      } else {
        setAiText(data.suggestions || "No AI suggestions received.")
      }
    } catch (err) {
      setAiText("❌ AI Error: " + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  // ✅ Get screenshot from backend
  async function fetchScreenshot(targetUrl) {
    try {
      const res = await fetch("/api/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      })

      const data = await res.json()
      if (!res.ok) return null

      return data?.image || null
    } catch (err) {
      console.log("Screenshot error:", err.message)
      return null
    }
  }

  async function downloadPDF() {
  if (!result) return

  if (!canDownloadPDF) {
    alert("❌ PDF is locked in Free plan. Upgrade to Pro.")
    return
  }

  try {
    // ✅ Step 1: Get Screenshot from API
    let screenshot = null
    try{
    const shotRes = await fetch("/api/screenshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: result.url }),
    })

    const shotData = await shotRes.json()

    if(shotRes.ok && shotData?.image){
      screenshot = shotData.image
    }
  }catch(err){
    console.log("screenshot fetch failed:", err.message)
  }

    // ✅ Step 2: Prepare Payload with screenshot
    const payload = {
      ...result,
      screenshot: screenshot, // 
      role: role,
      plan: plan,

      // ✅ optional agency branding fields (only for agency report)
      agencyName: user?.companyName || "WebDigiz",
      agencyWebsite: "www.webdigiz.com",
    }

    // ✅ Step 3: Send to PDF API
    const res = await fetch("/api/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      alert("❌ PDF generation failed: " + (errData?.details || "Unknown error"))
      return
    }

    const blob = await res.blob()
    const fileUrl = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = fileUrl
    a.download = "ux-audit-report.pdf"
    document.body.appendChild(a)
    a.click()
    a.remove()

    window.URL.revokeObjectURL(fileUrl)
  } catch (err) {
    alert("❌ PDF Error: " + err.message)
  }
}


  return (
    <ProtectedRoute allowedRoles={["user", "agency", "admin"]}>
      <Navbar />

      <main className="bg-slate-50 min-h-screen py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
              UX Audit Dashboard
            </h1>
            <p className="text-slate-600 mt-2">
              Plan:{" "}
              <span className="font-bold text-indigo-600">
                {(plan || "free").toUpperCase()}
              </span>
              {" "} | Role:{" "}
              <span className="font-bold text-slate-900">
                {(role || "user").toUpperCase()}
              </span>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT */}
            <div className="space-y-6">
              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-3 text-slate-900">
                  Run UX Audit
                </h2>

                <input
                  className="w-full border rounded-xl p-3 mb-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />

                <button
                  onClick={runAudit}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60"
                >
                  {loading ? "Running Audit..." : "Run Audit"}
                </button>

                {plan === "free" && (
                  <p className="text-xs text-red-500 mt-3">
                    Free plan: Only 1 audit/day.
                  </p>
                )}
              </div>

              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4 text-slate-900">History</h2>

                {history.length === 0 ? (
                  <p className="text-slate-500 text-sm">No audits yet.</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setResult(item.fullReport)
                          setAiText("")
                        }}
                        className="w-full text-left border rounded-xl p-3 hover:bg-slate-50"
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <p className="font-semibold break-all">{item.url}</p>
                            <p className="text-xs text-slate-500">{item.createdAt}</p>
                          </div>
                          <span className="font-bold text-indigo-600">{item.uxScore}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-2">
              {!result ? (
                <div className="bg-white border rounded-2xl p-10 shadow-sm text-center">
                  <h2 className="text-2xl font-bold mb-2">No Audit Yet</h2>
                  <p className="text-slate-600">Run your first audit to see results.</p>
                </div>
              ) : (
                <div className="bg-white border rounded-2xl p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">
                        UX Score:{" "}
                        <span className="text-indigo-600">{result.uxScore}</span>
                      </h2>
                      <p className="text-slate-600 break-all">{result.url}</p>
                    </div>

                    <div className="flex gap-3 flex-wrap">
                      <button
                        onClick={getAiSuggestions}
                        className="px-5 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-black"
                      >
                        {aiLoading ? "Generating..." : "AI Suggestions"}
                      </button>

                      <button
                        onClick={downloadPDF}
                        className="px-5 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 grid md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 border rounded-2xl p-6">
                      <h3 className="font-bold mb-3">Issues Found</h3>
                      <ul className="list-disc ml-5 space-y-2 text-slate-700">
                        {result.issues?.map((i, idx) => (
                          <li key={idx}>{i}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-slate-50 border rounded-2xl p-6">
                      <h3 className="font-bold mb-3">Recommendations</h3>
                      <ul className="list-disc ml-5 space-y-2 text-slate-700">
                        {result.recommendations?.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {aiText && (
                    <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
                      <h3 className="font-bold text-indigo-900 mb-2">
                        AI Suggestions
                      </h3>
                      <p className="text-slate-700 whitespace-pre-wrap">{aiText}</p>
                    </div>
                  )}

                  {!canDownloadPDF && (
                    <p className="text-sm text-red-500 mt-6">
                      ❌ PDF locked in Free plan.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
