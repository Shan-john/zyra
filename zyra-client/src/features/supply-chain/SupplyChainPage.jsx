export default function SupplyChainPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-surface-900">Supply Chain</h1>
      <p className="text-surface-700">Manage suppliers, purchase orders, and procurement.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card"><h2 className="text-lg font-semibold mb-4">Suppliers</h2><div className="h-48 flex items-center justify-center text-surface-700">Supplier directory will render here</div></div>
        <div className="card"><h2 className="text-lg font-semibold mb-4">Purchase Orders</h2><div className="h-48 flex items-center justify-center text-surface-700">PO list will render here</div></div>
      </div>
    </div>
  );
}
