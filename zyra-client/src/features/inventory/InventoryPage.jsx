import { useState, useMemo } from "react";
import { Package, Plus, Search, Edit2, Trash2, X, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

const WAREHOUSES = ["Warehouse A", "Warehouse B", "Warehouse C"];

const SEED = [
  { id: 1, sku: "SKU-4821", name: "Steel Rod 12mm",         warehouse: "Warehouse A", qty: 45,   reorder: 100, unit: "units",  category: "Raw Material",    cost: 350  },
  { id: 2, sku: "SKU-1092", name: "Aluminum Sheet 3mm",     warehouse: "Warehouse B", qty: 230,  reorder: 200, unit: "kg",    category: "Raw Material",    cost: 180  },
  { id: 3, sku: "SKU-3345", name: "Hydraulic Seal Kit",     warehouse: "Warehouse A", qty: 12,   reorder: 50,  unit: "sets",  category: "Spare Parts",     cost: 1200 },
  { id: 4, sku: "SKU-7711", name: "Circuit Board PCB-v2",   warehouse: "Warehouse C", qty: 88,   reorder: 75,  unit: "units", category: "Electronics",     cost: 2500 },
  { id: 5, sku: "SKU-5503", name: "Welding Wire Spool",     warehouse: "Warehouse B", qty: 6,    reorder: 20,  unit: "rolls", category: "Consumables",     cost: 600  },
  { id: 6, sku: "SKU-2210", name: "CNC Cutting Tools",      warehouse: "Warehouse A", qty: 55,   reorder: 40,  unit: "sets",  category: "Tooling",         cost: 4500 },
  { id: 7, sku: "SKU-8820", name: "Titanium Dust Shield",   warehouse: "Warehouse C", qty: 142,  reorder: 100, unit: "units", category: "Raw Material",    cost: 890  },
  { id: 8, sku: "SKU-6600", name: "Industrial Lubricant",   warehouse: "Warehouse B", qty: 38,   reorder: 60,  unit: "liters",category: "Consumables",     cost: 250  },
];

function statusInfo(qty, reorder) {
  if (qty === 0)          return { label: "Out of Stock", color: "bg-danger-500/10 text-danger-600",    icon: <AlertTriangle size={12} /> };
  if (qty < reorder)      return { label: "Low Stock",    color: "bg-warning-500/10 text-warning-600",  icon: <Clock size={12} /> };
  return                         { label: "In Stock",     color: "bg-success-500/10 text-success-600",  icon: <CheckCircle2 size={12} /> };
}

const BLANK = { sku: "", name: "", warehouse: "Warehouse A", qty: "", reorder: "", unit: "units", category: "Raw Material", cost: "" };

export default function InventoryPage() {
  const [items, setItems]       = useState(SEED);
  const [search, setSearch]     = useState("");
  const [whFilter, setWhFilter] = useState("");
  const [modal, setModal]       = useState(null);   // null | { mode:'add'|'edit', data:{} }
  const [form, setForm]         = useState(BLANK);

  const filtered = useMemo(() =>
    items.filter(i =>
      (i.sku.toLowerCase().includes(search.toLowerCase()) || i.name.toLowerCase().includes(search.toLowerCase())) &&
      (whFilter ? i.warehouse === whFilter : true)
    ), [items, search, whFilter]);

  const openAdd  = ()      => { setForm({ ...BLANK, id: Date.now() }); setModal({ mode: "add" }); };
  const openEdit = (item)  => { setForm({ ...item });                   setModal({ mode: "edit" }); };
  const closeModal = ()    => setModal(null);

  const save = () => {
    const entry = { ...form, qty: Number(form.qty), reorder: Number(form.reorder), cost: Number(form.cost) };
    if (modal.mode === "add") {
      setItems(prev => [...prev, { ...entry, id: Date.now() }]);
    } else {
      setItems(prev => prev.map(i => i.id === form.id ? entry : i));
    }
    closeModal();
  };

  const remove = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const totalValue = items.reduce((s, i) => s + (i.qty * i.cost), 0);
  const lowCount   = items.filter(i => i.qty < i.reorder).length;
  const outCount   = items.filter(i => i.qty === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2"><Package size={24} className="text-primary-600" /> Inventory Management</h1>
          <p className="text-surface-600 mt-1">Track stock levels, set reorder points, and manage warehouses.</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus size={18} /> Add Item</button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center"><div className="text-2xl font-bold text-primary-700">₹{(totalValue/100000).toFixed(1)}L</div><div className="text-xs text-surface-500 mt-1">Total Inventory Value</div></div>
        <div className="card text-center"><div className="text-2xl font-bold text-warning-600">{lowCount}</div><div className="text-xs text-surface-500 mt-1">Low Stock Alerts</div></div>
        <div className="card text-center"><div className="text-2xl font-bold text-danger-600">{outCount}</div><div className="text-xs text-surface-500 mt-1">Out-of-Stock Items</div></div>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search by SKU or product name…" className="input-field pl-9 w-full" />
        </div>
        <select value={whFilter} onChange={e => setWhFilter(e.target.value)} className="input-field w-48">
          <option value="">All Warehouses</option>
          {WAREHOUSES.map(w => <option key={w}>{w}</option>)}
        </select>
        {(search || whFilter) && <button onClick={() => { setSearch(""); setWhFilter(""); }} className="text-xs text-primary-600 hover:underline">Clear filters</button>}
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-50 border-b border-surface-200">
            <tr>
              {["SKU","Product","Category","Warehouse","Qty","Unit Cost","Reorder","Status","Actions"].map(h => (
                <th key={h} className="text-left py-3 px-4 font-semibold text-surface-700 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const st = statusInfo(item.qty, item.reorder);
              return (
                <tr key={item.id} className="border-b border-surface-100 hover:bg-surface-50 transition">
                  <td className="py-3 px-4 font-mono text-xs">{item.sku}</td>
                  <td className="py-3 px-4 font-medium">{item.name}</td>
                  <td className="py-3 px-4 text-surface-500 text-xs">{item.category}</td>
                  <td className="py-3 px-4 text-surface-600">{item.warehouse}</td>
                  <td className="py-3 px-4 font-bold text-surface-900">{item.qty}</td>
                  <td className="py-3 px-4">₹{item.cost.toLocaleString()}</td>
                  <td className="py-3 px-4 text-surface-500">{item.reorder}</td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.icon}{st.label}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-surface-500 hover:text-primary-600 hover:bg-primary-50 rounded transition"><Edit2 size={14} /></button>
                      <button onClick={() => remove(item.id)} className="p-1.5 text-surface-500 hover:text-danger-600 hover:bg-danger-50 rounded transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="py-16 text-center text-surface-500">No inventory items match your filters.</div>}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-5 border-b border-surface-200">
              <h3 className="font-bold text-surface-900">{modal.mode === "add" ? "Add Inventory Item" : "Edit Item"}</h3>
              <button onClick={closeModal} className="p-1 text-surface-500 hover:text-surface-700 bg-surface-100 rounded-full"><X size={16} /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[["SKU","sku","text"],["Product Name","name","text"],["Category","category","text"],["Warehouse","warehouse","warehouse"],["Quantity","qty","number"],["Reorder Point","reorder","number"],["Unit","unit","text"],["Unit Cost (₹)","cost","number"]].map(([label, field, type]) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">{label}</label>
                  {type === "warehouse" ? (
                    <select value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} className="input-field w-full">
                      {WAREHOUSES.map(w => <option key={w}>{w}</option>)}
                    </select>
                  ) : (
                    <input type={type} value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} className="input-field w-full" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-surface-200">
              <button onClick={closeModal} className="btn-secondary">Cancel</button>
              <button onClick={save} className="btn-primary">Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
