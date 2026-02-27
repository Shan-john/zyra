import { useState } from "react";
import { Users, Plus, X, Edit2, Trash2, UserCheck } from "lucide-react";

const EMP_SEED = [
  { id: 1, empId: "E-1001", name: "Ravi Kumar",     dept: "Production",    role: "Machine Operator",  salary: 42000, status: "Active",   attendance: 96, joinDate: "2022-04-01" },
  { id: 2, empId: "E-1002", name: "Anita Sharma",   dept: "Production",    role: "Machine Operator",  salary: 38000, status: "Active",   attendance: 92, joinDate: "2021-09-15" },
  { id: 3, empId: "E-1003", name: "Vijay Singh",    dept: "Engineering",   role: "CNC Programmer",    salary: 65000, status: "Active",   attendance: 98, joinDate: "2020-01-10" },
  { id: 4, empId: "E-1004", name: "Priya Nair",     dept: "Quality",       role: "QC Inspector",      salary: 52000, status: "Active",   attendance: 88, joinDate: "2023-03-22" },
  { id: 5, empId: "E-1005", name: "Suresh Rao",     dept: "Maintenance",   role: "Maintenance Tech",  salary: 44000, status: "Active",   attendance: 94, joinDate: "2019-07-05" },
  { id: 6, empId: "E-1006", name: "Kavitha Iyer",   dept: "HR",            role: "HR Manager",        salary: 78000, status: "Active",   attendance: 99, joinDate: "2018-02-14" },
  { id: 7, empId: "E-1007", name: "Ramesh Pillai",  dept: "Finance",       role: "Finance Head",      salary: 95000, status: "Active",   attendance: 97, joinDate: "2017-11-30" },
  { id: 8, empId: "E-1008", name: "Deepa Menon",    dept: "Production",    role: "Shift Supervisor",  salary: 58000, status: "On Leave", attendance: 75, joinDate: "2021-05-18" },
];

const DEPTS = ["Production","Engineering","Quality","Maintenance","HR","Finance","Sales","Supply Chain"];
const ROLES = ["Machine Operator","CNC Programmer","QC Inspector","Maintenance Tech","HR Manager","Finance Head","Shift Supervisor","Floor Manager"];
const STATUSES = ["Active","On Leave","Terminated"];

const BLANK = { empId: "", name: "", dept: "Production", role: "Machine Operator", salary: "", status: "Active", attendance: "", joinDate: "" };

export default function HrPage() {
  const [employees, setEmployees] = useState(EMP_SEED);
  const [modal, setModal]         = useState(null);
  const [form, setForm]           = useState(BLANK);
  const [search, setSearch]       = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) &&
    (deptFilter ? e.dept === deptFilter : true)
  );

  const save = () => {
    const entry = { ...form, salary: Number(form.salary), attendance: Number(form.attendance) };
    if (modal === "add") setEmployees(p => [...p, { ...entry, id: Date.now() }]);
    else setEmployees(p => p.map(e => e.id === form.id ? entry : e));
    setModal(null);
  };

  const totalPayroll = employees.filter(e=>e.status==="Active").reduce((s,e)=>s+e.salary,0);
  const avgAttendance = Math.round(employees.reduce((s,e)=>s+e.attendance,0)/employees.length);
  const onLeave = employees.filter(e=>e.status==="On Leave").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2"><Users size={24} className="text-primary-600" /> Human Resources</h1>
          <p className="text-surface-600 mt-1">Employee directory, attendance, and payroll management.</p>
        </div>
        <button onClick={()=>{ setForm(BLANK); setModal("add"); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Employee</button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center"><div className="text-2xl font-bold text-primary-700">{employees.length}</div><div className="text-xs text-surface-500 mt-1">Total Employees</div></div>
        <div className="card text-center"><div className="text-2xl font-bold text-success-600">{employees.filter(e=>e.status==="Active").length}</div><div className="text-xs text-surface-500 mt-1">Active</div></div>
        <div className="card text-center"><div className="text-2xl font-bold text-warning-600">{onLeave}</div><div className="text-xs text-surface-500 mt-1">On Leave</div></div>
        <div className="card text-center"><div className="text-2xl font-bold text-primary-700">₹{(totalPayroll/1000).toFixed(0)}k</div><div className="text-xs text-surface-500 mt-1">Monthly Payroll</div></div>
      </div>

      <div className="card flex gap-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employees…" className="input-field flex-1" />
        <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} className="input-field w-48">
          <option value="">All Departments</option>
          {DEPTS.map(d=><option key={d}>{d}</option>)}
        </select>
        {(search||deptFilter) && <button onClick={()=>{setSearch("");setDeptFilter("");}} className="text-xs text-primary-600 hover:underline">Clear</button>}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-50 border-b border-surface-200">
            <tr>{["Emp ID","Name","Department","Role","Join Date","Attendance","Monthly Salary","Status","Actions"].map(h=><th key={h} className="text-left py-3 px-3 font-semibold text-surface-700 whitespace-nowrap">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id} className="border-b border-surface-100 hover:bg-surface-50 transition">
                <td className="py-3 px-3 font-mono text-xs">{e.empId}</td>
                <td className="py-3 px-3 font-medium flex items-center gap-2 mt-1">
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">{e.name[0]}</div>
                  {e.name}
                </td>
                <td className="py-3 px-3 text-surface-600">{e.dept}</td>
                <td className="py-3 px-3 text-surface-500 text-xs">{e.role}</td>
                <td className="py-3 px-3 text-surface-500">{e.joinDate}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${e.attendance >= 90 ? "bg-success-500" : e.attendance >= 75 ? "bg-warning-500" : "bg-danger-500"}`} style={{ width: `${e.attendance}%` }} />
                    </div>
                    <span className="text-xs">{e.attendance}%</span>
                  </div>
                </td>
                <td className="py-3 px-3 font-semibold text-surface-700">₹{e.salary.toLocaleString()}</td>
                <td className="py-3 px-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.status==="Active"?"bg-success-100 text-success-700":e.status==="On Leave"?"bg-warning-100 text-warning-700":"bg-danger-100 text-danger-700"}`}>{e.status}</span></td>
                <td className="py-3 px-3">
                  <div className="flex gap-2">
                    <button onClick={()=>{setForm({...e});setModal("edit");}} className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"><Edit2 size={13} /></button>
                    <button onClick={()=>setEmployees(p=>p.filter(x=>x.id!==e.id))} className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded transition"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-12 text-center text-surface-500">No employees match your search.</div>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-5 border-b"><h3 className="font-bold">{modal==="add"?"Add Employee":"Edit Employee"}</h3><button onClick={()=>setModal(null)} className="p-1 bg-surface-100 rounded-full"><X size={16} /></button></div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[["Employee ID","empId","text"],["Full Name","name","text"],["Join Date","joinDate","date"],["Monthly Salary (₹)","salary","number"],["Attendance %","attendance","number"]].map(([l,f,t])=>(
                <div key={f}><label className="block text-xs font-semibold text-surface-700 mb-1">{l}</label><input type={t} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})} className="input-field w-full" /></div>
              ))}
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Department</label><select value={form.dept} onChange={e=>setForm({...form,dept:e.target.value})} className="input-field w-full">{DEPTS.map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Role</label><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="input-field w-full">{ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="input-field w-full">{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={()=>setModal(null)} className="btn-secondary">Cancel</button><button onClick={save} className="btn-primary">Save Employee</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
