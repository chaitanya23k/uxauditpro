"use client"
import { useEffect, useState } from "react"
import { getUser } from "@/lib/auth"

export default function ProtectedRoute({
  children,
  allowedRoles = ["user", "agency", "admin"],
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const user = getUser()
    if (!user) {
      window.location.href = "/login"
      return
    }

    if (!allowedRoles.includes(user.role)) {
      window.location.href = "/dashboard"
      return
    }

    setReady(true)
  }, [allowedRoles])

  if (!ready) return null
  return children
}
