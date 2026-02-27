import { useState } from "react";
import { Truck, Plus, X, Edit2, Trash2 } from "lucide-react";

const SUPPLIERS_SEED = [
  { id: 1, name: "Tata Steel Limited",     contact: "Rajesh Kumar",   category: "Raw Material", rating: 5, lead: "7 days",  status: "Active"   },
  { id: 2, name: "Mahindra Components",    contact: "Priya Mehta",    category: "Spare Parts",  rating: 4, lead: "14 days", status: "Active"   },
  { id: 3, name: "Indo Alloys Corp",       contact: "Suresh Bhat",    category: "Raw Material", rating: 3, lead: "10 days", status: "Active"   },
  { id: 4, name: "Bharat Electronics Ltd",contact: "Anita Reddy",    category: "Electronics",  rating: 5, lead: "21 days", status: "Active"   },
  { id: 5, name: "Global Tooling Co.",     contact: "Mohan Singh",    category: "Tooling",      rating: 2, lead: "30 days", status: "Inactive" },
];

const PO_SEED = [
  { id: 1, poNum: "PO-2025-001", supplier: "Tata Steel Limited",  item: "Steel Rod 12mm",     qty: 500, unit: "units", value: 175000, date: "2026-02-25", status: "Open"     },
  { id: 2, poNum: "PO-2025-002", supplier: "Mahindra Components", item: "Hydraulic Seal Kit", qty: 100, unit: "sets",  value: 120000, date: "2026-02-20", status: "Received" },
  { id: 3, poNum: "PO-2025-003", supplier: "Indo Alloys Corp",    item: "Aluminum Sheet 3mm", qty: 200, unit: "kg",    value: 36000,  date: "2026-02-18", status: "Transit"  },
  { id: 4, poNum: "PO-2025-004", supplier: "Bharat Electronics",  item: "PCB Circuit Board",  qty: 50,  unit: "units", value: 125000, date: "2026-02-27", status: "Open"     },
];

const poBadge = (status) => ({
  "Open":     "bg-primary-100 text-primary-700",
  "Received": "bg-success-100 text-success-700",
  "Transit":  "bg-warning-100 text-warning-700",
  "Cancelled":"bg-danger-100 text-danger-700",
}[status] || "bg-surface-100 text-surface-600");

const Stars = ({ n }) => Array.from({ length: 5 }).map((_, i) => (
  <span key={i} className={i < n ? "text-amber-400" : "text-surface-200"}>★</span>
));

const BLANK_S = { name: "", contact: "", category: "Raw Material", rating: 3, lead: "", status: "Active" };
const BLANK_P = { poNum: "", supplier: "", item: "", qty: "", unit: "units", value: "", date: "", status: "Open" };
const CATS = ["Raw Material","Spare Parts","Electronics","Tooling","Consumables"];
const PO_STATUSES = ["Open","Transit","Received","Cancelled"];

export default function SupplyChainPage() {
  const [suppliers, setSuppliers] = useState(SUPPLIERS_SEED);
  const [pos, setPos]             = useState(PO_SEED);
  const [sModal, setSModal]       = useState(null);
  const [poModal, setPoModal]     = useState(null);
  const [sForm, setSForm]         = useState(BLANK_S);
  const [poForm, setPoForm]       = useState(BLANK_P);

  const saveSupplier = () => {
    const entry = { ...sForm, rating: Number(sForm.rating) };
    if (sModal === "add") setSuppliers(p => [...p, { ...entry, id: Date.now() }]);
    else setSuppliers(p => p.map(s => s.id === sForm.id ? entry : s));
    setSModal(null);
  };

  const savePO = () => {
    if (poModal === "add") setPos(p => [...p, { ...poForm, qty: Number(poForm.qty), value: Number(poForm.value), id: Date.now() }]);
    else setPos(p => p.map(o => o.id === poForm.id ? { ...poForm, qty: Number(poForm.qty), value: Number(poForm.value) } : o));
    setPoModal(null);
  };

  const totalOpen = pos.filter(p => p.status === "Open").reduce((s, p) => s + p.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2"><Truck size={24} className="text-primary-600" /> Supply Chain Management</h1>
          <p className="text-surface-600 mt-1">Manage suppliers, purchase orders, and procurement.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center"><div className="text-2xl font-bold text-primary-700">{suppliers.filter(s=>s.status==="Active").length}</div><div className="text-xs text-surface-500 mt-1">Active Suppliers</div></div>
        <div className="card text-center"><div className="text-2xl font-bold text-warning-600">{pos.filter(p=>p.status==="Open").length}</div><div className="text-xs text-surface-500 mt-1">Open POs</div></div>
        <div className="card text-center"><div className="text-2xl font-bold text-success-600">₹{(totalOpen/1000).toFixed(0)}k</div><div className="text-xs text-surface-500 mt-1">Open PO Value</div></div>
      </div>

      {/* Suppliers */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-surface-900">Supplier Directory</h2>
          <button onClick={() => { setSForm(BLANK_S); setSModal("add"); }} className="btn-primary text-sm flex items-center gap-2"><Plus size={16} />Add Supplier</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-50 border-b border-surface-200">
            <tr>{["Supplier","Contact","Category","Rating","Lead Time","Status","Actions"].map(h => (<th key={h} className="text-left py-3 px-4 font-semibold text-surface-700">{h}</th>))}</tr>
          </thead>
          <tbody>
            {suppliers.map(s => (
              <tr key={s.id} className="border-b border-surface-100 hover:bg-surface-50 transition">
                <td className="py-3 px-4 font-medium">{s.name}</td>
                <td className="py-3 px-4 text-surface-600">{s.contact}</td>
                <td className="py-3 px-4 text-surface-500 text-xs">{s.category}</td>
                <td className="py-3 px-4 text-sm"><Stars n={s.rating} /></td>
                <td className="py-3 px-4 text-surface-600">{s.lead}</td>
                <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${s.status === "Active" ? "bg-success-100 text-success-700" : "bg-surface-100 text-surface-600"}`}>{s.status}</span></td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => { setSForm({...s}); setSModal("edit"); }} className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"><Edit2 size={13} /></button>
                    <button onClick={() => setSuppliers(p => p.filter(x => x.id !== s.id))} className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded transition"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Purchase Orders */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-surface-900">Purchase Orders</h2>
          <button onClick={() => { setPoForm(BLANK_P); setPoModal("add"); }} className="btn-secondary text-sm flex items-center gap-2"><Plus size={16} />New PO</button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-50 border-b border-surface-200">
            <tr>{["PO #","Supplier","Item","Qty","Value","Date","Status","Actions"].map(h => (<th key={h} className="text-left py-3 px-4 font-semibold text-surface-700">{h}</th>))}</tr>
          </thead>
          <tbody>
            {pos.map(o => (
              <tr key={o.id} className="border-b border-surface-100 hover:bg-surface-50 transition">
                <td className="py-3 px-4 font-mono text-xs">{o.poNum}</td>
                <td className="py-3 px-4 font-medium">{o.supplier}</td>
                <td className="py-3 px-4 text-surface-600">{o.item}</td>
                <td className="py-3 px-4">{o.qty} {o.unit}</td>
                <td className="py-3 px-4 font-semibold text-success-600">₹{o.value.toLocaleString()}</td>
                <td className="py-3 px-4 text-surface-500">{o.date}</td>
                <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${poBadge(o.status)}`}>{o.status}</span></td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    <button onClick={() => { setPoForm({...o}); setPoModal("edit"); }} className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"><Edit2 size={13} /></button>
                    <button onClick={() => setPos(p => p.filter(x => x.id !== o.id))} className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded transition"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Supplier Modal */}
      {sModal && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b"><h3 className="font-bold">{sModal === "add" ? "Add Supplier" : "Edit Supplier"}</h3><button onClick={() => setSModal(null)} className="p-1 bg-surface-100 rounded-full"><X size={16} /></button></div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[["Supplier Name","name","text"],["Contact","contact","text"],["Lead Time","lead","text"]].map(([l,f,t]) => (
                <div key={f}><label className="block text-xs font-semibold text-surface-700 mb-1">{l}</label><input type={t} value={sForm[f]} onChange={e => setSForm({...sForm,[f]:e.target.value})} className="input-field w-full" /></div>
              ))}
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Rating (1-5)</label><input type="number" min="1" max="5" value={sForm.rating} onChange={e => setSForm({...sForm,rating:e.target.value})} className="input-field w-full" /></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Category</label><select value={sForm.category} onChange={e => setSForm({...sForm,category:e.target.value})} className="input-field w-full">{CATS.map(c=><option key={c}>{c}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Status</label><select value={sForm.status} onChange={e => setSForm({...sForm,status:e.target.value})} className="input-field w-full"><option>Active</option><option>Inactive</option></select></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setSModal(null)} className="btn-secondary">Cancel</button><button onClick={saveSupplier} className="btn-primary">Save</button></div>
          </div>
        </div>
      )}

      {/* PO Modal */}
      {poModal && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b"><h3 className="font-bold">{poModal === "add" ? "Create Purchase Order" : "Edit PO"}</h3><button onClick={() => setPoModal(null)} className="p-1 bg-surface-100 rounded-full"><X size={16} /></button></div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[["PO Number","poNum","text"],["Supplier","supplier","text"],["Item","item","text"],["Quantity","qty","number"],["Value (₹)","value","number"],["Date","date","date"]].map(([l,f,t]) => (
                <div key={f}><label className="block text-xs font-semibold text-surface-700 mb-1">{l}</label><input type={t} value={poForm[f]} onChange={e => setPoForm({...poForm,[f]:e.target.value})} className="input-field w-full" /></div>
              ))}
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Status</label><select value={poForm.status} onChange={e => setPoForm({...poForm,status:e.target.value})} className="input-field w-full">{PO_STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setPoModal(null)} className="btn-secondary">Cancel</button><button onClick={savePO} className="btn-primary">Save PO</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
