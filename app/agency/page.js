"use client"

import { useEffect, useMemo, useState } from "react"
import Navbar from "@/components/Navbar"
import ProtectedRoute from "@/components/ProtectedRoute"
import { getUser } from "@/lib/auth"
import { db } from "@/lib/firebase"

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  orderBy,
  onSnapshot,
} from "firebase/firestore"

export default function AgencyPage() {
  const [user, setUser] = useState(null)

  // ✅ Agency Profile
  const [companyName, setCompanyName] = useState("")
  const [companyWebsite, setCompanyWebsite] = useState("")
  const [savingCompany, setSavingCompany] = useState(false)

  // ✅ Employees
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const [form, setForm] = useState({
    name: "",
    email: "",
    employeeId: "",
    company: "",
    position: "",
  })

  // ✅ Edit Employee
  const [editOpen, setEditOpen] = useState(false)
  const [editEmployee, setEditEmployee] = useState(null)

  // ✅ Reports
  const [reports, setReports] = useState([])
  const [reportSearch, setReportSearch] = useState("")
  const [selectedReport, setSelectedReport] = useState(null)

  // ✅ Invite employee
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviting, setInviting] = useState(false)

  // ✅ Load user
  useEffect(() => {
    const u = getUser()
    setUser(u)
  }, [])

  // ✅ REALTIME LISTENERS (Reports + Employees)
  useEffect(() => {
    if (!user?.uid) return

    loadAgencyProfile()

    // ✅ Employees realtime
    const empQuery = query(
      collection(db, "employees"),
      where("agencyId", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const unsubEmployees = onSnapshot(empQuery, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setEmployees(list)
    })

    // ✅ Reports realtime
    const repQuery = query(
      collection(db, "reports"),
      where("agencyId", "==", user.uid),
      orderBy("createdAt", "desc")
    )

    const unsubReports = onSnapshot(repQuery, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

      // ✅ Remove duplicates by URL
      const seen = new Set()
      const unique = []
      for (const r of list) {
        const key = (r.url || "").toLowerCase().trim()
        if (!key) continue
        if (!seen.has(key)) {
          seen.add(key)
          unique.push(r)
        }
      }

      setReports(unique)
    })

    return () => {
      unsubEmployees()
      unsubReports()
    }
  }, [user])

  // ✅ Load Agency Profile from users/{uid}
  async function loadAgencyProfile() {
    try {
      const q = query(collection(db, "users"), where("uid", "==", user.uid))
      const snap = await getDocs(q)
      if (!snap.empty) {
        const data = snap.docs[0].data()
        setCompanyName(data.companyName || "")
        setCompanyWebsite(data.companyWebsite || "")
      }
    } catch (err) {
      console.log("Profile load failed:", err.message)
    }
  }

  // ✅ Save Agency Profile
  async function saveCompanyProfile() {
    if (!user?.uid) return alert("Login required ❌")
    if (!companyName.trim()) return alert("Enter company name ✅")

    setSavingCompany(true)
    try {
      await updateDoc(doc(db, "users", user.uid), {
        companyName: companyName.trim(),
        companyWebsite: companyWebsite.trim(),
        updatedAt: new Date().toISOString(),
      })
      alert("✅ Agency profile saved!")
    } catch (err) {
      alert("❌ Failed: " + err.message)
    } finally {
      setSavingCompany(false)
    }
  }

  // ✅ Add Employee
  async function addEmployee() {
    if (!user?.uid) return alert("Login required ❌")
    if (!form.name || !form.email || !form.employeeId) {
      alert("Fill required fields ✅")
      return
    }

    try {
      const payload = {
        ...form,
        agencyId: user.uid,
        agencyEmail: user.email,
        createdAt: new Date().toISOString(),
      }

      await addDoc(collection(db, "employees"), payload)

      setForm({
        name: "",
        email: "",
        employeeId: "",
        company: "",
        position: "",
      })

      setShowAddForm(false)
      alert("✅ Employee added")
    } catch (err) {
      alert("❌ Failed to add employee: " + err.message)
    }
  }

  // ✅ Remove Employee
  async function removeEmployee(empId) {
    const ok = confirm("Remove this employee permanently?")
    if (!ok) return

    try {
      await deleteDoc(doc(db, "employees", empId))
      alert("✅ Employee removed")
    } catch (err) {
      alert("❌ Failed: " + err.message)
    }
  }

  // ✅ Clear ALL Employees
  async function clearAllEmployees() {
    const ok = confirm("⚠️ Delete ALL employees permanently?")
    if (!ok) return

    try {
      const q = query(collection(db, "employees"), where("agencyId", "==", user.uid))
      const snap = await getDocs(q)

      const promises = snap.docs.map((d) => deleteDoc(doc(db, "employees", d.id)))
      await Promise.all(promises)

      alert("✅ All employees removed")
    } catch (err) {
      alert("❌ Failed: " + err.message)
    }
  }

  // ✅ Edit Employee
  function openEdit(emp) {
    setEditEmployee(emp)
    setEditOpen(true)
  }

  async function saveEmployeeEdit() {
    if (!editEmployee?.id) return
    if (!editEmployee.name || !editEmployee.email || !editEmployee.employeeId) {
      alert("Fill required fields ✅")
      return
    }

    try {
      await updateDoc(doc(db, "employees", editEmployee.id), {
        name: editEmployee.name,
        email: editEmployee.email,
        employeeId: editEmployee.employeeId,
        company: editEmployee.company || "",
        position: editEmployee.position || "",
        updatedAt: new Date().toISOString(),
      })

      setEditOpen(false)
      setEditEmployee(null)
      alert("✅ Employee updated")
    } catch (err) {
      alert("❌ Update failed: " + err.message)
    }
  }

  // ✅ Remove Report
  async function removeReport(reportId) {
    const ok = confirm("Remove this report permanently?")
    if (!ok) return

    try {
      await deleteDoc(doc(db, "reports", reportId))
      alert("✅ Report removed")
    } catch (err) {
      alert("❌ Failed to remove report: " + err.message)
    }
  }

  // ✅ Clear ALL Reports
  async function clearAllReports() {
    const ok = confirm("⚠️ Delete ALL reports permanently?")
    if (!ok) return

    try {
      const q = query(collection(db, "reports"), where("agencyId", "==", user.uid))
      const snap = await getDocs(q)

      const promises = snap.docs.map((d) => deleteDoc(doc(db, "reports", d.id)))
      await Promise.all(promises)

      alert("✅ All reports removed")
    } catch (err) {
      alert("❌ Failed: " + err.message)
    }
  }

  // ✅ Download PDF
  async function downloadPDF(report) {
    try {
      const payload = {
        ...(report.fullReport || report),
        url: report.url,
        uxScore: report.uxScore,
        role: "agency",
        plan: "agency",
        agencyName: companyName || "Your Agency",
        agencyWebsite: companyWebsite || "",
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
      a.download = "agency-ux-report.pdf"
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(fileUrl)
    } catch (err) {
      alert("❌ PDF Error: " + err.message)
    }
  }

  // ✅ Invite Employee via Email (creates invite link)
  async function inviteEmployee() {
    if (!inviteEmail.trim()) return alert("Enter employee email ✅")
    if (!user?.uid) return alert("Login required ❌")

    setInviting(true)
    try {
      // ✅ Store invite in Firestore
      const inviteDoc = {
        agencyId: user.uid,
        agencyEmail: user.email,
        invitedEmail: inviteEmail.trim(),
        status: "pending",
        createdAt: new Date().toISOString(),
      }

      const ref = await addDoc(collection(db, "agency_invites"), inviteDoc)

      // ✅ Invite Link (simple)
      const inviteLink = `${window.location.origin}/signup?invite=${ref.id}`

      await navigator.clipboard.writeText(inviteLink)

      alert("✅ Invite created! Link copied.\nSend it to employee on WhatsApp/Email ✅")
      setInviteEmail("")
    } catch (err) {
      alert("❌ Invite failed: " + err.message)
    } finally {
      setInviting(false)
    }
  }

  // ✅ Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const t = `${e.name} ${e.email} ${e.employeeId} ${e.company}`.toLowerCase()
      return t.includes(search.toLowerCase())
    })
  }, [employees, search])

  // ✅ Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const t = `${r.url} ${r.uxScore}`.toLowerCase()
      return t.includes(reportSearch.toLowerCase())
    })
  }, [reports, reportSearch])

  return (
    <ProtectedRoute allowedRoles={["agency"]}>
      <Navbar />

      <main className="bg-slate-50 min-h-screen py-10 px-4">
        <div className="max-w-6xl mx-auto">

          {/* HEADER */}
          <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900">
                Agency Dashboard
              </h1>
              <p className="text-slate-600 mt-2">
                Manage employees + reports in one place.
              </p>
              <p className="text-sm mt-2 text-indigo-600 font-semibold">
                Logged in as: {user?.email}
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
              >
                + Add Employee
              </button>

              <a
                href="/dashboard"
                className="px-6 py-3 rounded-xl border font-semibold hover:bg-white"
              >
                Run Audit
              </a>
            </div>
          </div>

          {/* STATS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Employees" value={employees.length} />
            <StatCard title="Reports Generated" value={reports.length} />
            <StatCard title="Agency Name" value={companyName || "Not Set"} />
            <StatCard title="Plan" value="AGENCY" />
          </div>

          {/* AGENCY PROFILE */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm mb-10">
            <h2 className="text-lg font-bold text-slate-900">
              Agency Profile (Branding)
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              This will appear in your Agency PDF reports.
            </p>

            <div className="mt-4 grid md:grid-cols-2 gap-3">
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Agency Name (required)"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="Agency Website (optional)"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="mt-4 flex gap-3 flex-wrap">
              <button
                onClick={saveCompanyProfile}
                disabled={savingCompany}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingCompany ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>

          {/* INVITE EMPLOYEE */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm mb-10">
            <h2 className="text-lg font-bold text-slate-900">
              Invite Employee
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Create an invite link and share it with your employee.
            </p>

            <div className="mt-4 flex flex-col md:flex-row gap-3">
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="employee@email.com"
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={inviteEmployee}
                disabled={inviting}
                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-black disabled:opacity-60"
              >
                {inviting ? "Creating..." : "Create Invite Link"}
              </button>
            </div>
          </div>

          {/* REPORTS */}
          <ReportsTable
            reports={filteredReports}
            reportSearch={reportSearch}
            setReportSearch={setReportSearch}
            onView={(r) => setSelectedReport(r)}
            onPDF={downloadPDF}
            onRemove={removeReport}
            onClearAll={clearAllReports}
          />

          {/* EMPLOYEES */}
          <EmployeesTable
            employees={filteredEmployees}
            search={search}
            setSearch={setSearch}
            onEdit={openEdit}
            onRemove={removeEmployee}
            onClearAll={clearAllEmployees}
          />

          {/* ADD EMPLOYEE MODAL */}
          {showAddForm && (
            <Modal title="Add Employee" onClose={() => setShowAddForm(false)}>
              <div className="space-y-4">
                <Input label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Input label="Email *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                <Input label="Employee ID *" value={form.employeeId} onChange={(v) => setForm({ ...form, employeeId: v })} />
                <Input label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                <Input label="Position" value={form.position} onChange={(v) => setForm({ ...form, position: v })} />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="w-full border rounded-xl py-3 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={addEmployee}
                  className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </Modal>
          )}

          {/* EDIT EMPLOYEE MODAL */}
          {editOpen && editEmployee && (
            <Modal title="Edit Employee" onClose={() => setEditOpen(false)}>
              <div className="space-y-4">
                <Input label="Name *" value={editEmployee.name} onChange={(v) => setEditEmployee({ ...editEmployee, name: v })} />
                <Input label="Email *" value={editEmployee.email} onChange={(v) => setEditEmployee({ ...editEmployee, email: v })} />
                <Input label="Employee ID *" value={editEmployee.employeeId} onChange={(v) => setEditEmployee({ ...editEmployee, employeeId: v })} />
                <Input label="Company" value={editEmployee.company || ""} onChange={(v) => setEditEmployee({ ...editEmployee, company: v })} />
                <Input label="Position" value={editEmployee.position || ""} onChange={(v) => setEditEmployee({ ...editEmployee, position: v })} />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setEditOpen(false)}
                  className="w-full border rounded-xl py-3 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveEmployeeEdit}
                  className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700"
                >
                  Update
                </button>
              </div>
            </Modal>
          )}

          {/* VIEW REPORT MODAL */}
          {selectedReport && (
            <Modal title="Audit Report" onClose={() => setSelectedReport(null)} wide>
              <p className="text-sm text-slate-600 break-all mb-4">
                {selectedReport.url}
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <Box label="UX Score" value={selectedReport.uxScore} />
                <Box
                  label="Created"
                  value={
                    selectedReport.createdAt
                      ? new Date(selectedReport.createdAt).toLocaleString()
                      : "N/A"
                  }
                />
              </div>

              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div className="bg-slate-50 border rounded-2xl p-5">
                  <h4 className="font-bold mb-3">Issues</h4>
                  <ul className="list-disc ml-5 space-y-2 text-slate-700">
                    {(selectedReport.fullReport?.issues || []).map((i, idx) => (
                      <li key={idx}>{i}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 border rounded-2xl p-5">
                  <h4 className="font-bold mb-3">Recommendations</h4>
                  <ul className="list-disc ml-5 space-y-2 text-slate-700">
                    {(selectedReport.fullReport?.recommendations || []).map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Modal>
          )}

        </div>
      </main>
    </ProtectedRoute>
  )
}

/* ✅ UI Components */
function StatCard({ title, value }) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm">
      <p className="text-sm text-slate-600">{title}</p>
      <p className="text-2xl font-extrabold text-slate-900 mt-2">{value}</p>
    </div>
  )
}

function Input({ label, value, onChange }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
      <input
        className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}

function Box({ label, value }) {
  return (
    <div className="bg-white border rounded-2xl p-5">
      <p className="text-xs text-slate-600">{label}</p>
      <p className="text-xl font-extrabold text-indigo-600 mt-2">{value}</p>
    </div>
  )
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className={`bg-white w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-2xl shadow-xl p-6 overflow-auto max-h-[85vh]`}>
        <div className="flex justify-between items-start gap-3 mb-4">
          <h3 className="text-xl font-extrabold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border font-semibold hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/* ✅ Tables */
function ReportsTable({ reports, reportSearch, setReportSearch, onView, onPDF, onRemove, onClearAll }) {
  return (
    <div className="mt-10 bg-white border rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reports</h2>
          <p className="text-slate-600 text-sm mt-1">Realtime reports appear automatically ✅</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <input
            className="border rounded-xl px-4 py-3 w-full md:w-72 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search reports..."
            value={reportSearch}
            onChange={(e) => setReportSearch(e.target.value)}
          />

          <button
            onClick={onClearAll}
            className="px-5 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600"
          >
            Clear All
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="p-6 text-slate-500">
          No reports yet. Run audits from Dashboard ✅
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-sm text-slate-600">
                <th className="p-4">Website</th>
                <th className="p-4">Score</th>
                <th className="p-4">Created</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t hover:bg-slate-50 transition">
                  <td className="p-4 font-semibold text-slate-900 break-all">{r.url}</td>
                  <td className="p-4 font-bold text-indigo-600">{r.uxScore}</td>
                  <td className="p-4 text-slate-500 text-sm">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString() : "N/A"}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2 flex-wrap">
                    <button
                      onClick={() => onView(r)}
                      className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-black"
                    >
                      View
                    </button>

                    <button
                      onClick={() => onPDF(r)}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                    >
                      PDF
                    </button>

                    <button
                      onClick={() => onRemove(r.id)}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  )
}

function EmployeesTable({ employees, search, setSearch, onEdit, onRemove, onClearAll }) {
  return (
    <div className="mt-10 bg-white border rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Employees</h2>
          <p className="text-slate-600 text-sm mt-1">Manage employees here ✅</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <input
            className="border rounded-xl px-4 py-3 w-full md:w-80 outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            onClick={onClearAll}
            className="px-5 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600"
          >
            Clear All
          </button>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="p-6 text-slate-500">
          No employees found ✅
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="text-sm text-slate-600">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Employee ID</th>
                <th className="p-4">Company</th>
                <th className="p-4">Position</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-t hover:bg-slate-50 transition">
                  <td className="p-4 font-semibold text-slate-900">{e.name}</td>
                  <td className="p-4 text-slate-700">{e.email}</td>
                  <td className="p-4 text-slate-700">{e.employeeId}</td>
                  <td className="p-4 text-slate-700">{e.company || "—"}</td>
                  <td className="p-4 text-slate-700">{e.position || "—"}</td>
                  <td className="p-4 text-right flex justify-end gap-2 flex-wrap">
                    <button
                      onClick={() => onEdit(e)}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => onRemove(e.id)}
                      className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  )
}
