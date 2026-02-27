import { Brain, Sparkles, Activity } from "lucide-react";

export default function AiInsightsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-white">
          <Brain size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">AI Insights</h1>
          <p className="text-surface-700">Gemini-powered explainability and ML failure predictions.</p>
        </div>
      </div>

      {/* Explain Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={20} className="text-accent-500" />
          <h2 className="text-lg font-semibold">Ask AI to Explain</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Context Type</label>
            <select className="input-field">
              <option>Optimization Result</option>
              <option>Simulation Output</option>
              <option>Demand Forecast</option>
              <option>Defect Report</option>
              <option>Inventory Alert</option>
              <option>General</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-surface-700 mb-1">Your Question</label>
            <input className="input-field" placeholder="e.g. Why did the reorder point increase for SKU-4821?" />
          </div>
        </div>
        <button className="btn-primary mt-4 flex items-center gap-2">
          <Sparkles size={16} /> Generate Explanation
        </button>

        {/* Explanation Result Placeholder */}
        <div className="mt-6 p-4 bg-accent-50 border border-accent-200 rounded-lg hidden">
          <p className="text-sm text-surface-900">AI explanation will appear here...</p>
        </div>
      </div>

      {/* Failure Prediction Section */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={20} className="text-danger-500" />
          <h2 className="text-lg font-semibold">ML Failure Prediction</h2>
        </div>
        <p className="text-sm text-surface-700 mb-4">
          Powered by the Python FastAPI microservice. Predicts equipment failure probability
          based on operational parameters.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Equipment ID</label>
            <input className="input-field" placeholder="e.g. EQUIP-001" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Operating Hours</label>
            <input className="input-field" type="number" placeholder="e.g. 4500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Temperature (°C)</label>
            <input className="input-field" type="number" placeholder="e.g. 85" />
          </div>
        </div>
        <button className="btn-primary mt-4 flex items-center gap-2 bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-600">
          <Activity size={16} /> Predict Failure
        </button>
      </div>

      {/* Recent Explanations */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent AI Explanations</h2>
        <div className="space-y-3">
          <div className="p-4 bg-surface-50 rounded-lg border border-surface-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-accent-600 bg-accent-50 px-2 py-0.5 rounded-full">Optimization</span>
              <span className="text-xs text-surface-700">2 hours ago</span>
            </div>
            <p className="text-sm font-medium text-surface-900">Why was Option B chosen over Option A?</p>
            <p className="text-sm text-surface-700 mt-1">Option B offers 15% lower cost while maintaining 95% of quality targets...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
