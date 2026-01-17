"use client"
import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { auth, db } from "@/lib/firebase"
import {
  onAuthStateChanged,
  updateProfile,
  deleteUser,
} from "firebase/auth"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

export default function AccountPage() {
  const [userData, setUserData] = useState(null)
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return

      const ref = doc(db, "users", user.uid)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        const data = snap.data()
        setUserData({ uid: user.uid, email: user.email, ...data })
        setName(data.name || "")
        setCompany(data.company || "")
      }
    })

    return () => unsub()
  }, [])

  async function updateAccount() {
    if (!userData) return

    setLoading(true)
    try {
      // ✅ Update Auth display name
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: name })
      }

      // ✅ Update Firestore profile
      await updateDoc(doc(db, "users", userData.uid), {
        name,
        company,
      })

      alert("✅ Account updated successfully!")
    } catch (err) {
      alert("❌ " + err.message)
    } finally {
      setLoading(false)
    }
  }

  async function deleteAccountForever() {
    const confirm1 = confirm("⚠️ Are you sure you want to delete your account permanently?")
    if (!confirm1) return

    const confirm2 = confirm("This will delete ALL your data and you cannot recover it. Continue?")
    if (!confirm2) return

    try {
      // ✅ Delete firestore data via secure API route
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: userData.uid }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to delete database data")

      // ✅ Delete auth account
      if (auth.currentUser) {
        await deleteUser(auth.currentUser)
      }

      alert("✅ Account deleted permanently.")
      router.push("/")
    } catch (err) {
      alert("❌ Delete failed: " + err.message)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["user", "agency", "admin"]}>
      <Navbar />

      <main className="bg-slate-50 min-h-screen py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white border rounded-2xl p-8 shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-900">
            Account Settings
          </h1>

          <p className="text-slate-600 mt-2">
            Manage your profile, company, and security options.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                className="w-full mt-2 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">
                Company Name (Agency only)
              </label>
              <input
                className="w-full mt-2 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={updateAccount}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? "Saving..." : "Update Account"}
              </button>

              <button
                onClick={deleteAccountForever}
                className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition"
              >
                Delete Account Permanently
              </button>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 p-5 rounded-xl">
            <p className="text-yellow-900 font-semibold">
              ⚠️ Warning
            </p>
            <p className="text-yellow-800 text-sm mt-2">
              Deleting your account will remove your employees, reports, and audit history permanently.
            </p>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
