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

      // ✅ AGENCY REPORTS SAVE (Firebase + Local) ✅ FIXED
      if (role === "agency") {
        const reportItem = {
          agencyId: user?.uid || "", // ✅ must exist
          agencyEmail: user?.email || "",
          url: data.url,
          uxScore: data.uxScore,
          createdAt: new Date().toISOString(),
          fullReport: data,
        }

        // ✅ Save Local (instant UI)
        const old = JSON.parse(localStorage.getItem("agency_reports") || "[]")

        // ✅ prevent duplicates
        const filteredOld = old.filter(
          (r) => (r.url || "").toLowerCase() !== (reportItem.url || "").toLowerCase()
        )

        localStorage.setItem("agency_reports", JSON.stringify([reportItem, ...filteredOld]))

        // ✅ Save Firestore (Real)
        await addDoc(collection(db, "reports"), reportItem)
      }
    } catch (err) {
      alert("❌ " + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function getAiSuggestions() {
    if (!result) {
      alert("Run audit first!")
      return
    }

    if (!canUseAI) {
      alert("❌ AI Suggestions are only for PRO / AGENCY plans.")
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

  async function downloadPDF() {
    if (!result) return

    if (!canDownloadPDF) {
      alert("❌ PDF Export is locked in Free plan. Upgrade to Pro.")
      return
    }

    try {
      const payload = {
        ...result,
        role,
        plan,
      }

      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        alert("❌ PDF generation failed")
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

  function clearHistory() {
    const ok = confirm("Clear all audit history?")
    if (!ok) return

    localStorage.removeItem("audit_history")
    setHistory([])
    setResult(null)
    setAiText("")
  }

  return (
    <ProtectedRoute allowedRoles={["user", "agency", "admin"]}>
      <Navbar />

      <main className="bg-slate-50 min-h-screen py-10 px-4">
        <div className="max-w-5xl mx-auto">

          <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                UX Audit Dashboard
              </h1>
              <p className="text-slate-600 mt-2">
                Plan:{" "}
                <span className="font-bold text-indigo-600">
                  {(plan || "free").toUpperCase()}
                </span>{" "}
                | Role:{" "}
                <span className="font-bold text-slate-900">
                  {(role || "user").toUpperCase()}
                </span>
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-4 py-2 rounded-xl border bg-white font-semibold hover:bg-slate-50"
              >
                Clear History
              </button>
            )}
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
                <h2 className="text-lg font-bold mb-4 text-slate-900">
                  History
                </h2>

                {history.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    No audits yet.
                  </p>
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
                  <p className="text-slate-600">
                    Run your first audit to see results.
                  </p>
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

                  {!canUseAI && (
                    <p className="text-sm text-red-500 mt-2">
                      ❌ AI Suggestions locked in Free plan.
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
