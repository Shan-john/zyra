import { FlaskConical } from "lucide-react";

export default function SimulationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
          <FlaskConical size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Simulation Engine</h1>
          <p className="text-surface-700">Run what-if scenarios, Monte Carlo, sensitivity analysis, and stress tests.</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Scenario Builder</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Scenario Name</label>
            <input className="input-field" placeholder="e.g. Raw material cost increase..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Type</label>
            <select className="input-field">
              <option>What-If</option>
              <option>Monte Carlo</option>
              <option>Sensitivity Analysis</option>
              <option>Stress Test</option>
            </select>
          </div>
        </div>
        <button className="btn-primary mt-4 flex items-center gap-2">
          <FlaskConical size={16} /> Run Simulation
        </button>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Saved Scenarios</h2>
        <div className="h-48 flex items-center justify-center text-surface-700">Scenario list will appear here</div>
      </div>
    </div>
  );
}
