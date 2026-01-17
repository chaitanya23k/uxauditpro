"use client"
import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { auth, db } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore"

export default function Dashboard() {
  const [userData, setUserData] = useState(null)

  const [url, setUrl] = useState("")
  const [result, setResult] = useState(null)

  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])

  // ✅ Load history from localStorage (optional)
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("audit_history") || "[]")
    setHistory(saved)
  }, [])

  // ✅ Load user plan+role from Firestore
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return

      const ref = doc(db, "users", user.uid)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        setUserData({ uid: user.uid, ...snap.data() })
      } else {
        // ✅ if missing user doc, create basic
        const newUser = {
          name: user.displayName || "User",
          email: user.email,
          role: "user",
          plan: "free",
          createdAt: new Date().toISOString(),
        }

        await setDoc(ref, newUser)
        setUserData({ uid: user.uid, ...newUser })
      }
    })

    return () => unsub()
  }, [])

  const plan = userData?.plan || "free"
  const role = userData?.role || "user"

  function canUseAI() {
    return plan === "pro" || plan === "agency" || role === "admin"
  }

  function canDownloadPDF() {
    return plan === "pro" || plan === "agency" || role === "admin"
  }

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
        alert("❌ Free plan allows only 1 audit per day. Upgrade to Pro!")
        return
      }
    }

    setLoading(true)
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

      const newItem = {
        id: Date.now(),
        url: data.url,
        uxScore: data.uxScore,
        createdAt: new Date().toLocaleString(),
        fullReport: data,
        day: new Date().toDateString(),
      }

      // ✅ Save history locally
      setHistory((prev) => {
        const updated = [newItem, ...prev].slice(0, 10)
        localStorage.setItem("audit_history", JSON.stringify(updated))
        return updated
      })

      // ✅ Save report into Firebase (agency/admin/user)
      await addDoc(collection(db, "reports"), {
        url: data.url,
        uxScore: data.uxScore,
        fullReport: data,
        createdAt: new Date().toISOString(),
        userEmail: userData?.email || "N/A",
        role: role,
        plan: plan,
      })
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
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
              Your current plan:{" "}
              <span className="font-bold text-indigo-600">
                {plan.toUpperCase()}
              </span>{" "}
              — Role:{" "}
              <span className="font-bold text-slate-900">
                {role.toUpperCase()}
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
                    Free plan: Only 1 audit/day — upgrade to Pro for unlimited.
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
                        onClick={() => setResult(item.fullReport)}
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

                {history.length > 0 && (
                  <button
                    onClick={() => {
                      localStorage.removeItem("audit_history")
                      setHistory([])
                      setResult(null)
                    }}
                    className="mt-4 w-full bg-red-500 text-white py-2 rounded-xl hover:bg-red-600"
                  >
                    Clear History
                  </button>
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
                  <h2 className="text-2xl font-bold">
                    UX Score:{" "}
                    <span className="text-indigo-600">{result.uxScore}</span>
                  </h2>
                  <p className="text-slate-600 break-all">{result.url}</p>

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

                  {!canDownloadPDF() && (
                    <p className="text-sm text-red-500 mt-6">
                      ❌ PDF Export is locked in Free plan. Upgrade to Pro.
                    </p>
                  )}

                  {!canUseAI() && (
                    <p className="text-sm text-red-500 mt-2">
                      ❌ AI Suggestions are locked in Free plan. Upgrade to Pro.
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
