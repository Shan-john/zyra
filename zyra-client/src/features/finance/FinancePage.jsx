import { useState } from "react";
import { DollarSign, Plus, X, Edit2, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const TRANSACTIONS = [
  { id: 1, txId: "TX-8801", date: "2026-02-27", description: "Revenue - Bharat Forge SO-3003",   type: "Income",  category: "Sales Revenue",    amount: 2100000 },
  { id: 2, txId: "TX-8802", date: "2026-02-26", description: "Raw Material Purchase (Steel Rods)", type: "Expense", category: "Procurement",       amount: 175000  },
  { id: 3, txId: "TX-8803", date: "2026-02-25", description: "Payroll - February 2026",            type: "Expense", category: "Payroll",           amount: 472000  },
  { id: 4, txId: "TX-8804", date: "2026-02-24", description: "Maintenance - CNC Machine #2",       type: "Expense", category: "Maintenance",       amount: 22000   },
  { id: 5, txId: "TX-8805", date: "2026-02-22", description: "Revenue - L&T SO-3002",              type: "Income",  category: "Sales Revenue",    amount: 280000  },
  { id: 6, txId: "TX-8806", date: "2026-02-20", description: "Utility Bill - March",               type: "Expense", category: "Operations",        amount: 68000   },
  { id: 7, txId: "TX-8807", date: "2026-02-18", description: "Insurance Premium Q1",               type: "Expense", category: "Insurance",         amount: 95000   },
  { id: 8, txId: "TX-8808", date: "2026-02-15", description: "Revenue - Mahindra SO-3005",         type: "Income",  category: "Sales Revenue",    amount: 500000  },
];

const CASHFLOW = [
  { month: "Sep", income: 28, expense: 19 }, { month: "Oct", income: 32, expense: 22 },
  { month: "Nov", income: 25, expense: 18 }, { month: "Dec", income: 41, expense: 28 },
  { month: "Jan", income: 35, expense: 24 }, { month: "Feb", income: 29, expense: 21 },
];

const TYPES = ["Income","Expense"];
const CATS_INC = ["Sales Revenue","Investment","Grant","Other"];
const CATS_EXP = ["Procurement","Payroll","Maintenance","Operations","Insurance","Other"];
const BLANK = { txId: "", date: "", description: "", type: "Income", category: "Sales Revenue", amount: "" };

export default function FinancePage() {
  const [txns, setTxns]   = useState(TRANSACTIONS);
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState(BLANK);
  const [filter, setFilter] = useState("");

  const save = () => {
    const e = { ...form, amount: Number(form.amount) };
    if (modal === "add") setTxns(p => [...p, { ...e, id: Date.now() }]);
    else setTxns(p => p.map(t => t.id === form.id ? e : t));
    setModal(null);
  };

  const income  = txns.filter(t=>t.type==="Income").reduce((s,t)=>s+t.amount,0);
  const expense = txns.filter(t=>t.type==="Expense").reduce((s,t)=>s+t.amount,0);
  const profit  = income - expense;
  const filtered = filter ? txns.filter(t=>t.type===filter) : txns;

  const CATS = form.type === "Income" ? CATS_INC : CATS_EXP;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2"><DollarSign size={24} className="text-primary-600" /> Finance & Accounting</h1>
          <p className="text-surface-600 mt-1">General ledger, P&L reports, and cash flow analysis.</p>
        </div>
        <button onClick={()=>{setForm(BLANK);setModal("add");}} className="btn-primary flex items-center gap-2"><Plus size={18} />Add Transaction</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center border-l-4 border-success-500">
          <div className="text-2xl font-bold text-success-600">₹{(income/100000).toFixed(1)}L</div>
          <div className="text-xs text-surface-500 mt-1 flex items-center justify-center gap-1"><TrendingUp size={12} className="text-success-500" />Total Revenue</div>
        </div>
        <div className="card text-center border-l-4 border-danger-500">
          <div className="text-2xl font-bold text-danger-600">₹{(expense/100000).toFixed(1)}L</div>
          <div className="text-xs text-surface-500 mt-1 flex items-center justify-center gap-1"><TrendingDown size={12} className="text-danger-500" />Total Expenses</div>
        </div>
        <div className="card text-center border-l-4 border-primary-500">
          <div className={`text-2xl font-bold ${profit>=0?"text-primary-700":"text-danger-600"}`}>₹{(profit/100000).toFixed(1)}L</div>
          <div className="text-xs text-surface-500 mt-1">Net Profit / Loss</div>
        </div>
      </div>

      {/* Cash Flow Chart */}
      <div className="card">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Cash Flow Overview (₹ Lakhs)</h2>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CASHFLOW} margin={{top:5,right:10,left:-20,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{fontSize:11}} tickLine={false} axisLine={false} />
              <YAxis tick={{fontSize:11}} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{borderRadius:"8px",border:"none",boxShadow:"0 4px 6px -1px rgb(0 0 0 / 0.1)"}} />
              <Legend iconType="circle" wrapperStyle={{fontSize:"12px"}} />
              <Line type="monotone" dataKey="income"  name="Income (L)"  stroke="#10B981" strokeWidth={3} dot={{r:4}} />
              <Line type="monotone" dataKey="expense" name="Expense (L)" stroke="#EF4444" strokeWidth={2} dot={{r:3}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ledger */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-surface-900">General Ledger</h2>
          <div className="flex gap-2">
            {["","Income","Expense"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${filter===f?"bg-primary-600 text-white":"bg-surface-100 text-surface-600 hover:bg-surface-200"}`}>{f||"All"}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>{["TX ID","Date","Description","Category","Type","Amount","Actions"].map(h=><th key={h} className="text-left py-3 px-4 font-semibold text-surface-700">{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id} className="border-b border-surface-100 hover:bg-surface-50 transition">
                  <td className="py-3 px-4 font-mono text-xs">{t.txId}</td>
                  <td className="py-3 px-4 text-surface-500">{t.date}</td>
                  <td className="py-3 px-4 font-medium max-w-xs truncate">{t.description}</td>
                  <td className="py-3 px-4 text-surface-500 text-xs">{t.category}</td>
                  <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.type==="Income"?"bg-success-100 text-success-700":"bg-danger-100 text-danger-700"}`}>{t.type}</span></td>
                  <td className={`py-3 px-4 font-bold ${t.type==="Income"?"text-success-600":"text-danger-600"}`}>{t.type==="Income"?"+":"-"}₹{t.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={()=>{setForm({...t});setModal("edit");}} className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"><Edit2 size={13} /></button>
                      <button onClick={()=>setTxns(p=>p.filter(x=>x.id!==t.id))} className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded transition"><Trash2 size={13} /></button>
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
            <div className="flex justify-between items-center p-5 border-b"><h3 className="font-bold">{modal==="add"?"Add Transaction":"Edit Transaction"}</h3><button onClick={()=>setModal(null)} className="p-1 bg-surface-100 rounded-full"><X size={16} /></button></div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[["TX ID","txId","text"],["Date","date","date"],["Amount (₹)","amount","number"]].map(([l,f,t])=>(
                <div key={f}><label className="block text-xs font-semibold text-surface-700 mb-1">{l}</label><input type={t} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})} className="input-field w-full" /></div>
              ))}
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Type</label><select value={form.type} onChange={e=>setForm({...form,type:e.target.value,category:""})} className="input-field w-full">{TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Category</label><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="input-field w-full">{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="col-span-2"><label className="block text-xs font-semibold text-surface-700 mb-1">Description</label><input type="text" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="input-field w-full" /></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={()=>setModal(null)} className="btn-secondary">Cancel</button><button onClick={save} className="btn-primary">Save</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
