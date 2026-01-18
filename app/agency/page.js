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
  getDoc,
} from "firebase/firestore"

export default function AgencyPage() {
  const [user, setUser] = useState(null)

  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState("")
  const [showForm, setShowForm] = useState(false)

  // ✅ Company Name
  const [companyName, setCompanyName] = useState("")
  const [savingCompany, setSavingCompany] = useState(false)

  // ✅ Reports
  const [reports, setReports] = useState([])
  const [reportSearch, setReportSearch] = useState("")
  const [selectedReport, setSelectedReport] = useState(null)

  const [form, setForm] = useState({
    name: "",
    email: "",
    employeeId: "",
    company: "",
    position: "",
  })

  // ✅ Load Data
  useEffect(() => {
    const u = getUser()
    if (!u) return
    setUser(u)

    // ✅ Load company name (local)
    const savedCompany = localStorage.getItem("agency_company_" + u?.email)
    if (savedCompany) setCompanyName(savedCompany)

    // ✅ Employees local
    const savedEmployees = JSON.parse(localStorage.getItem("agency_employees") || "[]")
    setEmployees(savedEmployees)

    // ✅ Reports local (only current agency)
    const allReports = JSON.parse(localStorage.getItem("agency_reports") || "[]")
    const myReports = allReports.filter((r) => r.agencyEmail === u?.email)
    setReports(myReports)

    // ✅ Firestore load (real)
    if (u?.uid) {
      loadFirebaseCompany(u.uid)
      loadFirebaseEmployees(u.uid)
      loadFirebaseReports(u.uid)
    }
  }, [])

  // ✅ Load Company from Firebase
  async function loadFirebaseCompany(uid) {
    try {
      const ref = doc(db, "users", uid)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        const data = snap.data()
        if (data?.companyName) {
          setCompanyName(data.companyName)
        }
      }
    } catch (err) {
      console.log("Firebase company load failed:", err.message)
    }
  }

  // ✅ Load Employees from Firebase
  async function loadFirebaseEmployees(agencyId) {
    try {
      const q = query(collection(db, "employees"), where("agencyId", "==", agencyId))
      const snap = await getDocs(q)
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setEmployees(list)
    } catch (err) {
      console.log("Firebase employees load failed:", err.message)
    }
  }

  // ✅ Load Reports from Firebase
  async function loadFirebaseReports(agencyId) {
    try {
      const q = query(collection(db, "reports"), where("agencyId", "==", agencyId))
      const snap = await getDocs(q)
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      setReports(list)
    } catch (err) {
      console.log("Firebase reports load failed:", err.message)
    }
  }

  // ✅ Save Company Name (local + firebase)
  async function saveCompanyName() {
    if (!companyName.trim()) {
      alert("Enter company name ✅")
      return
    }

    if (!user?.uid) {
      alert("Login required ❌")
      return
    }

    setSavingCompany(true)
    try {
      // ✅ local save
      localStorage.setItem("agency_company_" + user?.email, companyName)

      // ✅ firebase save
      await updateDoc(doc(db, "users", user.uid), {
        companyName,
        updatedAt: new Date().toISOString(),
      })

      alert("✅ Company name saved successfully!")
    } catch (err) {
      alert("❌ Failed to save company name: " + err.message)
    } finally {
      setSavingCompany(false)
    }
  }

  // ✅ Add Employee (firebase)
  async function addEmployee() {
    if (!form.name || !form.email || !form.employeeId) {
      alert("Fill required fields ✅")
      return
    }

    if (!user?.uid) {
      alert("Login required ❌")
      return
    }

    try {
      const newEmployee = {
        ...form,
        agencyId: user.uid,
        createdAt: new Date().toISOString(),
      }

      await addDoc(collection(db, "employees"), newEmployee)
      loadFirebaseEmployees(user.uid)

      setForm({
        name: "",
        email: "",
        employeeId: "",
        company: "",
        position: "",
      })
      setShowForm(false)
    } catch (err) {
      alert("❌ Failed to add employee: " + err.message)
    }
  }

  // ✅ Delete Employee
  async function deleteEmployee(empId) {
    const ok = confirm("Remove this employee?")
    if (!ok) return

    try {
      await deleteDoc(doc(db, "employees", empId))
      loadFirebaseEmployees(user.uid)
    } catch (err) {
      alert("❌ Failed to delete employee: " + err.message)
    }
  }

  // ✅ Delete Report
  async function deleteReport(reportId) {
    const ok = confirm("Remove this report?")
    if (!ok) return

    try {
      await deleteDoc(doc(db, "reports", reportId))
      loadFirebaseReports(user.uid)
      setSelectedReport(null)
    } catch (err) {
      alert("❌ Failed to delete report: " + err.message)
    }
  }

  // ✅ Download PDF (Agency Format)
  async function downloadPDF(reportData) {
    try {
      const payload = {
        ...(reportData?.fullReport || reportData),
        url: reportData?.url || reportData?.fullReport?.url || "",
        uxScore: reportData?.uxScore || reportData?.fullReport?.uxScore || 0,

        // ✅ Force Agency PDF format
        role: "agency",
        plan: "agency",
        agencyName: companyName || "Agency",
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
      a.download = "ux-audit-report-agency.pdf"
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(fileUrl)
    } catch (err) {
      alert("❌ PDF Error: " + err.message)
    }
  }

  // ✅ Filter Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((e) => {
      const text = `${e.name} ${e.email} ${e.employeeId}`.toLowerCase()
      return text.includes(search.toLowerCase())
    })
  }, [employees, search])

  // ✅ Filter Reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const text = `${r.url} ${r.uxScore}`.toLowerCase()
      return text.includes(reportSearch.toLowerCase())
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
                Manage employees + audit reports in one place.
              </p>
              <p className="text-sm mt-2 text-indigo-600 font-semibold">
                Logged in as: {user?.email}
              </p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 hover:scale-[1.01]"
              >
                + Add Employee
              </button>

              <a
                href="/dashboard"
                className="px-6 py-3 rounded-xl border font-semibold hover:bg-white hover:scale-[1.01]"
              >
                Run Audit
              </a>
            </div>
          </div>

          {/* ✅ COMPANY NAME BOX */}
          <div className="bg-white border rounded-2xl p-6 shadow-sm mb-8">
            <h2 className="text-lg font-bold text-slate-900">
              Company Name
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              This will show in your dashboard every time you login.
            </p>

            <div className="mt-4 flex flex-col md:flex-row gap-3">
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter your company name..."
                className="w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={saveCompanyName}
                disabled={savingCompany}
                className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
              >
                {savingCompany ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* STATS */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Employees" value={employees.length} />
            <StatCard title="Company" value={companyName || "Not Set"} />
            <StatCard title="Active Plan" value="AGENCY" />
            <StatCard title="Reports Generated" value={reports.length} />
          </div>

          {/* ✅ REPORTS TABLE */}
          <div className="mt-10 bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Audit Reports
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  View + manage reports generated by your agency.
                </p>
              </div>

              <input
                className="border rounded-xl px-4 py-3 w-full md:w-72 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Search reports..."
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
              />
            </div>

            {filteredReports.length === 0 ? (
              <div className="p-6 text-slate-500">
                No reports yet ✅ Run audits from Dashboard.
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
                    {filteredReports.map((r) => (
                      <tr key={r.id} className="border-t hover:bg-slate-50 transition">
                        <td className="p-4 font-semibold text-slate-900 break-all">{r.url}</td>
                        <td className="p-4 font-bold text-indigo-600">{r.uxScore}</td>
                        <td className="p-4 text-slate-500 text-sm">
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : "N/A"}
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2 flex-wrap">
                          <button
                            onClick={() => setSelectedReport(r)}
                            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-black"
                          >
                            View
                          </button>

                          <button
                            onClick={() => downloadPDF(r)}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                          >
                            PDF
                          </button>

                          <button
                            onClick={() => deleteReport(r.id)}
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

          {/* ✅ EMPLOYEES TABLE */}
          <div className="mt-10 bg-white border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Employees List
                </h2>
                <p className="text-slate-600 text-sm mt-1">
                  Employees who can access and work in your agency.
                </p>
              </div>

              <input
                className="border rounded-xl px-4 py-3 w-full md:w-80 outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Search employee..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {filteredEmployees.length === 0 ? (
              <div className="p-6 text-slate-500">
                No employees found. Click <b>“Add Employee”</b> ✅
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
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredEmployees.map((e) => (
                      <tr key={e.id} className="border-t hover:bg-slate-50 transition">
                        <td className="p-4 font-semibold text-slate-900">{e.name}</td>
                        <td className="p-4 text-slate-700">{e.email}</td>
                        <td className="p-4 text-slate-700">{e.employeeId}</td>
                        <td className="p-4 text-slate-700">{e.company || "—"}</td>
                        <td className="p-4 text-slate-700">{e.position || "—"}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => deleteEmployee(e.id)}
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

          {/* ✅ ADD EMPLOYEE MODAL */}
          {showForm && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center px-4 z-50">
              <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-slate-900">Add Employee</h3>

                <div className="mt-6 space-y-4">
                  <Input label="Employee Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                  <Input label="Employee Email *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
                  <Input label="Employee ID *" value={form.employeeId} onChange={(v) => setForm({ ...form, employeeId: v })} />
                  <Input label="Company Name" value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
                  <Input label="Position (optional)" value={form.position} onChange={(v) => setForm({ ...form, position: v })} />
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-full border rounded-xl py-3 font-semibold hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={addEmployee}
                    className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700"
                  >
                    Save Employee
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ✅ VIEW REPORT MODAL */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
              <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6 overflow-auto max-h-[85vh]">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">Audit Report</h3>
                    <p className="text-slate-600 text-sm break-all mt-1">
                      {selectedReport.url}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadPDF(selectedReport)}
                      className="px-4 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700"
                    >
                      Download PDF
                    </button>

                    <button
                      onClick={() => setSelectedReport(null)}
                      className="px-4 py-2 rounded-xl border font-semibold hover:bg-slate-50"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border rounded-2xl p-5">
                    <p className="text-sm text-slate-600">UX Score</p>
                    <p className="text-3xl font-extrabold text-indigo-600 mt-2">
                      {selectedReport.uxScore}
                    </p>
                  </div>

                  <div className="bg-slate-50 border rounded-2xl p-5">
                    <p className="text-sm text-slate-600">Created</p>
                    <p className="font-semibold text-slate-900 mt-2">
                      {selectedReport.createdAt
                        ? new Date(selectedReport.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <div className="bg-white border rounded-2xl p-5">
                    <h4 className="font-bold text-slate-900 mb-3">Issues Found</h4>
                    <ul className="list-disc ml-5 space-y-2 text-slate-700">
                      {(selectedReport.fullReport?.issues || []).map((i, idx) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border rounded-2xl p-5">
                    <h4 className="font-bold text-slate-900 mb-3">Recommendations</h4>
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
function StatCard({ title, value }) {
  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition">
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
