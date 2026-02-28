import { useState, useEffect } from "react";
import { Users, Plus, X, Edit2, Trash2, Search, Filter } from "lucide-react";
import * as api from "../../api/hrApi";

const DEPTS = ["Production","Engineering","Quality","Maintenance","HR","Finance","Sales","Supply Chain","Operations"];
const ROLES = ["Machine Operator","CNC Programmer","QC Inspector","Maintenance Tech","HR Manager","Finance Head","Shift Supervisor","Floor Manager","Senior Engineer","Operations Lead","Finance Analyst","Production Supervisor"];
const STATUSES = ["active","on_leave","terminated"];
const STATUS_LABEL = { active: "Active", on_leave: "On Leave", terminated: "Terminated" };
const STATUS_STYLE = {
  active: "bg-green-100 text-green-700",
  on_leave: "bg-yellow-100 text-yellow-700",
  terminated: "bg-red-100 text-red-700",
};

const BLANK = {
  employeeId: "",
  firstName: "",
  lastName: "",
  department: "Production",
  designation: "Machine Operator",
  salary: "",
  status: "active",
  attendance: 95,
  joinDate: "",
  email: "",
  phone: "",
};

export default function HrPage() {
  const [employees, setEmployees]   = useState([]);
  const [modal, setModal]           = useState(null); // null | "add" | "edit"
  const [form, setForm]             = useState(BLANK);
  const [search, setSearch]         = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);

  /* ── Load ── */
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getEmployees({ limit: 200 });
      const data = res.data?.data?.employees ?? res.data?.data ?? [];
      setEmployees(Array.isArray(data) ? data : Object.values(data));
    } catch (err) {
      console.error("HR load error", err);
      setError("Could not load employee data. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* ── Filter ── */
  const filtered = employees.filter(e => {
    const fullName = `${e.firstName || ""} ${e.lastName || ""}`.toLowerCase();
    const matchSearch = fullName.includes(search.toLowerCase()) ||
      (e.employeeId || "").toLowerCase().includes(search.toLowerCase());
    const matchDept   = deptFilter   ? e.department === deptFilter   : true;
    const matchStatus = statusFilter ? e.status     === statusFilter : true;
    return matchSearch && matchDept && matchStatus;
  });

  /* ── KPIs ── */
  const activeCount  = employees.filter(e => e.status === "active").length;
  const onLeaveCount = employees.filter(e => e.status === "on_leave").length;
  const totalPayroll = employees.filter(e => e.status === "active")
    .reduce((s, e) => s + (Number(e.salary) || 0), 0);

  /* ── Save ── */
  const openAdd  = () => { setForm({ ...BLANK, joinDate: new Date().toISOString().split("T")[0] }); setModal("add"); };
  const openEdit = (emp) => { setForm({ ...emp }); setModal("edit"); };
  const closeModal = () => { setModal(null); setForm(BLANK); };

  const save = async () => {
    if (!form.firstName || !form.employeeId) {
      alert("Employee ID and First Name are required.");
      return;
    }
    try {
      setSaving(true);
      const payload = { ...form, salary: Number(form.salary), attendance: Number(form.attendance) };
      if (modal === "add") {
        await api.addEmployee(payload);
      } else {
        // update — re-use addEmployee (upsert by ID) or extend API later
        await api.addEmployee(payload);
      }
      closeModal();
      await loadData();
    } catch (err) {
      console.error("Save error", err);
      if (err.response?.status === 409) {
        alert("Employee ID already exists. Use a unique ID.");
      } else {
        alert("Failed to save employee: " + (err.response?.data?.message || err.message));
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── UI ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-surface-500 text-sm">Loading HR data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <div className="text-danger-500 text-4xl mb-3">⚠</div>
          <p className="text-surface-700 font-medium mb-2">Failed to load HR data</p>
          <p className="text-surface-500 text-sm mb-4">{error}</p>
          <button onClick={loadData} className="btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2">
            <Users size={24} className="text-primary-600" /> Human Resources
          </h1>
          <p className="text-surface-600 mt-1">Employee directory, attendance &amp; payroll management.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Employee
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Employees", value: employees.length, color: "text-primary-700" },
          { label: "Active",          value: activeCount,       color: "text-green-600" },
          { label: "On Leave",        value: onLeaveCount,      color: "text-yellow-600" },
          { label: "Monthly Payroll", value: `₹${(totalPayroll/1000).toFixed(0)}k`, color: "text-primary-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-surface-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="card flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or ID…"
            className="input-field pl-9 w-full"
          />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input-field w-44">
          <option value="">All Departments</option>
          {DEPTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-36">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        {(search || deptFilter || statusFilter) && (
          <button onClick={() => { setSearch(""); setDeptFilter(""); setStatusFilter(""); }}
            className="text-xs text-primary-600 hover:underline flex items-center gap-1">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-surface-500">
            {employees.length === 0 ? "No employees found." : "No employees match your search."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                {["Emp ID","Name","Department","Designation","Join Date","Attendance","Salary","Status","Actions"]
                  .map(h => <th key={h} className="text-left py-3 px-3 font-semibold text-surface-700 whitespace-nowrap">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const fullName = `${e.firstName || ""} ${e.lastName || ""}`.trim() || "—";
                const initial  = (e.firstName || "?")[0].toUpperCase();
                const att      = Number(e.attendance) || 0;
                return (
                  <tr key={e.employeeId} className="border-b border-surface-100 hover:bg-surface-50 transition">
                    <td className="py-3 px-3 font-mono text-xs text-surface-500">{e.employeeId}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {initial}
                        </div>
                        <div>
                          <div className="font-medium text-surface-900">{fullName}</div>
                          <div className="text-xs text-surface-400">{e.email || ""}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-surface-600">{e.department || "—"}</td>
                    <td className="py-3 px-3 text-surface-500 text-xs">{e.designation || "—"}</td>
                    <td className="py-3 px-3 text-surface-500">{e.joinDate || "—"}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${att >= 90 ? "bg-green-500" : att >= 75 ? "bg-yellow-500" : "bg-red-500"}`}
                            style={{ width: `${att}%` }}
                          />
                        </div>
                        <span className="text-xs">{att}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-surface-700">
                      {e.salary ? `₹${Number(e.salary).toLocaleString()}` : "—"}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[e.status] || "bg-surface-100 text-surface-600"}`}>
                        {STATUS_LABEL[e.status] || e.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(e)}
                          className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
              <h3 className="font-bold text-lg">{modal === "add" ? "Add Employee" : "Edit Employee"}</h3>
              <button onClick={closeModal} className="p-1 bg-surface-100 rounded-full hover:bg-surface-200 transition">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[
                ["Employee ID *", "employeeId", "text"],
                ["First Name *",  "firstName",  "text"],
                ["Last Name",     "lastName",   "text"],
                ["Email",         "email",      "email"],
                ["Phone",         "phone",      "text"],
                ["Join Date",     "joinDate",   "date"],
                ["Monthly Salary (₹)", "salary","number"],
                ["Attendance %",  "attendance", "number"],
              ].map(([label, field, type]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">{label}</label>
                  <input
                    type={type}
                    value={form[field] ?? ""}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    className="input-field w-full"
                    disabled={modal === "edit" && field === "employeeId"}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Department</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="input-field w-full">
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Designation</label>
                <select value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} className="input-field w-full">
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-surface-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field w-full">
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t sticky bottom-0 bg-white">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                {saving ? "Saving…" : "Save Employee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
