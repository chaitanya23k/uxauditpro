"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { getUser, logout } from "@/lib/auth"

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const u = getUser()
    setUser(u)
  }, [])

  const role = user?.role || "guest"

  function NavLinks({ mobile = false }) {
    const linkClass = mobile
      ? "block px-4 py-3 rounded-xl hover:bg-slate-50 font-semibold text-slate-800 transition"
      : "hover:text-indigo-600 transition font-semibold text-slate-700"

    return (
      <>
        <Link onClick={() => setOpen(false)} className={linkClass} href="/">
          Home
        </Link>

        <Link onClick={() => setOpen(false)} className={linkClass} href="/pricing">
          Pricing
        </Link>

        <Link onClick={() => setOpen(false)} className={linkClass} href="/about">
          About
        </Link>

        <Link onClick={() => setOpen(false)} className={linkClass} href="/contact">
          Contact
        </Link>

        {user && (
          <Link onClick={() => setOpen(false)} className={linkClass} href="/dashboard">
            Dashboard
          </Link>
        )}

        {role === "agency" && (
          <Link onClick={() => setOpen(false)} className={linkClass} href="/agency">
            Agency
          </Link>
        )}

        {role === "admin" && (
          <Link onClick={() => setOpen(false)} className={linkClass} href="/admin">
            Admin
          </Link>
        )}
      </>
    )
  }

  return (
    <header className="bg-white/80 border-b sticky top-0 z-50 backdrop-blur">
      <div className="container-main flex items-center justify-between py-4">
        {/* ✅ Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-extrabold">
            U
          </div>
          <span className="font-extrabold text-lg text-slate-900">
            UXAuditPro
          </span>
        </Link>

        {/* ✅ Desktop Links */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLinks />
        </nav>

        {/* ✅ Desktop Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
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
              <Link href="/account" className="btn-outline">
                Account
              </Link>

              <button
                onClick={() => {
                  logout()
                  window.location.href = "/"
                }}
                className="btn-primary"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* ✅ Mobile Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden w-11 h-11 rounded-xl border bg-white flex items-center justify-center"
          aria-label="Toggle Menu"
        >
          {!open ? (
            <span className="text-2xl">☰</span>
          ) : (
            <span className="text-2xl">✕</span>
          )}
        </button>
      </div>

      {/* ✅ Mobile Menu */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="container-main py-4 space-y-2">
            <NavLinks mobile />

            {/* ✅ Mobile Buttons */}
            <div className="pt-3 border-t mt-3 space-y-2">
              {!user ? (
                <>
                  <Link
                    onClick={() => setOpen(false)}
                    href="/login"
                    className="block w-full text-center px-6 py-3 rounded-xl border font-semibold hover:bg-slate-50 transition"
                  >
                    Login
                  </Link>

                  <Link
                    onClick={() => setOpen(false)}
                    href="/signup"
                    className="block w-full text-center px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    onClick={() => setOpen(false)}
                    href="/account"
                    className="block w-full text-center px-6 py-3 rounded-xl border font-semibold hover:bg-slate-50 transition"
                  >
                    Account
                  </Link>

                  <button
                    onClick={() => {
                      logout()
                      window.location.href = "/"
                    }}
                    className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
