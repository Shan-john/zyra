import { Package, Factory, Truck, ShoppingCart, DollarSign, Shield, TrendingUp } from "lucide-react";
import KpiCard from "../../components/charts/KpiCard";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-surface-900">Dashboard</h1>
        <p className="text-surface-700 mt-1">Welcome to Zyra ERP — your AI-powered command center.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Inventory" value="12,847" change="+3.2% vs last month" changeType="up" icon={Package} color="blue" />
        <KpiCard title="Production Output" value="8,450 units" change="+7.1% vs last month" changeType="up" icon={Factory} color="green" />
        <KpiCard title="Active Orders" value="234" change="-2.4% vs last month" changeType="down" icon={ShoppingCart} color="amber" />
        <KpiCard title="Revenue (MTD)" value="₹24.5L" change="+12.8% vs last month" changeType="up" icon={DollarSign} color="purple" />
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Sales Trend</h2>
          <div className="h-64 flex items-center justify-center text-surface-700">
            <p>Recharts area chart will render here</p>
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-surface-900 mb-4">Production Efficiency</h2>
          <div className="h-64 flex items-center justify-center text-surface-700">
            <p>Recharts bar chart will render here</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-surface-900 mb-4">Recent Alerts</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-warning-500/10 rounded-lg">
            <Shield className="text-warning-500" size={20} />
            <span className="text-sm">5 inventory items below reorder point</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-danger-500/10 rounded-lg">
            <TrendingUp className="text-danger-500" size={20} />
            <span className="text-sm">Quality defect rate increased 2.1% this week</span>
          </div>
        </div>
      </div>
    </div>
  );
}
