import { useState } from "react";
import { Factory, Plus, X, Edit2, Trash2, PlayCircle, PauseCircle, CheckSquare, AlertCircle } from "lucide-react";

const MACHINE_SEED = [
  { id: "M01", name: "Assembly Line A",      type: "assembly",  capacity: 8,  status: "Running",  risk: 12,  operator: "Ravi Kumar",     lastMaint: "2026-02-10" },
  { id: "M02", name: "Assembly Line B",      type: "assembly",  capacity: 8,  status: "High Risk", risk: 55, operator: "Anita Sharma",   lastMaint: "2026-01-28" },
  { id: "M03", name: "CNC Machine #1",       type: "cnc",       capacity: 10, status: "Running",  risk: 30,  operator: "Vijay Singh",    lastMaint: "2026-02-15" },
  { id: "M04", name: "CNC Machine #2",       type: "cnc",       capacity: 10, status: "High Risk", risk: 72, operator: "Priya Nair",     lastMaint: "2026-01-15" },
  { id: "M05", name: "Casting Station",      type: "casting",   capacity: 12, status: "Running",  risk: 18,  operator: "Suresh Rao",     lastMaint: "2026-02-20" },
  { id: "M06", name: "Welding Bay Alpha",    type: "welding",   capacity: 8,  status: "Running",  risk: 40,  operator: "Mohan Das",      lastMaint: "2026-02-01" },
  { id: "M07", name: "Hydraulic Press #1",   type: "pressing",  capacity: 8,  status: "High Risk", risk: 62, operator: "Kavitha Iyer",   lastMaint: "2026-01-20" },
  { id: "M08", name: "Heat Treatment Oven",  type: "furnace",   capacity: 16, status: "Running",  risk: 25,  operator: "Ramesh Pillai",  lastMaint: "2026-02-18" },
  { id: "M09", name: "Robotic Welding Arm",  type: "welding",   capacity: 10, status: "Offline",  risk: 90,  operator: "Deepa Menon",    lastMaint: "2025-12-01" },
  { id: "M10", name: "Laser Cutting Unit",   type: "cnc",       capacity: 12, status: "Running",  risk: 20,  operator: "Arjun Patel",    lastMaint: "2026-02-22" },
];

const WORK_ORDERS = [
  { id: "WO-1001", job: "Steel Frame Assembly",    machine: "Assembly Line A", hours: 3, priority: "High",   status: "In Progress" },
  { id: "WO-1002", job: "CNC Shaft Machining",     machine: "CNC Machine #1",  hours: 2, priority: "Medium", status: "Queued" },
  { id: "WO-1003", job: "Precision Gear Cutting",  machine: "CNC Machine #2",  hours: 4, priority: "High",   status: "In Progress" },
  { id: "WO-1004", job: "Aluminum Die Casting",    machine: "Casting Station", hours: 5, priority: "Low",    status: "Queued" },
  { id: "WO-1005", job: "Surface Heat Treatment",  machine: "Heat Treatment Oven", hours: 6, priority: "Medium", status: "Complete" },
];

const riskColor = (risk) => {
  if (risk >= 60) return "text-danger-600 bg-danger-50";
  if (risk >= 35) return "text-warning-600 bg-warning-50";
  return "text-success-600 bg-success-50";
};

const statusBadge = (status) => {
  const map = {
    "Running":   "bg-success-100 text-success-700",
    "High Risk": "bg-danger-100 text-danger-700",
    "Offline":   "bg-surface-200 text-surface-600",
    "Maintenance":"bg-warning-100 text-warning-700",
  };
  return map[status] || "bg-surface-100 text-surface-600";
};

const woBadge = (status) => {
  const map = {
    "In Progress": "bg-primary-100 text-primary-700",
    "Queued":      "bg-surface-100 text-surface-600",
    "Complete":    "bg-success-100 text-success-700",
  };
  return map[status] || "bg-surface-100";
};

const BLANK_M = { id: "", name: "", type: "assembly", capacity: 8, status: "Running", risk: 10, operator: "", lastMaint: "" };
const BLANK_W = { id: "", job: "", machine: "", hours: 1, priority: "Medium", status: "Queued" };

export default function ProductionPage() {
  const [machines, setMachines] = useState(MACHINE_SEED);
  const [orders, setOrders]     = useState(WORK_ORDERS);
  const [machModal, setMachModal] = useState(null);
  const [woModal, setWoModal]     = useState(null);
  const [mForm, setMForm]   = useState(BLANK_M);
  const [woForm, setWoForm] = useState(BLANK_W);

  const saveMachine = () => {
    const entry = { ...mForm, capacity: Number(mForm.capacity), risk: Number(mForm.risk) };
    if (machModal === "add") setMachines(p => [...p, { ...entry, id: `M${String(p.length+1).padStart(2,"0")}` }]);
    else setMachines(p => p.map(m => m.id === entry.id ? entry : m));
    setMachModal(null);
  };
  const deleteMachine = (id) => setMachines(p => p.filter(m => m.id !== id));

  const saveWO = () => {
    if (woModal === "add") setOrders(p => [...p, { ...woForm, id: `WO-${1000 + p.length + 1}`, hours: Number(woForm.hours) }]);
    else setOrders(p => p.map(o => o.id === woForm.id ? { ...woForm, hours: Number(woForm.hours) } : o));
    setWoModal(null);
  };
  const deleteWO = (id) => setOrders(p => p.filter(o => o.id !== id));

  const running  = machines.filter(m => m.status === "Running").length;
  const highRisk = machines.filter(m => m.risk >= 60).length;
  const offline  = machines.filter(m => m.status === "Offline").length;

  const TYPES = ["assembly","cnc","casting","welding","pressing","furnace"];
  const STATUSES = ["Running","High Risk","Offline","Maintenance"];
  const PRIORITIES = ["High","Medium","Low"];
  const WO_STATUSES = ["Queued","In Progress","Complete"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2"><Factory size={24} className="text-primary-600" /> Production Management</h1>
          <p className="text-surface-600 mt-1">Manage machines, schedules, and work orders.</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center"><div className="text-2xl font-bold text-primary-700">{machines.length}</div><div className="text-xs text-surface-500 mt-1">Total Machines</div></div>
        <div className="card text-center"><div className="text-2xl font-bold text-success-600">{running}</div><div className="text-xs text-surface-500 mt-1">Running</div></div>
        <div className="card text-center"><div className="text-2xl font-bold text-danger-600">{highRisk}</div><div className="text-xs text-surface-500 mt-1">High Risk</div></div>
        <div className="card text-center"><div className="text-2xl font-bold text-surface-400">{offline}</div><div className="text-xs text-surface-500 mt-1">Offline</div></div>
      </div>

      {/* Machines Table */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-surface-900">Machine Fleet ({machines.length} machines)</h2>
          <button onClick={() => { setMForm(BLANK_M); setMachModal("add"); }} className="btn-primary flex items-center gap-2 text-sm"><Plus size={16} /> Add Machine</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                {["ID","Machine Name","Type","Capacity","Operator","Last Maint.","Risk %","Status","Actions"].map(h => (
                  <th key={h} className="text-left py-3 px-3 font-semibold text-surface-700 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {machines.map(m => (
                <tr key={m.id} className="border-b border-surface-100 hover:bg-surface-50 transition">
                  <td className="py-2.5 px-3 font-mono text-xs font-bold text-surface-600">{m.id}</td>
                  <td className="py-2.5 px-3 font-medium">{m.name}</td>
                  <td className="py-2.5 px-3 text-surface-500 capitalize">{m.type}</td>
                  <td className="py-2.5 px-3">{m.capacity}h/day</td>
                  <td className="py-2.5 px-3 text-surface-600">{m.operator}</td>
                  <td className="py-2.5 px-3 text-surface-500">{m.lastMaint}</td>
                  <td className="py-2.5 px-3">
                    <span className={`font-bold text-xs px-2 py-1 rounded ${riskColor(m.risk)}`}>{m.risk}%</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(m.status)}`}>{m.status}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setMForm({...m}); setMachModal("edit"); }} className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"><Edit2 size={13} /></button>
                      <button onClick={() => deleteMachine(m.id)} className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded transition"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Work Orders */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-surface-900">Work Orders</h2>
          <button onClick={() => { setWoForm(BLANK_W); setWoModal("add"); }} className="btn-secondary flex items-center gap-2 text-sm"><Plus size={16} /> New Work Order</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                {["WO ID","Job","Machine","Hours","Priority","Status","Actions"].map(h => (
                  <th key={h} className="text-left py-3 px-4 font-semibold text-surface-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-surface-100 hover:bg-surface-50 transition">
                  <td className="py-3 px-4 font-mono text-xs">{o.id}</td>
                  <td className="py-3 px-4 font-medium">{o.job}</td>
                  <td className="py-3 px-4 text-surface-600">{o.machine}</td>
                  <td className="py-3 px-4">{o.hours}h</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.priority === "High" ? "bg-danger-100 text-danger-700" : o.priority === "Medium" ? "bg-warning-100 text-warning-700" : "bg-surface-100 text-surface-600"}`}>{o.priority}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${woBadge(o.status)}`}>{o.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setWoForm({...o}); setWoModal("edit"); }} className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"><Edit2 size={13} /></button>
                      <button onClick={() => deleteWO(o.id)} className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded transition"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Machine Modal */}
      {machModal && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-5 border-b border-surface-200">
              <h3 className="font-bold text-surface-900">{machModal === "add" ? "Add Machine" : "Edit Machine"}</h3>
              <button onClick={() => setMachModal(null)} className="p-1 bg-surface-100 rounded-full"><X size={16} /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[["Machine Name","name","text"],["Operator","operator","text"],["Last Maintenance","lastMaint","date"],["Daily Capacity (hrs)","capacity","number"],["Risk %","risk","number"]].map(([label,field,type]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">{label}</label>
                  <input type={type} value={mForm[field]} onChange={e => setMForm({...mForm, [field]: e.target.value})} className="input-field w-full" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Type</label>
                <select value={mForm.type} onChange={e => setMForm({...mForm, type: e.target.value})} className="input-field w-full">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Status</label>
                <select value={mForm.status} onChange={e => setMForm({...mForm, status: e.target.value})} className="input-field w-full">
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-surface-200">
              <button onClick={() => setMachModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveMachine} className="btn-primary">Save Machine</button>
            </div>
          </div>
        </div>
      )}

      {/* Work Order Modal */}
      {woModal && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b border-surface-200">
              <h3 className="font-bold text-surface-900">{woModal === "add" ? "New Work Order" : "Edit Work Order"}</h3>
              <button onClick={() => setWoModal(null)} className="p-1 bg-surface-100 rounded-full"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              {[["Job Description","job","text"],["Machine","machine","text"],["Duration (hours)","hours","number"]].map(([label,field,type]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">{label}</label>
                  <input type={type} value={woForm[field]} onChange={e => setWoForm({...woForm, [field]: e.target.value})} className="input-field w-full" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Priority</label>
                  <select value={woForm.priority} onChange={e => setWoForm({...woForm, priority: e.target.value})} className="input-field w-full">
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Status</label>
                  <select value={woForm.status} onChange={e => setWoForm({...woForm, status: e.target.value})} className="input-field w-full">
                    {WO_STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-surface-200">
              <button onClick={() => setWoModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveWO} className="btn-primary">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
