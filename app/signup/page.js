"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { firebaseSignup } from "@/lib/firebaseAuth"

export default function SignupPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")
  const [loading, setLoading] = useState(false)

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await firebaseSignup({ name, email, password, role })

      // Save locally for UI usage
      localStorage.setItem("uxa_user", JSON.stringify(user))

      if (user.role === "admin") router.push("/admin")
      else if (user.role === "agency") router.push("/agency")
      else router.push("/dashboard")
    } catch (err) {
      alert("Signup failed: " + err.message)
    }

    setLoading(false)
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
        <form
          onSubmit={handleSignup}
          className="w-full max-w-md bg-white p-8 rounded-2xl shadow-md border"
        >
          <h1 className="text-3xl font-extrabold text-slate-900">Create account</h1>
          <p className="text-slate-600 mt-2">Start using UXAuditPro</p>

          <div className="mt-6 space-y-4">
            <input
              className="w-full border rounded-xl px-4 py-3"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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

            <select
              className="w-full border rounded-xl px-4 py-3"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Normal User</option>
              <option value="agency">Agency</option>
            </select>

            <button
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <p className="text-sm text-slate-600 text-center">
              Already have an account?{" "}
              <a className="text-indigo-600 font-semibold" href="/login">
                Login
              </a>
            </p>
          </div>
        </form>
      </main>
    </>
  )
}
