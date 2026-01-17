export function getUser() {
  if (typeof window === "undefined") return null
  return JSON.parse(localStorage.getItem("uxa_user") || "null")
}

export function signup({ name, email, password, role }) {
  const users = JSON.parse(localStorage.getItem("uxa_users") || "[]")

  const exists = users.find((u) => u.email === email)
  if (exists) throw new Error("User already exists")

  // ✅ Plan mapping
  let plan = "free"
  if (role === "admin") plan = "admin"
  if (role === "agency") plan = "agency"

  const user = { name, email, password, role, plan }
  users.push(user)

  localStorage.setItem("uxa_users", JSON.stringify(users))
  localStorage.setItem(
    "uxa_user",
    JSON.stringify({ name, email, role, plan })
  )

  return user
}

export function login({ email, password }) {
  const users = JSON.parse(localStorage.getItem("uxa_users") || "[]")
  const user = users.find((u) => u.email === email)

  if (!user) throw new Error("User not found. Please sign up first.")
  if (user.password !== password) throw new Error("Wrong password!")

  localStorage.setItem(
    "uxa_user",
    JSON.stringify({
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan || "free",
    })
  )

  return user
}

export function logout() {
  localStorage.removeItem("uxa_user")
}

// ✅ Upgrade plan manually (for now, without payments)
export function upgradePlan(planName) {
  const user = getUser()
  if (!user) throw new Error("Login required")

  const users = JSON.parse(localStorage.getItem("uxa_users") || "[]")
  const idx = users.findIndex((u) => u.email === user.email)

  if (idx !== -1) {
    users[idx].plan = planName
    localStorage.setItem("uxa_users", JSON.stringify(users))
  }

  const updated = { ...user, plan: planName }
  localStorage.setItem("uxa_user", JSON.stringify(updated))
  return updated
}
