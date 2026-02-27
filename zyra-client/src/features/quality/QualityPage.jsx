import { useState } from "react";
import { ShieldCheck, Plus, X, Edit2, Trash2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const INSPECTIONS_SEED = [
  { id: 1, insId: "QI-5001", date: "2026-02-27", product: "Steel Frame Set",     machine: "Assembly Line A",   batch: "B-2026-101", result: "Pass",    defects: 0,   inspector: "Priya Nair"    },
  { id: 2, insId: "QI-5002", date: "2026-02-26", product: "CNC Gear Assembly",   machine: "CNC Machine #1",    batch: "B-2026-102", result: "Pass",    defects: 1,   inspector: "Priya Nair"    },
  { id: 3, insId: "QI-5003", date: "2026-02-25", product: "Hydraulic Cylinders", machine: "Hydraulic Press #1",batch: "B-2026-103", result: "Fail",    defects: 7,   inspector: "Suresh Rao"    },
  { id: 4, insId: "QI-5004", date: "2026-02-24", product: "PCB Circuit Board",   machine: "Assembly Line B",   batch: "B-2026-104", result: "Rework",  defects: 3,   inspector: "Vijay Singh"   },
  { id: 5, insId: "QI-5005", date: "2026-02-23", product: "Titanium Rod Set",    machine: "CNC Machine #2",    batch: "B-2026-105", result: "Pass",    defects: 0,   inspector: "Priya Nair"    },
  { id: 6, insId: "QI-5006", date: "2026-02-22", product: "Welding Panel",       machine: "Welding Bay Alpha", batch: "B-2026-106", result: "Fail",    defects: 12,  inspector: "Suresh Rao"    },
];

const DEFECT_DATA = [
  { machine: "Hyd. Press",    defects: 7,  fill: "#EF4444" },
  { machine: "Welding Bay",   defects: 12, fill: "#EF4444" },
  { machine: "Assembly B",    defects: 3,  fill: "#F59E0B" },
  { machine: "CNC #2",        defects: 2,  fill: "#F59E0B" },
  { machine: "CNC #1",        defects: 1,  fill: "#10B981" },
  { machine: "Assembly A",    defects: 0,  fill: "#10B981" },
];

const resultBadge = r => ({
  "Pass":   "bg-success-100 text-success-700",
  "Fail":   "bg-danger-100 text-danger-700",
  "Rework": "bg-warning-100 text-warning-700",
}[r] || "bg-surface-100 text-surface-600");

const resultIcon = r => ({
  "Pass":   <CheckCircle2 size={13} className="text-success-500" />,
  "Fail":   <XCircle size={13} className="text-danger-500" />,
  "Rework": <AlertTriangle size={13} className="text-warning-500" />,
}[r]);

const BLANK = { insId: "", date: "", product: "", machine: "", batch: "", result: "Pass", defects: 0, inspector: "" };
const RESULTS = ["Pass","Fail","Rework"];

export default function QualityPage() {
  const [inspections, setInspections] = useState(INSPECTIONS_SEED);
  const [modal, setModal]             = useState(null);
  const [form, setForm]               = useState(BLANK);
  const [resultFilter, setResultFilter] = useState("");

  const save = () => {
    const e = { ...form, defects: Number(form.defects) };
    if (modal === "add") setInspections(p => [...p, { ...e, id: Date.now() }]);
    else setInspections(p => p.map(i => i.id === form.id ? e : i));
    setModal(null);
  };

  const filtered    = resultFilter ? inspections.filter(i => i.result === resultFilter) : inspections;
  const passRate    = Math.round(inspections.filter(i=>i.result==="Pass").length / inspections.length * 100);
  const totalDefects= inspections.reduce((s,i) => s + i.defects, 0);
  const failCount   = inspections.filter(i=>i.result==="Fail").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2"><ShieldCheck size={24} className="text-primary-600" /> Quality Control</h1>
          <p className="text-surface-600 mt-1">Inspections, defect tracking, and quality analytics.</p>
        </div>
        <button onClick={()=>{setForm(BLANK);setModal("add");}} className="btn-primary flex items-center gap-2"><Plus size={18} />Log Inspection</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center border-l-4 border-success-500">
          <div className="text-2xl font-bold text-success-600">{passRate}%</div>
          <div className="text-xs text-surface-500 mt-1">Pass Rate</div>
        </div>
        <div className="card text-center border-l-4 border-danger-500">
          <div className="text-2xl font-bold text-danger-600">{totalDefects}</div>
          <div className="text-xs text-surface-500 mt-1">Total Defects Found</div>
        </div>
        <div className="card text-center border-l-4 border-warning-500">
          <div className="text-2xl font-bold text-warning-600">{failCount}</div>
          <div className="text-xs text-surface-500 mt-1">Failed Inspections</div>
        </div>
      </div>

      {/* Defect Heatmap Bar Chart */}
      <div className="card">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Defect Distribution by Machine</h2>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEFECT_DATA} layout="vertical" margin={{top:5,right:30,left:60,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
              <XAxis type="number" tick={{fontSize:11}} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="machine" tick={{fontSize:11}} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{borderRadius:"8px",border:"none",boxShadow:"0 4px 6px -1px rgb(0 0 0 / 0.1)"}} />
              <Bar dataKey="defects" name="Defects" radius={[0,4,4,0]}>
                {DEFECT_DATA.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Inspection Log */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-surface-900">Inspection Log</h2>
          <div className="flex gap-2">
            {["","Pass","Fail","Rework"].map(f=>(
              <button key={f} onClick={()=>setResultFilter(f)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${resultFilter===f?"bg-primary-600 text-white":"bg-surface-100 text-surface-600 hover:bg-surface-200"}`}>{f||"All"}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>{["Insp. ID","Date","Product","Machine","Batch","Inspector","Defects","Result","Actions"].map(h=><th key={h} className="text-left py-3 px-3 font-semibold text-surface-700 whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(i => (
                <tr key={i.id} className="border-b border-surface-100 hover:bg-surface-50 transition">
                  <td className="py-3 px-3 font-mono text-xs">{i.insId}</td>
                  <td className="py-3 px-3 text-surface-500">{i.date}</td>
                  <td className="py-3 px-3 font-medium">{i.product}</td>
                  <td className="py-3 px-3 text-surface-600">{i.machine}</td>
                  <td className="py-3 px-3 text-xs text-surface-500">{i.batch}</td>
                  <td className="py-3 px-3">{i.inspector}</td>
                  <td className="py-3 px-3">
                    <span className={`font-bold ${i.defects===0?"text-success-600":i.defects>5?"text-danger-600":"text-warning-600"}`}>{i.defects}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium w-fit ${resultBadge(i.result)}`}>{resultIcon(i.result)}{i.result}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <button onClick={()=>{setForm({...i});setModal("edit");}} className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"><Edit2 size={13} /></button>
                      <button onClick={()=>setInspections(p=>p.filter(x=>x.id!==i.id))} className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded transition"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-5 border-b"><h3 className="font-bold">{modal==="add"?"Log Inspection":"Edit Inspection"}</h3><button onClick={()=>setModal(null)} className="p-1 bg-surface-100 rounded-full"><X size={16} /></button></div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[["Inspection ID","insId","text"],["Date","date","date"],["Product","product","text"],["Machine","machine","text"],["Batch No.","batch","text"],["Inspector","inspector","text"],["Defects Found","defects","number"]].map(([l,f,t])=>(
                <div key={f}><label className="block text-xs font-semibold text-surface-700 mb-1">{l}</label><input type={t} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})} className="input-field w-full" /></div>
              ))}
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Result</label><select value={form.result} onChange={e=>setForm({...form,result:e.target.value})} className="input-field w-full">{RESULTS.map(r=><option key={r}>{r}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={()=>setModal(null)} className="btn-secondary">Cancel</button><button onClick={save} className="btn-primary">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
