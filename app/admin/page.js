"use client"
import { useEffect, useMemo, useState } from "react"
import Navbar from "@/components/Navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { db } from "@/lib/firebase"

import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore"

export default function AdminPage() {
  const [users, setUsers] = useState([])
  const [reports, setReports] = useState([])
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterPlan, setFilterPlan] = useState("all")

  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ Load Firebase Users + Reports
  async function loadData() {
    setLoading(true)
    try {
      const usersSnap = await getDocs(collection(db, "users"))
      const usersList = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setUsers(usersList)

      const reportsSnap = await getDocs(collection(db, "reports"))
      const reportsList = reportsSnap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setReports(reportsList)
    } catch (err) {
      alert("❌ Failed to load admin data: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // ✅ Stats (Revenue Estimate demo)
  const stats = useMemo(() => {
    const totalUsers = users.length
    const agencies = users.filter((u) => u.role === "agency").length
    const admins = users.filter((u) => u.role === "admin").length

    const proBuyers = users.filter((u) => u.plan === "pro").length
    const agencyBuyers = users.filter((u) => u.plan === "agency").length

    const totalReports = reports.length

    // Revenue estimate (demo)
    const revenue = proBuyers * 29 + agencyBuyers * 99

    return {
      totalUsers,
      agencies,
      admins,
      proBuyers,
      agencyBuyers,
      totalReports,
      revenue,
    }
  }, [users, reports])

  // ✅ Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const name = (u.name || "").toLowerCase()
      const email = (u.email || "").toLowerCase()

      const matchesSearch =
        name.includes(search.toLowerCase()) ||
        email.includes(search.toLowerCase())

      const matchesRole =
        filterRole === "all" ? true : (u.role || "user") === filterRole

      const plan = u.plan || "free"
      const matchesPlan = filterPlan === "all" ? true : plan === filterPlan

      return matchesSearch && matchesRole && matchesPlan
    })
  }, [users, search, filterRole, filterPlan])

  // ✅ Delete report from Firebase
  async function deleteReport(reportId) {
    const ok = confirm("Are you sure you want to delete this report?")
    if (!ok) return

    try {
      await deleteDoc(doc(db, "reports", reportId))
      setReports((prev) => prev.filter((r) => r.id !== reportId))
    } catch (err) {
      alert("❌ Failed deleting report: " + err.message)
    }
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Navbar />

      <main className="bg-slate-50 min-h-screen py-10 px-4">
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-2 text-base">
                Monitor users, agencies, reports & revenue (Firebase live)
              </p>
            </div>

            <button
              onClick={loadData}
              className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
            >
              Refresh
            </button>
          </div>

          {/* STATS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-5">
            <StatCard title="Users" value={stats.totalUsers} icon="👥" />
            <StatCard title="Agencies" value={stats.agencies} icon="🏢" />
            <StatCard title="Reports" value={stats.totalReports} icon="📄" />
            <StatCard title="Pro Buyers" value={stats.proBuyers} icon="💳" />
            <StatCard title="Agency Buyers" value={stats.agencyBuyers} icon="⭐" />
            <StatCard title="Revenue Est." value={`$${stats.revenue}`} icon="💰" />
          </div>

          {/* USERS CONTROLS */}
          <div className="mt-10 bg-white border rounded-2xl shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">

              <div className="flex-1">
                <label className="text-sm font-semibold text-slate-700">
                  Search user
                </label>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="mt-2 w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div className="w-full md:w-52">
                <label className="text-sm font-semibold text-slate-700">
                  Role
                </label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border bg-white"
                >
                  <option value="all">All</option>
                  <option value="user">User</option>
                  <option value="agency">Agency</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="w-full md:w-52">
                <label className="text-sm font-semibold text-slate-700">
                  Plan
                </label>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="mt-2 w-full px-4 py-3 rounded-xl border bg-white"
                >
                  <option value="all">All</option>
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="agency">Agency</option>
                </select>
              </div>
            </div>
          </div>

          {/* USERS TABLE */}
          <div className="mt-8 bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-slate-900">Users</h2>
              <p className="text-slate-600 text-sm mt-1">
                Showing <b>{filteredUsers.length}</b> users
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-slate-500">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-slate-500">
                No users found. Try changing filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-sm text-slate-600">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Plan</th>
                      <th className="p-4">Company</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="border-t hover:bg-slate-50 transition"
                      >
                        <td className="p-4 font-semibold text-slate-900">
                          {u.name || "N/A"}
                        </td>
                        <td className="p-4 text-slate-700">{u.email}</td>
                        <td className="p-4"><RoleBadge role={u.role || "user"} /></td>
                        <td className="p-4"><PlanBadge plan={u.plan || "free"} /></td>
                        <td className="p-4 text-slate-700">{u.companyName || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* REPORTS TABLE */}
          <div className="mt-10 bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-slate-900">Audit Reports</h2>
              <p className="text-slate-600 text-sm mt-1">
                Reports generated by all agencies/users
              </p>
            </div>

            {reports.length === 0 ? (
              <div className="p-8 text-slate-500">
                No reports yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-sm text-slate-600">
                      <th className="p-4">Website</th>
                      <th className="p-4">Score</th>
                      <th className="p-4">Agency Email</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {reports.map((r) => (
                      <tr
                        key={r.id}
                        className="border-t hover:bg-slate-50 transition"
                      >
                        <td className="p-4 font-semibold break-all">
                          {r.url}
                        </td>
                        <td className="p-4 font-bold text-indigo-600">
                          {r.uxScore}
                        </td>
                        <td className="p-4 text-slate-700">
                          {r.agencyEmail || "N/A"}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2 flex-wrap">
                          <button
                            onClick={() => setSelectedReport(r)}
                            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-black"
                          >
                            View
                          </button>

                          <button
                            onClick={() => deleteReport(r.id)}
                            className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ✅ REPORT MODAL */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
              <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6 overflow-auto max-h-[85vh]">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      Full Audit Report
                    </h3>
                    <p className="text-slate-600 text-sm break-all mt-1">
                      {selectedReport.url}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 rounded-xl border font-semibold hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>

                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border rounded-2xl p-5">
                    <p className="text-sm text-slate-600">UX Score</p>
                    <p className="text-3xl font-extrabold text-indigo-600 mt-2">
                      {selectedReport.uxScore}
                    </p>
                  </div>

                  <div className="bg-slate-50 border rounded-2xl p-5">
                    <p className="text-sm text-slate-600">Agency</p>
                    <p className="font-semibold text-slate-900 mt-2">
                      {selectedReport.agencyEmail || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-2xl p-5">
                    <h4 className="font-bold text-slate-900 mb-3">Issues</h4>
                    <ul className="list-disc ml-5 space-y-2 text-slate-700">
                      {(selectedReport.fullReport?.issues || []).map((i, idx) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border rounded-2xl p-5">
                    <h4 className="font-bold text-slate-900 mb-3">
                      Recommendations
                    </h4>
                    <ul className="list-disc ml-5 space-y-2 text-slate-700">
                      {(selectedReport.fullReport?.recommendations || []).map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </ProtectedRoute>
  )
}

/* UI Components */
function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600 font-semibold">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-extrabold text-slate-900 mt-3">{value}</p>
    </div>
  )
}

function RoleBadge({ role }) {
  const base = "px-3 py-1 rounded-full text-xs font-bold inline-block"
  if (role === "admin") return <span className={`${base} bg-red-50 text-red-700`}>ADMIN</span>
  if (role === "agency") return <span className={`${base} bg-indigo-50 text-indigo-700`}>AGENCY</span>
  return <span className={`${base} bg-slate-100 text-slate-700`}>USER</span>
}

function PlanBadge({ plan }) {
  const base = "px-3 py-1 rounded-full text-xs font-bold inline-block"
  if (plan === "pro") return <span className={`${base} bg-emerald-50 text-emerald-700`}>PRO</span>
  if (plan === "agency") return <span className={`${base} bg-indigo-50 text-indigo-700`}>AGENCY</span>
  return <span className={`${base} bg-gray-100 text-gray-700`}>FREE</span>
}
