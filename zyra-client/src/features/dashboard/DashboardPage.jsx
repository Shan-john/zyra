import { useState, useEffect } from "react";
import { Package, Factory, Truck, ShoppingCart, DollarSign, Shield, TrendingUp, AlertTriangle, Activity, Settings, Calendar } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from "recharts";
import KpiCard from "../../components/charts/KpiCard";
import axios from "axios";
import axiosInstance from "../../api/axiosInstance";

export default function DashboardPage() {
  const [scheduleData, setScheduleData] = useState(null);
  const [maintenanceSim, setMaintenanceSim] = useState(null);
  const [loading, setLoading] = useState(true);

  // Weights for the optimization endpoint
  const [weights, setWeights] = useState({
    throughputWeight: 1.0,
    downtimeWeight: 0.8,
    maintenanceWeight: 0.5
  });

  useEffect(() => {
    fetchDashboardData();
  }, [weights]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Call the lightweight real-time scheduling API
      // It returns the schedule, deferred jobs, KPIs, and machine utilization
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/schedule/optimize`, weights);
      const data = res.data.data;
      setScheduleData(data);

      // Pick the highest risk machine for the maintenance scenario simulator
      if (data && data.machine_utilization?.length > 0) {
        const highestRisk = [...data.machine_utilization].sort((a,b) => b.failure_probability - a.failure_probability)[0];
        
        // Mocking the scenario return since we don't have MongoDB running locally for the full API
        // In production this would be: await axiosInstance.post("/maintenance/simulate", { equipment: ... })
        const simulatedScenario = {
          equipment_id: highestRisk.machine_id,
          equipment_name: highestRisk.machine_name,
          failure_probability: highestRisk.failure_probability,
          scenarios: {
            immediate: {
              cost: 15000 + (highestRisk.failure_probability * 0.3 * 75000) + (4 * 8000), // Preventative + Residual risk + planned downtime
              downtime: 4 + (highestRisk.failure_probability * 0.3 * 24),
              name: "Scenario A: Immediate Preventive"
            },
            delayed: {
              cost: (highestRisk.failure_probability * 75000) + (highestRisk.failure_probability * 24 * 8000), // Risk * Corrective + Risk * Unplanned Downtime
              downtime: highestRisk.failure_probability * 24,
              name: "Scenario B: Run to Failure (Delayed)"
            }
          }
        };
        
        setMaintenanceSim(simulatedScenario);
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !scheduleData) {
    return <div className="flex h-64 items-center justify-center text-surface-500">Loading AI optimization engine...</div>;
  }

  // Formatting helpers
  const formatCurrency = (val) => `₹${(val / 1000).toFixed(1)}K`;
  const formatPercentage = (val) => `${(val * 100).toFixed(1)}%`;
  
  // Custom charts data
  const probChartData = scheduleData?.machine_utilization?.map(m => ({
    name: m.machine_id,
    prob: parseFloat((m.failure_probability * 100).toFixed(1)),
    utilization: m.utilization_pct
  })) || [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">AI Command Center</h1>
          <p className="text-surface-700 mt-1">Real-time optimization & predictive insights.</p>
        </div>

        {/* Real-time slider controls to demonstrate the optimization engine */}
        <div className="mt-4 md:mt-0 flex gap-4 bg-white p-3 rounded-lg shadow-sm border border-surface-200">
          <div className="flex flex-col">
            <label className="text-xs text-surface-600 mb-1">Throughput</label>
            <input type="range" min="0" max="1" step="0.1" value={weights.throughputWeight} onChange={(e) => setWeights({...weights, throughputWeight: parseFloat(e.target.value)})} className="w-24 accent-primary-600" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-surface-600 mb-1">Risk Aversion</label>
            <input type="range" min="0" max="1" step="0.1" value={weights.downtimeWeight} onChange={(e) => setWeights({...weights, downtimeWeight: parseFloat(e.target.value)})} className="w-24 accent-danger-500" />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-surface-600 mb-1">Cost Control</label>
            <input type="range" min="0" max="1" step="0.1" value={weights.maintenanceWeight} onChange={(e) => setWeights({...weights, maintenanceWeight: parseFloat(e.target.value)})} className="w-24 accent-amber-500" />
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Projected Revenue" 
          value={`₹${(scheduleData?.kpis?.total_revenue || 0).toLocaleString('en-IN')}`} 
          change={`${scheduleData?.kpis?.scheduled_jobs} jobs scheduled`} changeType="up" icon={DollarSign} color="purple" 
        />
        <KpiCard 
          title="Downtime Risk Cost" 
          value={`₹${(scheduleData?.kpis?.total_downtime_risk_cost || 0).toLocaleString('en-IN')}`} 
          change={`${scheduleData?.risk_summary?.high_risk_machines} machines at risk`} changeType="down" icon={AlertTriangle} color="red" 
        />
        <KpiCard 
          title="Avg Utilization" 
          value={`${scheduleData?.kpis?.avg_utilization_pct || 0}%`} 
          change={`${scheduleData?.kpis?.total_production_hours} machine hours`} changeType="up" icon={Activity} color="blue" 
        />
        <KpiCard 
          title="Net Value Score" 
          value={`₹${(scheduleData?.kpis?.net_value || 0).toLocaleString('en-IN')}`} 
          change="After costs & risk" changeType="up" icon={TrendingUp} color="emerald" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 2: Failure Probability Chart */}
        <div className="card">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Activity className="text-primary-500" size={20} />
            Failure Probability by Machine
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={probChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `${val}%`} />
                <RechartsTooltip 
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="prob" name="Failure Risk (%)" radius={[4, 4, 0, 0]}>
                  {probChartData.map((entry, index) => (
                    <cell key={`cell-${index}`} fill={entry.prob > 50 ? '#EF4444' : entry.prob > 25 ? '#F59E0B' : '#10B981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section 3: Maintenance Scenario Comparison */}
        <div className="card">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Settings className="text-surface-600" size={20} />
            Maintenance Simulation ({maintenanceSim?.equipment_id || 'calculating...'})
          </h2>
          {maintenanceSim ? (
            <div className="space-y-4">
              <div className="bg-surface-50 p-4 rounded-lg border border-surface-200">
                <div className="text-sm text-surface-600 mb-1">Target Machine</div>
                <div className="font-semibold text-surface-900">{maintenanceSim.equipment_name}</div>
                <div className="mt-2 text-sm flex items-center gap-2">
                  <span className="text-surface-600">Current Risk:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    maintenanceSim.failure_probability > 0.5 ? 'bg-danger-100 text-danger-700' : 'bg-warning-100 text-warning-700'
                  }`}>
                    {(maintenanceSim.failure_probability * 100).toFixed(1)}% Failure Prob
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 p-4 rounded-lg border border-primary-100 shadow-sm">
                  <h3 className="font-medium text-primary-900 mb-2 truncate" title={maintenanceSim.scenarios.immediate.name}>
                    Scenario A (Preventive)
                  </h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-700">Cost</span>
                      <span className="font-semibold text-primary-900">₹{(maintenanceSim.scenarios.immediate.cost).toLocaleString('en-IN', {maximumFractionDigits:0})}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-primary-700">Downtime</span>
                      <span className="font-semibold text-primary-900">{maintenanceSim.scenarios.immediate.downtime.toFixed(1)}h</span>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-50 p-4 rounded-lg border border-surface-200">
                  <h3 className="font-medium text-surface-900 mb-2 truncate" title={maintenanceSim.scenarios.delayed.name}>
                    Scenario B (Delayed)
                  </h3>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-600">Cost (Exp)</span>
                      <span className="font-semibold text-surface-900">₹{(maintenanceSim.scenarios.delayed.cost).toLocaleString('en-IN', {maximumFractionDigits:0})}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-surface-600">Downtime (Exp)</span>
                      <span className="font-semibold text-surface-900">{maintenanceSim.scenarios.delayed.downtime.toFixed(1)}h</span>
                    </div>
                  </div>
                </div>
              </div>
              {maintenanceSim.scenarios.immediate.cost < maintenanceSim.scenarios.delayed.cost && (
                <div className="text-sm text-primary-700 bg-primary-50 p-2 rounded text-center">
                  💡 Recommendation: Schedule maintenance immediately.
                </div>
              )}
            </div>
          ) : (
             <div className="h-64 flex items-center justify-center text-surface-400">Loading simulation...</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Machine Table */}
        <div className="card overflow-hidden flex flex-col">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Factory className="text-surface-600" size={20} />
            Machine Status & Risk
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-surface-50 text-surface-600 border-b border-surface-200">
                <tr>
                  <th className="px-4 py-3 font-medium">Machine</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Health / Risk</th>
                  <th className="px-4 py-3 font-medium">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {scheduleData?.machine_utilization?.map((m) => {
                  const prob = m.failure_probability;
                  const healthScore = 100 - (prob * 100);
                  const isHighRisk = prob > 0.5;
                  const isMediumRisk = prob > 0.25;
                  
                  return (
                    <tr key={m.machine_id} className="hover:bg-surface-50">
                      <td className="px-4 py-3 font-medium text-surface-900">{m.machine_id}</td>
                      <td className="px-4 py-3 text-surface-600 capitalize">{m.type}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-surface-200 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full ${isHighRisk ? 'bg-danger-500' : isMediumRisk ? 'bg-warning-500' : 'bg-success-500'}`} 
                              style={{ width: `${healthScore}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${isHighRisk ? 'text-danger-600' : isMediumRisk ? 'text-warning-600' : 'text-success-600'}`}>
                            {healthScore.toFixed(0)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-surface-700">{m.utilization_pct}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Job Allocation View */}
        <div className="card overflow-hidden flex flex-col">
          <h2 className="text-lg font-semibold text-surface-900 mb-4 flex items-center gap-2">
            <Calendar className="text-primary-600" size={20} />
            Optimal Job Schedule
          </h2>
          <div className="overflow-y-auto pr-2 space-y-3" style={{ maxHeight: "300px" }}>
            {scheduleData?.schedule?.length > 0 ? (
              scheduleData.schedule.map((job) => (
                <div key={job.job_id} className="bg-surface-50 border border-surface-200 p-3 rounded-lg flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-surface-900">{job.job_name} <span className="text-surface-500 font-normal text-xs ml-1">({job.job_id})</span></div>
                      <div className="text-xs text-surface-600 flex items-center gap-1 mt-0.5">
                        <Factory size={12} /> {job.machine_name} 
                        <span className="mx-1">•</span> 
                        {job.duration_hours}h duration
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-success-600 font-semibold text-sm">₹{(job.revenue / 1000).toFixed(1)}k</div>
                      <div className="text-xs text-surface-500">Revenue</div>
                    </div>
                  </div>
                  
                  {/* Timeline bar representation */}
                  <div className="flex bg-surface-200 h-6 rounded overflow-hidden text-[10px] w-full mt-1 relative">
                    <div 
                      className="bg-primary-100 flex items-center px-2 text-primary-700 whitespace-nowrap" 
                      style={{ flex: job.start_hour, minWidth: job.start_hour > 0 ? '1px' : '0' }}
                    >
                      {job.start_hour > 0 && `Wait: ${job.start_hour}h`}
                    </div>
                    <div 
                      className="bg-primary-500 text-white flex justify-center items-center px-1 font-medium whitespace-nowrap z-10" 
                      style={{ flex: job.duration_hours }}
                    >
                      Executing
                    </div>
                  </div>
                  
                  {job.maintenance_window && (
                    <div className="flex items-center gap-1 text-xs text-warning-700 bg-warning-50 px-2 py-1 rounded">
                      <AlertTriangle size={12} /> Scheduled preventative maintenance directly after.
                    </div>
                  )}
                </div>
              ))
            ) : (
                <div className="text-center py-8 text-surface-500">No jobs scheduled due to constraints.</div>
            )}
            
            {scheduleData?.deferred_jobs?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-surface-200">
                <h3 className="text-sm font-semibold text-danger-600 mb-2 flex items-center gap-1">
                  <Shield size={14} /> Deferred Jobs ({scheduleData.deferred_jobs.length})
                </h3>
                <div className="space-y-2">
                  {scheduleData.deferred_jobs.map(dj => (
                    <div key={dj.job_id} className="text-xs flex justify-between bg-error-50 p-2 rounded">
                      <span>{dj.job_name}</span>
                      <span className="text-danger-500">{dj.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
