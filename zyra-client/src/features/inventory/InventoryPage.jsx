import { Package, Plus, AlertTriangle } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Inventory Management</h1>
          <p className="text-surface-700 mt-1">Track stock levels, set reorder points, and manage warehouses.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-4">
        <input type="text" placeholder="Search by SKU..." className="input-field w-64" />
        <select className="input-field w-48">
          <option value="">All Warehouses</option>
          <option>Warehouse A</option>
          <option>Warehouse B</option>
        </select>
      </div>

      {/* Data table placeholder */}
      <div className="card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-200">
              <th className="text-left py-3 px-4 font-semibold text-surface-700">SKU</th>
              <th className="text-left py-3 px-4 font-semibold text-surface-700">Product</th>
              <th className="text-left py-3 px-4 font-semibold text-surface-700">Warehouse</th>
              <th className="text-right py-3 px-4 font-semibold text-surface-700">Quantity</th>
              <th className="text-right py-3 px-4 font-semibold text-surface-700">Reorder Point</th>
              <th className="text-center py-3 px-4 font-semibold text-surface-700">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-surface-100 hover:bg-surface-50 transition">
              <td className="py-3 px-4 font-mono">SKU-4821</td>
              <td className="py-3 px-4">Steel Rod 12mm</td>
              <td className="py-3 px-4">Warehouse A</td>
              <td className="py-3 px-4 text-right">45</td>
              <td className="py-3 px-4 text-right">100</td>
              <td className="py-3 px-4 text-center">
                <span className="px-2 py-1 bg-danger-500/10 text-danger-500 rounded-full text-xs font-medium">Low Stock</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
