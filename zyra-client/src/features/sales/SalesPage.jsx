export default function SalesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Sales</h1>
      <p className="text-surface-700">Manage orders, invoices, and demand forecasting.</p>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card"><h2 className="text-lg font-semibold mb-4">Orders</h2><div className="h-48 flex items-center justify-center text-surface-700">Order list</div></div>
        <div className="card"><h2 className="text-lg font-semibold mb-4">Invoices</h2><div className="h-48 flex items-center justify-center text-surface-700">Invoice list</div></div>
        <div className="card"><h2 className="text-lg font-semibold mb-4">Forecast</h2><div className="h-48 flex items-center justify-center text-surface-700">Demand forecast chart</div></div>
      </div>
    </div>
  );
}
