"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { usePathname, useRouter } from "next/navigation"

export default function Navbar() {
  const [userData, setUserData] = useState(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserData(null)
        return
      }

      const ref = doc(db, "users", user.uid)
      const snap = await getDoc(ref)

      if (snap.exists()) {
        setUserData({ uid: user.uid, ...snap.data() })
      }
    })

    return () => unsub()
  }, [])

  async function logout() {
    await signOut(auth)
    router.push("/")
  }

  const role = userData?.role || "guest"
  const plan = userData?.plan || "free"

  return (
    <header className="bg-white/70 backdrop-blur border-b sticky top-0 z-50">
      <div className="container-main flex items-center justify-between py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            U
          </div>
          <span className="font-extrabold text-lg text-slate-900">
            UXAuditPro
          </span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-8 font-semibold text-slate-700">
          <Link className="hover:text-indigo-600" href="/">Home</Link>
          <Link className="hover:text-indigo-600" href="/pricing">Pricing</Link>

          {/* ✅ Only show Dashboard when logged in */}
          {userData && (
            <Link className="hover:text-indigo-600" href="/dashboard">
              Dashboard
            </Link>
          )}

          {/* ✅ Agency */}
          {role === "agency" && (
            <Link className="hover:text-indigo-600" href="/agency">
              Agency
            </Link>
          )}

          {/* ✅ Admin */}
          {role === "admin" && (
            <Link className="hover:text-indigo-600" href="/admin">
              Admin
            </Link>
          )}

          {/* ✅ Account page */}
          {userData && (
            <Link className="hover:text-indigo-600" href="/account">
              Account
            </Link>
          )}
        </nav>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          {!userData ? (
            <>
              <Link href="/login" className="btn-outline">
                Login
              </Link>
              <Link href="/signup" className="btn-primary">
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {/* Role badge */}
              <span className="hidden md:inline-block px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm">
                Role: {role.toUpperCase()} | {plan.toUpperCase()}
              </span>

              <button onClick={logout} className="btn-outline">
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
