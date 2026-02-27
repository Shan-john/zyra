import { useState, useEffect } from "react";
import { Brain, Settings2, ArrowRight, Factory, DollarSign, Activity, AlertTriangle, Shield, CheckCircle2 } from "lucide-react";
import axios from "axios";
import KpiCard from "../../components/charts/KpiCard";

export default function AiInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [prevData, setPrevData] = useState(null);

  const [weights, setWeights] = useState({
    throughputWeight: 1.0,
    downtimeWeight: 0.5,
    maintenanceWeight: 0.3
  });

  // Track if weights changed to trigger comparison animation
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    fetchOptimization(weights);
  }, [weights]);

  const fetchOptimization = async (currentWeights) => {
    try {
      if (!data) setLoading(true);
      else setIsComparing(true);

      const res = await axios.post("http://localhost:5000/api/schedule/optimize", currentWeights);
      
      if (data) setPrevData(data); // Keep the old data for comparison arrows
      setData(res.data.data);
      
      setTimeout(() => setIsComparing(false), 600);
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const R = (val) => Math.round(val);
  const formatCur = (val) => `₹${(val / 1000).toFixed(1)}k`;

  if (loading && !data) return <div className="h-64 flex items-center justify-center text-surface-500">Initializing Optimization Solver...</div>;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md">
          <Brain size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">AI Scheduling Management</h1>
          <p className="text-surface-600 mt-1">Multi-objective constraint solver. Adjust weights to see real-time strategy shifts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        
        {/* Left Column: Sliders & KPIs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card sticky top-20">
            <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2 mb-6">
              <Settings2 className="text-surface-500" /> Objective Weights
            </h2>

            <div className="space-y-6">
              {/* Slider 1 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-surface-700 flex items-center gap-1.5">
                    <DollarSign size={16} className="text-success-500" /> Maximize Throughput
                  </label>
                  <span className="text-xs font-mono font-semibold bg-success-50 text-success-700 px-2 py-0.5 rounded">W1: {weights.throughputWeight.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  value={weights.throughputWeight} 
                  onChange={(e) => setWeights({...weights, throughputWeight: parseFloat(e.target.value)})} 
                  className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-success-500"
                />
              </div>

              {/* Slider 2 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-surface-700 flex items-center gap-1.5">
                    <Activity size={16} className="text-danger-500" /> Minimize Risk
                  </label>
                  <span className="text-xs font-mono font-semibold bg-danger-50 text-danger-700 px-2 py-0.5 rounded">W2: {weights.downtimeWeight.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  value={weights.downtimeWeight} 
                  onChange={(e) => setWeights({...weights, downtimeWeight: parseFloat(e.target.value)})} 
                  className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-danger-500"
                />
              </div>

              {/* Slider 3 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-surface-700 flex items-center gap-1.5">
                    <Settings2 size={16} className="text-amber-500" /> Minimize Maintenance
                  </label>
                  <span className="text-xs font-mono font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">W3: {weights.maintenanceWeight.toFixed(1)}</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.1" 
                  value={weights.maintenanceWeight} 
                  onChange={(e) => setWeights({...weights, maintenanceWeight: parseFloat(e.target.value)})} 
                  className="w-full h-2 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            <hr className="my-6 border-surface-200" />

            <h3 className="text-sm font-semibold text-surface-900 mb-4 uppercase tracking-wider">Projected Outcomes</h3>
            <div className={`space-y-4 transition-opacity duration-300 ${isComparing ? 'opacity-50' : 'opacity-100'}`}>
              
              <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg border border-surface-100">
                <span className="text-sm text-surface-600 font-medium">Net Value Score</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-primary-700">{formatCur(data.kpis.net_value)}</span>
                  {prevData && data.kpis.net_value !== prevData.kpis.net_value && (
                    <span className={`text-xs ml-2 flex items-center justify-end ${data.kpis.net_value > prevData.kpis.net_value ? 'text-success-600' : 'text-danger-600'}`}>
                      {data.kpis.net_value > prevData.kpis.net_value ? '↑' : '↓'} {formatCur(Math.abs(data.kpis.net_value - prevData.kpis.net_value))}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-600">Total Revenue</span>
                <span className="text-sm font-semibold text-success-600">{formatCur(data.kpis.total_revenue)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-600">Risk Cost Exposure</span>
                <span className="text-sm font-semibold text-danger-600">{formatCur(data.kpis.total_downtime_risk_cost)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-600">Maintenance Cost</span>
                <span className="text-sm font-semibold text-amber-600">{formatCur(data.kpis.total_maintenance_cost)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-600">Jobs Scheduled</span>
                <span className="text-sm font-semibold text-surface-800">{data.kpis.scheduled_jobs} / {data.kpis.scheduled_jobs + data.kpis.deferred_jobs}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-600">Avg Utilization</span>
                <span className="text-sm font-semibold text-surface-800">{data.kpis.avg_utilization_pct}%</span>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Tables & Schedule */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Deferred Jobs Warning */}
          {data.deferred_jobs.length > 0 && (
            <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 flex items-start gap-4">
              <AlertTriangle className="text-danger-500 mt-1" size={24} />
              <div>
                <h3 className="text-danger-800 font-semibold mb-1">{data.deferred_jobs.length} Priority Alert: Jobs Deferred</h3>
                <p className="text-sm text-danger-600 mb-3">Based on your current weights, the engine deferred these jobs to honor constraints.</p>
                <div className="space-y-2">
                  {data.deferred_jobs.map(dj => (
                    <div key={dj.job_id} className="flex justify-between items-center bg-white/60 p-2 rounded text-sm">
                      <span className="font-medium text-surface-800">{dj.job_name} <span className="text-surface-500 text-xs">({dj.job_id})</span></span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-danger-600 font-medium">Lost: {formatCur(dj.revenue_lost)}</span>
                        <span className="text-xs text-surface-600 italic border-l border-danger-200 pl-3">{dj.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Schedule output */}
          <div className={`card transition-all duration-300 ${isComparing ? 'opacity-50 ring-2 ring-primary-200 scale-[0.99]' : 'opacity-100'}`}>
            <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2 mb-4">
              <Factory size={20} className="text-surface-500" /> Optimized Assignment Roster
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-surface-50 text-surface-600 border-b border-surface-200">
                  <tr>
                    <th className="px-4 py-3 font-medium rounded-tl-lg">Job</th>
                    <th className="px-4 py-3 font-medium">Assigned Machine</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium text-right">Revenue</th>
                    <th className="px-4 py-3 font-medium text-right rounded-tr-lg">Risk/Maint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {data.schedule.map((job) => (
                    <tr key={job.job_id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-surface-900">{job.job_name}</div>
                        <div className="text-xs text-surface-500">{job.job_id}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-success-500" />
                          <span className="text-surface-700 font-medium">{job.machine_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-surface-100 text-surface-700 px-2 py-1 rounded text-xs">
                          {job.duration_hours}h
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-success-600">{formatCur(job.revenue)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end gap-1">
                           <span className={`text-xs px-2 py-0.5 rounded-full ${job.failure_probability > 0.5 ? 'bg-danger-100 text-danger-700' : 'bg-surface-100 text-surface-600'}`}>
                             {(job.failure_probability * 100).toFixed(0)}% fail prob
                           </span>
                           {job.maintenance_window && (
                             <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                               <Settings2 size={10} /> Auto-Maint Added
                             </span>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex items-center justify-between text-xs text-surface-500 bg-surface-50 p-3 rounded-lg border border-surface-200">
               <span>Algorithm: Greedy Composite PQ</span>
               <span>Compute time: <strong className="text-primary-600">{data.execution_time_ms}ms</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
