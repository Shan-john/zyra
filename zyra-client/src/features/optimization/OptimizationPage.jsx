import { Zap } from "lucide-react";

export default function OptimizationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-warning-500 to-warning-600 text-white">
          <Zap size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Optimization Engine</h1>
          <p className="text-surface-700">Run LP/MIP solvers for scheduling, reordering, and resource allocation.</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Run Optimization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Type</label>
            <select className="input-field">
              <option>Production Scheduling</option>
              <option>Inventory Reorder</option>
              <option>Resource Allocation</option>
              <option>Cost Minimization</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Objective</label>
            <input className="input-field" placeholder="e.g. Maximize throughput..." />
          </div>
        </div>
        <button className="btn-primary mt-4 flex items-center gap-2">
          <Zap size={16} /> Run Optimizer
        </button>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Optimization History</h2>
        <div className="h-48 flex items-center justify-center text-surface-700">Past runs will appear here</div>
      </div>
    </div>
  );
}
