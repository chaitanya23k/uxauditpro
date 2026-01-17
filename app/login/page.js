"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { firebaseLogin } from "@/lib/firebaseAuth"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await firebaseLogin({ email, password })

      localStorage.setItem("uxa_user", JSON.stringify(user))

      if (user.role === "admin") router.push("/admin")
      else if (user.role === "agency") router.push("/agency")
      else router.push("/dashboard")
    } catch (err) {
      alert("Login failed: " + err.message)
    }

    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border"
        >
          <h1 className="text-3xl font-extrabold text-slate-900">Login</h1>
          <p className="text-slate-600 mt-2">Access your UXAuditPro account</p>

          <div className="mt-6 space-y-4">
            <input
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <p className="text-sm text-slate-600 text-center">
              Don’t have an account?{" "}
              <a className="text-indigo-600 font-semibold" href="/signup">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </main>
    </>
  )
}
