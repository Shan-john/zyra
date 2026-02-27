import { useState, useMemo, useEffect } from "react";
import {
  Factory, Plus, X, Edit2, Trash2, Thermometer, Activity,
  Zap, AlertTriangle, CheckCircle2, ShieldAlert, ChevronDown, ChevronUp, Brain
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import * as api from "../../api/productionApi";

// ─── Sensor History Generator (30 days of readings per machine) ───────────────
function generateHistory(machineConfig) {
  const {
    baseTempC = 70, baseVibration = 2.0, baseEnergyKWh = 20,
    tempVariance = 5, vibVariance = 0.5, energyVariance = 3,
    degradationRate = 0.1  // 0–1, how fast readings worsen over 30 days
  } = machineConfig || {};

  return Array.from({ length: 30 }, (_, i) => {
    const dayFactor = 1 + degradationRate * (i / 29);
    const noise     = v => v * (0.92 + Math.random() * 0.16);
    return {
      day:        `D${String(i + 1).padStart(2, "0")}`,
      tempC:      +( baseTempC  * dayFactor + (Math.random() - 0.5) * tempVariance   ).toFixed(1),
      vibration:  +( baseVibration * dayFactor + (Math.random() - 0.5) * vibVariance ).toFixed(2),
      energyKWh:  +( noise(baseEnergyKWh * dayFactor)                                ).toFixed(1),
    };
  });
}

// ─── Risk Scoring Engine ──────────────────────────────────────────────────────
function computeRisk(history, thresholds, lastMaintDate) {
  if (!history.length) return { risk: 0, healthScore: 100, label: "LOW", factors: {} };

  const { safeMaxTemp = 90, safeMaxVib = 4.0, baselineEnergy = 25, maintIntervalDays = 30 } = thresholds || {};

  const avgTemp     = history.reduce((s, d) => s + d.tempC,     0) / history.length;
  const avgVib      = history.reduce((s, d) => s + d.vibration, 0) / history.length;
  const avgEnergy   = history.reduce((s, d) => s + d.energyKWh, 0) / history.length;
  const peakTemp    = Math.max(...history.map(d => d.tempC));
  const peakVib     = Math.max(...history.map(d => d.vibration));
  const trend7Day   = history.slice(-7);
  const recentTemp  = trend7Day.reduce((s,d)=>s+d.tempC,0)/trend7Day.length;
  const recentVib   = trend7Day.reduce((s,d)=>s+d.vibration,0)/trend7Day.length;

  const daysSinceMaint = lastMaintDate 
    ? Math.floor((Date.now() - new Date(lastMaintDate).getTime()) / 86400000)
    : 0;

  const tempScore   = Math.min(25, Math.max(0, ((peakTemp - safeMaxTemp) / safeMaxTemp) * 60 + ((recentTemp - avgTemp) / avgTemp) * 20));
  const vibScore    = Math.min(25, Math.max(0, ((peakVib - safeMaxVib) / safeMaxVib) * 70 + ((recentVib - avgVib) / avgVib) * 20));
  const energyScore = Math.min(25, Math.max(0, ((avgEnergy - baselineEnergy) / baselineEnergy) * 50));
  const maintScore  = Math.min(25, Math.max(0, daysSinceMaint > maintIntervalDays ? ((daysSinceMaint - maintIntervalDays) / maintIntervalDays) * 50 : 0));

  const risk        = Math.round(tempScore + vibScore + energyScore + maintScore);
  const healthScore = Math.max(0, 100 - risk);
  const label       = risk >= 70 ? "CRITICAL" : risk >= 45 ? "HIGH" : risk >= 20 ? "MEDIUM" : "LOW";

  return {
    risk, healthScore, label,
    factors: {
      temperature:  { score: Math.round(tempScore),   avg: +avgTemp.toFixed(1),   peak: +peakTemp.toFixed(1),   recentTrend: +recentTemp.toFixed(1) },
      vibration:    { score: Math.round(vibScore),    avg: +avgVib.toFixed(2),    peak: +peakVib.toFixed(2),    recentTrend: +recentVib.toFixed(2)  },
      energy:       { score: Math.round(energyScore), avg: +avgEnergy.toFixed(1)                                                                    },
      maintenance:  { score: Math.round(maintScore),  daysSinceMaint                                                                                },
    },
    daysSinceMaint,
    avgTemp: +avgTemp.toFixed(1),
    avgVib:  +avgVib.toFixed(2),
    avgEnergy: +avgEnergy.toFixed(1),
  };
}

const PRIORITIES = ["High","Medium","Low"];
const WO_STATUSES = ["Queued","In Progress","Complete"];
const BLANK_W = { job:"", machine:"", hours:1, priority:"Medium", status:"Queued" };

const riskBand  = r => r >= 70 ? "text-danger-700 bg-danger-50 border-danger-200" : r >= 40 ? "text-warning-700 bg-warning-50 border-warning-200" : "text-success-700 bg-success-50 border-success-200";
const riskFill  = r => r >= 70 ? "#EF4444" : r >= 40 ? "#F59E0B" : "#10B981";
const statusBadge = s => ({ "Running":"bg-success-100 text-success-700","High Risk":"bg-danger-100 text-danger-700","Offline":"bg-surface-200 text-surface-600","Maintenance":"bg-warning-100 text-warning-700" }[s] || "bg-surface-100 text-surface-600");
const woBadge   = s => ({ "In Progress":"bg-primary-100 text-primary-700","Queued":"bg-surface-100 text-surface-600","Complete":"bg-success-100 text-success-700" }[s] || "");

export default function ProductionPage() {
  const [machines, setMachines] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [woModal, setWoModal]   = useState(null);
  const [woForm, setWoForm]     = useState(BLANK_W);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  // Hydrate from MongoDB
  const loadData = async () => {
    try {
      setLoading(true);
      const [mRes, oRes] = await Promise.all([
        api.getMachines(),
        api.getWorkOrders()
      ]);
      // Run risk scoring engine on the fetched machines
      const scoredFleet = mRes.data.data.map(m => {
        const history = generateHistory(m.sensorConfig);
        const scored  = computeRisk(history, m.thresholds, m.lastMaint);
        return { ...m, history, scored };
      });
      setMachines(scoredFleet);
      setOrders(oRes.data.data.workOrders || oRes.data.data); // handles pagination vs flat array
    } catch (err) {
      console.error("Failed to load production data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const alerts = useMemo(() => {
    return machines.filter(m => m.scored.risk >= 45 || m.scored.factors.maintenance?.score >= 15)
      .map(m => ({
        id: m.machineId || m._id, name: m.name,
        msg: m.scored.risk >= 70
          ? `🔴 CRITICAL — ${m.name} at ${m.scored.risk}% risk. Immediate maintenance required.`
          : m.scored.factors.maintenance?.daysSinceMaint > 40
          ? `🟡 ${m.name}: ${m.scored.factors.maintenance.daysSinceMaint} days since last maintenance. Schedule now.`
          : `🟠 ${m.name}: Risk at ${m.scored.risk}%. High vibration/temperature trend detected.`,
      }));
  }, [machines]);

  // MongoDB Saves
  const handleSaveWO = async () => {
    try {
      if (woModal === "add") {
        await api.createWorkOrder({
          ...woForm,
          orderNumber: `WO-${Date.now().toString().slice(-4)}` // Auto-generate if new
        });
      } else {
        await api.updateWorkOrder(woForm.orderNumber || woForm._id, woForm);
      }
      setWoModal(null);
      loadData(); // Re-fetch to guarantee source of truth
    } catch (err) {
      console.error("Failed to save work order", err);
      alert("Failed to save. Check console.");
    }
  };

  const handleDeleteWO = async (id) => {
    try {
      await api.deleteWorkOrder(id);
      loadData();
    } catch (err) {
      console.error("Failed to delete work order", err);
    }
  };

  const critical = machines.filter(m => m.scored?.risk >= 70).length;
  const high     = machines.filter(m => m.scored?.risk >= 40 && m.scored?.risk < 70).length;
  const healthy  = machines.filter(m => m.scored?.risk < 40).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-primary-600">
        <span className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
        <span className="ml-3 font-semibold text-lg">Connecting to Factory Floor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 flex items-center gap-2"><Factory size={24} className="text-primary-600" /> Production Floor</h1>
          <p className="text-surface-500 text-sm mt-1 flex items-center gap-1.5">
            <Brain size={14} className="text-indigo-500" />
            Risk scores auto-calculated from 30 days of sensor history (temperature, vibration, energy, maintenance).
          </p>
        </div>
        <button onClick={() => { setWoForm(BLANK_W); setWoModal("add"); }} className="btn-primary flex items-center gap-2"><Plus size={18} />New Work Order</button>
      </div>

      {/* ─── KPI Strip ─── */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center border-l-4 border-success-500"><div className="text-2xl font-bold text-success-600">{healthy}</div><div className="text-xs text-surface-500 mt-1">Healthy Machines</div></div>
        <div className="card text-center border-l-4 border-warning-500"><div className="text-2xl font-bold text-warning-600">{high}</div><div className="text-xs text-surface-500 mt-1">High Risk</div></div>
        <div className="card text-center border-l-4 border-danger-500"><div className="text-2xl font-bold text-danger-600">{critical}</div><div className="text-xs text-surface-500 mt-1">Critical</div></div>
        <div className="card text-center border-l-4 border-primary-500"><div className="text-2xl font-bold text-primary-700">{machines.length}</div><div className="text-xs text-surface-500 mt-1">Total Machines</div></div>
      </div>

      {/* ─── AI Alert Banner ─── */}
      {alerts.length > 0 && (
        <div className="rounded-xl border border-danger-300 bg-danger-50 p-4 space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-danger-800 flex items-center gap-2"><AlertTriangle size={18} />{alerts.length} AI-Generated Risk Alert{alerts.length > 1 ? "s" : ""}</h2>
            <button onClick={() => setShowAllAlerts(v => !v)} className="text-xs text-danger-700 hover:underline flex items-center gap-1">
              {showAllAlerts ? <><ChevronUp size={13} />Show less</> : <><ChevronDown size={13} />Show all</>}
            </button>
          </div>
          {(showAllAlerts ? alerts : alerts.slice(0, 2)).map(a => (
            <div key={a.id} className="text-sm text-surface-800 bg-white/70 py-2 px-3 rounded-lg border border-danger-200">{a.msg}</div>
          ))}
        </div>
      )}

      {/* ─── Machine Table with expandable sensor rows ─── */}
      <div className="card overflow-x-auto">
        <h2 className="text-base font-semibold text-surface-900 mb-4 flex items-center gap-2"><Brain size={16} className="text-indigo-500" /> Machine Fleet — AI Risk Analysis</h2>
        <table className="w-full text-sm">
          <thead className="bg-surface-50 border-b border-surface-200">
            <tr>{["","ID","Machine","Operator","Avg Temp","Avg Vibration","Avg Energy","Last Maint","Days","Risk Score","Health","Status"].map(h => (
              <th key={h} className="text-left py-3 px-3 font-semibold text-surface-700 whitespace-nowrap text-xs">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
             {machines.map(m => {
              const s   = m.scored;
              // Support both initial DB seed 'machineId' and generic '_id'
              const stableId = m.machineId || m._id;
              const isOpen = expanded === stableId;
              const daysAgo = Math.floor(s.daysSinceMaint);
              return (
                <>
                  <tr key={stableId} className={`border-b border-surface-100 transition cursor-pointer hover:bg-surface-50 ${isOpen ? "bg-indigo-50/60" : ""}`}
                    onClick={() => setExpanded(isOpen ? null : stableId)}>
                    <td className="py-3 px-2 w-6 text-surface-400">{isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</td>
                    <td className="py-3 px-3 font-mono text-xs text-surface-500">{stableId}</td>
                    <td className="py-3 px-3 font-semibold text-surface-900">{m.name}</td>
                    <td className="py-3 px-3 text-surface-600">{m.operator}</td>
                    {/* Sensor readings */}
                    <td className="py-3 px-3">
                      <span className={`flex items-center gap-1 font-medium ${s.factors.temperature?.score > 12 ? "text-danger-600" : s.factors.temperature?.score > 6 ? "text-warning-600" : "text-success-600"}`}>
                        <Thermometer size={12} />{s.avgTemp}°C
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`flex items-center gap-1 font-medium ${s.factors.vibration?.score > 12 ? "text-danger-600" : s.factors.vibration?.score > 6 ? "text-warning-600" : "text-success-600"}`}>
                        <Activity size={12} />{s.avgVib}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1 text-surface-600"><Zap size={12} />{s.avgEnergy} kWh</span>
                    </td>
                    <td className="py-3 px-3 text-surface-600 text-xs">{new Date(m.lastMaint).toLocaleDateString()}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-bold ${daysAgo > 45 ? "text-danger-600" : daysAgo > 25 ? "text-warning-600" : "text-success-600"}`}>{daysAgo}d ago</span>
                    </td>
                    {/* Risk score */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-surface-200 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${s.risk}%`, background: riskFill(s.risk) }} />
                        </div>
                        <span className={`text-xs font-extrabold px-1.5 py-0.5 rounded border ${riskBand(s.risk)}`}>{s.risk}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`text-xs font-bold ${s.healthScore >= 70 ? "text-success-600" : s.healthScore >= 50 ? "text-warning-600" : "text-danger-600"}`}>{s.healthScore}/100</span>
                    </td>
                    <td className="py-3 px-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(m.status)}`}>{m.status}</span></td>
                  </tr>

                  {/* ─── Expanded Sensor Details Panel ─── */}
                  {isOpen && (
                    <tr key={`${stableId}-exp`} className="bg-indigo-50/40">
                      <td colSpan={13} className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          {/* Factor breakdown */}
                          <div className="space-y-3">
                            <h3 className="text-xs font-bold text-surface-700 uppercase tracking-wider flex items-center gap-1.5"><ShieldAlert size={13} className="text-indigo-500" />Risk Factor Breakdown</h3>
                            {[
                              ["🌡 Temperature",  s.factors.temperature?.score,  `Avg ${s.avgTemp}°C · Peak ${s.factors.temperature?.peak}°C · Trend ${s.factors.temperature?.recentTrend}°C`],
                              ["📳 Vibration",    s.factors.vibration?.score,    `Avg ${s.avgVib} · Peak ${s.factors.vibration?.peak} · Trend ${s.factors.vibration?.recentTrend}`],
                              ["⚡ Energy",       s.factors.energy?.score,       `Avg ${s.avgEnergy} kWh/day`],
                              ["🔧 Maintenance",  s.factors.maintenance?.score,  `${s.daysSinceMaint} days since last service`],
                            ].map(([label, score, detail]) => (
                              <div key={label}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs font-semibold text-surface-700">{label}</span>
                                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${score >= 15 ? "bg-danger-100 text-danger-700" : score >= 8 ? "bg-warning-100 text-warning-700" : "bg-success-100 text-success-700"}`}>{score}/25</span>
                                </div>
                                <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden mb-0.5">
                                  <div className="h-full rounded-full" style={{ width: `${(score / 25) * 100}%`, background: score >= 15 ? "#EF4444" : score >= 8 ? "#F59E0B" : "#10B981" }} />
                                </div>
                                <div className="text-xs text-surface-500">{detail}</div>
                              </div>
                            ))}
                            <div className={`mt-2 p-2 rounded-lg border text-xs font-semibold flex items-center gap-2 ${s.risk >= 70 ? "bg-danger-100 border-danger-300 text-danger-800" : s.risk >= 40 ? "bg-warning-100 border-warning-300 text-warning-800" : "bg-success-100 border-success-300 text-success-800"}`}>
                              {s.risk >= 70 ? <AlertTriangle size={14} /> : s.risk >= 40 ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                              AI Assessment: <strong>{s.label}</strong> — Total Risk {s.risk}% / Health {s.healthScore}/100
                            </div>
                          </div>

                          {/* Temperature sparkline */}
                          <div>
                            <h3 className="text-xs font-bold text-surface-700 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Thermometer size={13} className="text-rose-500" />30-Day Temperature Trend</h3>
                            <div className="h-32">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={m.history} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E2E8F0" />
                                  <XAxis dataKey="day" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={6} />
                                  <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "6px", border: "none" }} formatter={v=>[`${v}°C`, "Temp"]} />
                                  <Line type="monotone" dataKey="tempC" stroke={riskFill(s.risk)} strokeWidth={2} dot={false} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Vibration sparkline */}
                          <div>
                            <h3 className="text-xs font-bold text-surface-700 uppercase tracking-wider mb-3 flex items-center gap-1.5"><Activity size={13} className="text-indigo-500" />30-Day Vibration Trend</h3>
                            <div className="h-32">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={m.history} margin={{ top: 5, right: 5, left: -30, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#E2E8F0" />
                                  <XAxis dataKey="day" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} interval={6} />
                                  <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                                  <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "6px", border: "none" }} formatter={v=>[v, "Vibration"]} />
                                  <Line type="monotone" dataKey="vibration" stroke="#6366F1" strokeWidth={2} dot={false} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ─── Work Orders ─── */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-surface-900">Work Orders</h2>
          <button onClick={() => { setWoForm(BLANK_W); setWoModal("add"); }} className="btn-primary text-sm flex items-center gap-2"><Plus size={14} />Add Order</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>{["WO #","Job","Machine","Est. Hours","Priority","Status","Actions"].map(h => <th key={h} className="text-left py-3 px-3 font-semibold text-surface-700 whitespace-nowrap">{h}</th>)}</tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.orderNumber || o._id} className="border-b border-surface-100 hover:bg-surface-50 transition">
                  <td className="py-3 px-3 font-mono text-xs text-surface-500">{o.orderNumber}</td>
                  <td className="py-3 px-3 font-medium">{o.job}</td>
                  <td className="py-3 px-3 text-surface-600">{o.machine}</td>
                  <td className="py-3 px-3">{o.hours}h</td>
                  <td className="py-3 px-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.priority==="High"?"bg-danger-100 text-danger-700":o.priority==="Medium"?"bg-warning-100 text-warning-700":"bg-success-100 text-success-700"}`}>{o.priority}</span></td>
                  <td className="py-3 px-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${woBadge(o.status)}`}>{o.status}</span></td>
                  <td className="py-3 px-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setWoForm({...o}); setWoModal("edit"); }} className="p-1.5 text-surface-400 hover:text-primary-600 hover:bg-primary-50 rounded transition"><Edit2 size={13} /></button>
                      <button onClick={() => handleDeleteWO(o.orderNumber || o._id)} className="p-1.5 text-surface-400 hover:text-danger-600 hover:bg-danger-50 rounded transition"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Work Order Modal ─── */}
      {woModal && (
        <div className="fixed inset-0 bg-surface-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-5 border-b"><h3 className="font-bold">{woModal === "add" ? "New Work Order" : "Edit Work Order"}</h3><button onClick={() => setWoModal(null)} className="p-1 bg-surface-100 rounded-full"><X size={16} /></button></div>
            <div className="p-5 space-y-4">
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Job Description</label><input type="text" value={woForm.job} onChange={e => setWoForm({...woForm, job: e.target.value})} className="input-field w-full" /></div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Machine</label>
                <select value={woForm.machine} onChange={e => setWoForm({...woForm, machine: e.target.value})} className="input-field w-full">
                  <option value="">Select machine…</option>
                  {machines.map(m => <option key={m.machineId || m._id} value={m.name}>{m.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-surface-700 mb-1">Est. Hours</label><input type="number" min="1" value={woForm.hours} onChange={e => setWoForm({...woForm, hours: e.target.value})} className="input-field w-full" /></div>
                <div><label className="block text-xs font-semibold text-surface-700 mb-1">Priority</label><select value={woForm.priority} onChange={e => setWoForm({...woForm, priority: e.target.value})} className="input-field w-full">{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></div>
              </div>
              <div><label className="block text-xs font-semibold text-surface-700 mb-1">Status</label><select value={woForm.status} onChange={e => setWoForm({...woForm, status: e.target.value})} className="input-field w-full">{WO_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t">
              <button disabled={loading} onClick={() => setWoModal(null)} className="btn-secondary">Cancel</button>
              <button disabled={loading} onClick={handleSaveWO} className="btn-primary flex items-center gap-2">
                {loading && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
