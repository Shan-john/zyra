import { useState, useEffect } from "react";
import { ShoppingCart, Plus, X, Edit2, Trash2, TrendingUp } from "lucide-react";
import * as api from "../../api/salesApi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ORDERS_SEED removed in favor of standard API usage

const FORECAST_DATA = [
  { month: "Sep", actual: 42, forecast: 45 }, { month: "Oct", actual: 55, forecast: 52 },
  { month: "Nov", actual: 48, forecast: 50 }, { month: "Dec", actual: 61, forecast: 58 },
  { month: "Jan", actual: 53, forecast: 56 }, { month: "Feb", actual: 67, forecast: 65 },
  { month: "Mar", actual: null, forecast: 72 }, { month: "Apr", actual: null, forecast: 78 },
];

const orderBadge = s => ({
  "Processing": "bg-primary-100 text-primary-700",
  "Shipped":    "bg-warning-100 text-warning-700",
  "Delivered":  "bg-success-100 text-success-700",
  "Cancelled":  "bg-danger-100 text-danger-700",
}[s] || "bg-surface-100 text-surface-600");

const BLANK = { orderId: "", customer: "", product: "", qty: "", unit: "units", value: "", date: "", status: "Processing" };
const STATUSES = ["Processing","Shipped","Delivered","Cancelled"];

export default function SalesPage() {
  const [orders, setOrders] = useState([]);
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState(BLANK);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders({ limit: 100 });
      setOrders(res.data.data.orders || res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const save = async () => {
    try {
      if (modal === "add") {
        await api.createOrder({
          orderNumber: form.orderId || `SO-${Date.now().toString().slice(-4)}`,
          customer: { name: form.customer, email: "unknown@example.com", phone: "555-0000" },
          items: [{ description: form.product, quantity: Number(form.qty), unitPrice: Number(form.value) / Number(form.qty || 1), discount: 0 }],
          status: form.status,
          orderDate: form.date || new Date().toISOString().split("T")[0],
        });
      }
      setModal(null);
      loadData();
    } catch (err) {
      console.error("Failed to save order", err);
      alert("Failed to save.");
    }
  };

  const totalRev    = orders.reduce((s, o) => s + (o.totalAmount || o.value || 0), 0);
  const activeOrds  = orders.filter(o => o.status === "Processing" || o.status === "Shipped" || o.status === "processing" || o.status === "shipped").length;
  const deliveredRev = orders.filter(o => o.status === "Delivered" || o.status === "delivered").reduce((s, o) => s + (o.totalAmount || o.value || 0), 0);

  if (loading && orders.length === 0) {
    return <div className="p-8 text-center text-surface-500">Loading Sales data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2"><ShoppingCart size={24} className="text-primary-600" /> Sales Management</h1>
          <p className="text-surface-600 mt-1">Manage orders, invoices, and demand forecasting.</p>
        </div>
        <button onClick={() => { setForm(BLANK); setModal("add"); }} className="btn-primary flex items-center gap-2"><Plus size={18} /> New Order</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center"><div className="text-2xl font-bold text-primary-700">₹{(totalRev/100000).toFixed(1)}L</div><div className="text-xs text-surface-500 mt-1">Total Order Value</div></div>
        <div className="card text-center"><div className="text-2xl font-bold text-warning-600">{activeOrds}</div><div className="text-xs text-surface-500 mt-1">Active Orders</div></div>
        <div className="card text-center"><div className="text-2xl font-bold text-success-600">₹{(deliveredRev/100000).toFixed(1)}L</div><div className="text-xs text-surface-500 mt-1">Revenue Delivered</div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders table */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Sales Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50 border-b border-surface-200">
                <tr>{["Order #","Customer","Product","Qty","Value","Date","Status","Actions"].map(h=><th key={h} className="text-left py-3 px-4 font-semibold text-surface-700">{h}</th>)}</tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-b border-surface-100 hover:bg-surface-50 transition">
                    <td className="py-3 px-4 font-mono text-xs">{o.orderNumber || o.orderId}</td>
                    <td className="py-3 px-4 font-medium">{o.customer?.name || o.customer}</td>
                    <td className="py-3 px-4 text-surface-600">{o.items?.[0]?.description || o.product}</td>
                    <td className="py-3 px-4">{o.items?.[0]?.quantity || o.qty} units</td>
                    <td className="py-3 px-4 font-semibold text-success-600">₹{(o.totalAmount || o.value || 0).toLocaleString()}</td>
                    <td className="py-3 px-4 text-surface-500">{o.orderDate || o.date}</td>
                    <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full font-medium ${orderBadge(o.status)}`}>{o.status}</span></td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => { 
                          setForm({
                            orderId: o.orderNumber || o.orderId,
                            customer: o.customer?.name || o.customer,
                            product: o.items?.[0]?.description || o.product,
                            qty: o.items?.[0]?.quantity || o.qty,
                            value: o.totalAmount || o.value,
                            date: o.orderDate || o.date,
                            status: o.status
                          }); 
                          setModal("edit"); 
                        }} className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"><Edit2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Demand Forecast Chart */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2 mb-4"><TrendingUp size={20} className="text-primary-500" /> Demand Forecast (Units/Month)</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FORECAST_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Bar dataKey="actual"   name="Actual Sales" fill="#10B981" radius={[4,4,0,0]} />
                <Bar dataKey="forecast" name="Forecast"     fill="#6366F1" opacity={0.6} radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-5 border-b"><h3 className="font-bold">{modal === "add" ? "New Sales Order" : "Edit Order"}</h3><button onClick={() => setModal(null)} className="p-1 bg-surface-100 rounded-full"><X size={16} /></button></div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[["Order No.","orderId","text"],["Customer","customer","text"],["Product","product","text"],["Quantity","qty","number"],["Unit","unit","text"],["Value (₹)","value","number"],["Date","date","date"]].map(([l,f,t])=>(
                <div key={f}><label className="block text-xs font-semibold text-surface-700 mb-1">{l}</label><input type={t} value={form[f]} onChange={e=>setForm({...form,[f]:e.target.value})} className="input-field w-full" /></div>
              ))}
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Status</label><select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className="input-field w-full">{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t"><button onClick={() => setModal(null)} className="btn-secondary">Cancel</button><button onClick={save} className="btn-primary">Save Order</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
