import { useState, useEffect } from "react";
import { Brain, Settings2, Factory, DollarSign, Activity, AlertTriangle, CheckCircle2, TrendingUp, ShieldAlert } from "lucide-react";
import axios from "axios";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ScatterChart, Scatter, ZAxis, Cell
} from "recharts";

export default function AiInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [prevData, setPrevData] = useState(null);
  
  // Track history of runs to plot the Tradeoff curve dynamically
  const [history, setHistory] = useState([]);

  const [weights, setWeights] = useState({
    throughputWeight: 1.0,
    downtimeWeight: 0.5,
    maintenanceWeight: 0.3
  });

  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    fetchOptimization(weights);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weights]);

  const fetchOptimization = async (currentWeights) => {
    try {
      if (!data) setLoading(true);
      else setIsComparing(true);

      const res = await axios.post("http://localhost:5000/api/schedule/optimize", currentWeights);
      const newData = res.data.data;

      if (data) setPrevData(data);
      setData(newData);

      // Append to history for the Tradeoff Chart
      setHistory(prev => {
        const h = [...prev, {
          run: prev.length + 1,
          throughput: newData.kpis.total_revenue,
          downtime: newData.kpis.total_downtime_risk_cost,
          maintenance: newData.kpis.total_maintenance_cost,
          w1: currentWeights.throughputWeight,
          w2: currentWeights.downtimeWeight,
          w3: currentWeights.maintenanceWeight
        }];
        // keep last 15 points so the chart doesn't squish too much
        return h.length > 15 ? h.slice(h.length - 15) : h;
      });
      
      setTimeout(() => setIsComparing(false), 500);
    } catch (error) {
      console.error("Optimization failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const R = (val) => Math.round(val);
  const formatCur = (val) => `₹${(val / 1000).toFixed(1)}k`;

  if (loading && !data) return <div className="h-64 flex items-center justify-center text-surface-500">Initializing Optimization Solver...</div>;

  // ─── Data Prepping for Charts ────────────────────────────────────────

  // 1. Risk Heatmap / Scatter
  const riskHeatmapData = data.machine_utilization.map(m => ({
    name: m.machine_id,
    type: m.type,
    risk: R(m.failure_probability * 100),
    utilization: m.utilization_pct
  }));

  // 2. Health Score Distribution
  const healthDist = { "Critical (0-25)": 0, "Warning (26-50)": 0, "Fair (51-75)": 0, "Good (76-100)": 0 };
  data.machine_utilization.forEach(m => {
    const health = 100 - (m.failure_probability * 100);
    if (health <= 25) healthDist["Critical (0-25)"]++;
    else if (health <= 50) healthDist["Warning (26-50)"]++;
    else if (health <= 75) healthDist["Fair (51-75)"]++;
    else healthDist["Good (76-100)"]++;
  });
  const healthChartData = Object.keys(healthDist).map(k => ({ range: k, count: healthDist[k] }));


  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-md">
          <Brain size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">AI Scheduling Management</h1>
          <p className="text-surface-600 mt-1">Multi-objective constraint solver. Adjust weights to see real-time tradeoff maps.</p>
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
              
              <div className="flex justify-between items-center p-3 bg-surface-50 rounded-lg border border-surface-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
                <span className="text-sm text-surface-600 font-medium">Net Value Score</span>
                <div className="text-right flex items-center gap-2">
                  {prevData && data.kpis.net_value !== prevData.kpis.net_value && (
                    <span className={`text-xs ml-2 flex items-center justify-end ${data.kpis.net_value > prevData.kpis.net_value ? 'text-success-600' : 'text-danger-600'}`}>
                      {data.kpis.net_value > prevData.kpis.net_value ? '↑' : '↓'} {formatCur(Math.abs(data.kpis.net_value - prevData.kpis.net_value))}
                    </span>
                  )}
                  <span className="text-lg font-bold text-primary-700">{formatCur(data.kpis.net_value)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-600">Total Throughput ($)</span>
                <span className="text-sm font-semibold text-success-600">{formatCur(data.kpis.total_revenue)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-600">Predicted Downtime Risk</span>
                <span className="text-sm font-semibold text-danger-600">{formatCur(data.kpis.total_downtime_risk_cost)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-600">Maint. Investment</span>
                <span className="text-sm font-semibold text-amber-600">{formatCur(data.kpis.total_maintenance_cost)}</span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-surface-100">
                <span className="text-sm text-surface-600">Optimization Time</span>
                <span className="text-sm font-mono text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{data.execution_time_ms}ms</span>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: Charts & Tables */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Deferred Jobs Warning */}
          {data.deferred_jobs.length > 0 && (
            <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 flex items-start gap-4">
              <AlertTriangle className="text-danger-500 mt-1" size={24} />
              <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-danger-800 font-semibold">{data.deferred_jobs.length} Priority Alert: Jobs Deferred</h3>
                  <span className="text-xs bg-danger-100 text-danger-700 px-2 py-1 rounded-full font-medium">Lost: {formatCur(data.kpis.deferred_revenue)}</span>
                </div>
                <p className="text-sm text-danger-600 mb-3">Based on your current AI weights, the engine deferred these jobs to honor risk/maintenance constraints.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.deferred_jobs.map(dj => (
                    <div key={dj.job_id} className="flex flex-col bg-white/60 p-2 rounded text-sm border border-danger-100">
                      <span className="font-medium text-surface-800">{dj.job_name} <span className="text-surface-500 text-xs">({dj.job_id})</span></span>
                      <span className="text-xs text-danger-600 italic mt-0.5">{dj.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tradeoff History Chart */}
          <div className="card">
            <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2 mb-4">
              <TrendingUp size={20} className="text-primary-500" /> Tradeoff Dynamics (Historical Tracker)
            </h2>
            <p className="text-xs text-surface-500 mb-4">Live chart recording how KPIs react dynamically to your weight slider changes.</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="run" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" tickFormatter={formatCur} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val) => formatCur(val)}
                    labelFormatter={(val) => `Simulation Run #${val}`}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  <Line yAxisId="left" type="monotone" dataKey="throughput" name="Throughput ($)" stroke="#10B981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  <Line yAxisId="left" type="monotone" dataKey="downtime" name="Risk Exposure ($)" stroke="#EF4444" strokeWidth={2} dot={{r: 3}} />
                  <Line yAxisId="left" type="monotone" dataKey="maintenance" name="Maintenance ($)" stroke="#F59E0B" strokeWidth={2} dot={{r: 3}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feature Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Risk Heatmap */}
            <div className="card">
              <h2 className="text-[15px] font-semibold text-surface-900 flex items-center gap-2 mb-4">
                <ShieldAlert size={18} className="text-danger-500" /> Machine Risk Heatmap
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, bottom: -10, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis type="category" dataKey="name" name="Machine" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                    <YAxis type="number" dataKey="risk" name="Failure Risk (%)" tick={{fontSize: 10}} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                    <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Scatter name="Machines" data={riskHeatmapData}>
                      {riskHeatmapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.risk > 50 ? '#EF4444' : entry.risk > 25 ? '#F59E0B' : '#10B981'} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Health Score Distribution */}
            <div className="card">
              <h2 className="text-[15px] font-semibold text-surface-900 flex items-center gap-2 mb-4">
                <Activity size={18} className="text-primary-500" /> Health Score Distribution
              </h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthChartData} margin={{ top: 10, right: 10, left: -20, bottom: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="range" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" name="# of Machines" radius={[4, 4, 0, 0]}>
                      {healthChartData.map((entry, index) => {
                        const colors = {
                          "Critical (0-25)": "#EF4444",
                          "Warning (26-50)": "#F59E0B",
                          "Fair (51-75)": "#3B82F6",
                          "Good (76-100)": "#10B981"
                        };
                        return <Cell key={`cell-${index}`} fill={colors[entry.range]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Schedule Tables */}
          <div className={`card transition-all duration-300 ${isComparing ? 'opacity-50 ring-2 ring-primary-200 scale-[0.99]' : 'opacity-100'}`}>
            <h2 className="text-lg font-semibold text-surface-900 flex items-center gap-2 mb-4">
              <Factory size={20} className="text-surface-500" /> Optimized Assignment List
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
                               <Settings2 size={10} /> Auto-Maint
                             </span>
                           )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
