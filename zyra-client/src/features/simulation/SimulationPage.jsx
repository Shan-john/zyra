import { useState, useEffect, useCallback } from "react";
import {
  FlaskConical, Zap, Clock, DollarSign, ShieldAlert,
  AlertTriangle, CheckCircle2, Info, RotateCcw, ChevronDown, ChevronUp
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";

// ─── Simulation math (mirrors the backend engine exactly) ────────────────────
function runSimulation(machine, costParams) {
  const {
    preventive_cost     = machine.maint_cost || 15000,
    corrective_cost     = machine.corrective  || 75000,
    maint_duration_hrs  = machine.maint_hrs   || 4,
    corrective_downtime = 24,
    failure_reduction   = 0.70,
    downtime_cost       = 8000,
    production_rate     = 5000,
  } = costParams;

  const fp      = machine.risk;
  const reduced = fp * (1 - failure_reduction);

  const A_downtime = maint_duration_hrs + reduced * corrective_downtime;
  const A_cost     = preventive_cost + reduced * corrective_cost + A_downtime * downtime_cost;
  const A_loss     = A_downtime * production_rate;

  const B_downtime = fp * corrective_downtime;
  const B_cost     = fp * corrective_cost + B_downtime * downtime_cost;
  const B_loss     = B_downtime * production_rate;

  const savings   = B_cost - A_cost;
  const dtSavings = B_downtime - A_downtime;
  const riskScore = fp > 0.5 ? 1 : fp > 0.25 ? 0.5 : 0;
  const decision  = 0.6 * (savings > 0 ? 1 : -1) + 0.3 * (dtSavings > 0 ? 1 : -1) + 0.1 * riskScore;
  const recA      = decision > 0;

  return {
    machine_id: machine.id,
    machine_name: machine.name,
    ml_prediction: {
      failure_probability:   fp,
      health_score:          Math.round((1 - fp) * 100),
      risk_level:            fp >= 0.7 ? "CRITICAL" : fp >= 0.45 ? "HIGH" : fp >= 0.2 ? "MEDIUM" : "LOW",
    },
    scenarios: {
      A: { name: "Immediate Maintenance", downtime: +A_downtime.toFixed(2), cost: Math.round(A_cost), loss: Math.round(A_loss), residual_fp: +(reduced * 100).toFixed(1) },
      B: { name: "Delay Maintenance",     downtime: +B_downtime.toFixed(2), cost: Math.round(B_cost), loss: Math.round(B_loss), residual_fp: +(fp * 100).toFixed(1) },
    },
    recommendation: recA ? "A" : "B",
    rationale: recA
      ? `Immediate maintenance saves ₹${Math.abs(savings).toLocaleString("en-IN")} and ${Math.abs(dtSavings).toFixed(1)}h of downtime. At ${(fp * 100).toFixed(0)}% failure risk, acting now is strongly recommended.`
      : `Failure probability is ${(fp * 100).toFixed(0)}%. Expected loss if failure occurs (₹${Math.round(B_cost).toLocaleString("en-IN")}) is lower than preventive cost. Re-assess in 2 weeks.`,
    cost_savings: Math.round(savings),
  };
}

// ─── 10 Machine fleet ─────────────────────────────────────────────────────────
const MACHINES = [
  { id: "M01", name: "Assembly Line A",     risk: 0.12, maint_cost: 12000, maint_hrs: 1.5, corrective: 60000  },
  { id: "M02", name: "Assembly Line B",     risk: 0.55, maint_cost: 14000, maint_hrs: 2.0, corrective: 70000  },
  { id: "M03", name: "CNC Machine #1",      risk: 0.30, maint_cost: 25000, maint_hrs: 2.0, corrective: 80000  },
  { id: "M04", name: "CNC Machine #2",      risk: 0.72, maint_cost: 22000, maint_hrs: 1.5, corrective: 90000  },
  { id: "M05", name: "Casting Station",     risk: 0.18, maint_cost: 35000, maint_hrs: 3.0, corrective: 100000 },
  { id: "M06", name: "Welding Bay Alpha",   risk: 0.40, maint_cost: 10000, maint_hrs: 1.0, corrective: 55000  },
  { id: "M07", name: "Hydraulic Press #1",  risk: 0.62, maint_cost: 20000, maint_hrs: 2.0, corrective: 85000  },
  { id: "M08", name: "Heat Treatment Oven", risk: 0.25, maint_cost: 18000, maint_hrs: 2.0, corrective: 72000  },
  { id: "M09", name: "Robotic Welding Arm", risk: 0.90, maint_cost: 35000, maint_hrs: 4.0, corrective: 150000 },
  { id: "M10", name: "Laser Cutting Unit",  risk: 0.20, maint_cost: 28000, maint_hrs: 1.5, corrective: 75000  },
];

const riskColor  = r => r >= 0.7 ? "#EF4444" : r >= 0.45 ? "#F59E0B" : r >= 0.2 ? "#6366F1" : "#10B981";
const riskLabel  = r => r >= 0.7 ? "CRITICAL" : r >= 0.45 ? "HIGH" : r >= 0.2 ? "MEDIUM" : "LOW";
const riskBg     = r => r >= 0.7 ? "bg-danger-100 text-danger-700" : r >= 0.45 ? "bg-warning-100 text-warning-700" : r >= 0.2 ? "bg-primary-100 text-primary-700" : "bg-success-100 text-success-700";
const Fmt        = n => `₹${Number(n).toLocaleString("en-IN")}`;

const DEFAULT_PARAMS = {
  preventive_cost: "", corrective_cost: "",
  maint_duration_hrs: "", corrective_downtime: 24,
  failure_reduction: 0.70, downtime_cost: 8000, production_rate: 5000,
};

export default function SimulationPage() {
  const [selected, setSelected]     = useState(MACHINES[3]); // M04 (high risk) as default
  const [simResult, setSimResult]   = useState(null);
  const [running, setRunning]       = useState(false);
  const [paramsOpen, setParamsOpen] = useState(false);
  const [costParams, setCostParams] = useState(DEFAULT_PARAMS);

  // Auto-run whenever selected machine or cost params change
  const autoRun = useCallback((machine, params) => {
    setRunning(true);
    // Merge defaults from machine into params for blank fields
    const resolved = {
      preventive_cost:     params.preventive_cost     || machine.maint_cost,
      corrective_cost:     params.corrective_cost     || machine.corrective,
      maint_duration_hrs:  params.maint_duration_hrs  || machine.maint_hrs,
      corrective_downtime: params.corrective_downtime || 24,
      failure_reduction:   Number(params.failure_reduction) || 0.70,
      downtime_cost:       params.downtime_cost || 8000,
      production_rate:     params.production_rate || 5000,
    };
    setTimeout(() => {
      setSimResult(runSimulation(machine, resolved));
      setRunning(false);
    }, 400);
  }, []);

  // Run on first render + whenever selected changes
  useEffect(() => {
    autoRun(selected, costParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const handleParamChange = (key, val) => {
    const next = { ...costParams, [key]: val };
    setCostParams(next);
  };

  const reRunWithParams = () => autoRun(selected, costParams);
  const resetParams     = () => { setCostParams(DEFAULT_PARAMS); autoRun(selected, DEFAULT_PARAMS); };

  const chartData = simResult ? [
    { label: "Total Cost",       A: simResult.scenarios.A.cost,     B: simResult.scenarios.B.cost     },
    { label: "Downtime Hrs",     A: simResult.scenarios.A.downtime * 10000, B: simResult.scenarios.B.downtime * 10000 },
    { label: "Production Loss",  A: simResult.scenarios.A.loss,     B: simResult.scenarios.B.loss     },
  ] : [];

  const recS = simResult ? simResult.scenarios[simResult.recommendation] : null;
  const fp   = selected.risk;

  return (
    <div className="space-y-6 pb-12">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md">
          <FlaskConical size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Maintenance Simulation Engine</h1>
          <p className="text-surface-600 mt-1">Click any machine below to instantly compare Scenario A (Immediate) vs Scenario B (Delay).</p>
        </div>
      </div>

      {/* ─── Machine Grid ───────────────────────────────────────── */}
      <div className="card">
        <h2 className="text-sm font-semibold text-surface-700 uppercase tracking-wider mb-4">
          Factory Floor — Click a Machine to Simulate
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {MACHINES.map(m => {
            const isActive  = selected.id === m.id;
            const riskPct   = Math.round(m.risk * 100);
            return (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={`p-3 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${isActive ? "border-indigo-500 bg-indigo-50 shadow-md" : "border-surface-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"}`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isActive ? "bg-indigo-200 text-indigo-800" : "bg-surface-100 text-surface-500"}`}>{m.id}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${riskBg(m.risk)}`}>{riskLabel(m.risk)}</span>
                </div>
                <div className="text-xs font-semibold text-surface-800 leading-tight mt-1">{m.name}</div>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${riskPct}%`, background: riskColor(m.risk) }} />
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: riskColor(m.risk) }}>{riskPct}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Loading spinner ────────────────────────────────────── */}
      {running && (
        <div className="card flex items-center justify-center gap-3 py-12 text-indigo-600">
          <span className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
          <span className="font-semibold text-sm">Running simulation for {selected.name}…</span>
        </div>
      )}

      {/* ─── Results ─────────────────────────────────────────────── */}
      {simResult && !running && (
        <div className="space-y-5">
          {/* Machine summary strip */}
          <div className="grid grid-cols-4 gap-3">
            <div className="card text-center py-3 border-l-4" style={{ borderColor: riskColor(fp) }}>
              <div className="text-xl font-bold" style={{ color: riskColor(fp) }}>{Math.round(fp * 100)}%</div>
              <div className="text-xs text-surface-500 mt-0.5">Failure Risk</div>
            </div>
            <div className="card text-center py-3 border-l-4 border-indigo-400">
              <div className="text-xl font-bold text-indigo-700">{simResult.ml_prediction.health_score}/100</div>
              <div className="text-xs text-surface-500 mt-0.5">Health Score</div>
            </div>
            <div className="card text-center py-3 border-l-4 border-success-400">
              <div className="text-xl font-bold text-success-600">{Fmt(simResult.scenarios.A.cost)}</div>
              <div className="text-xs text-surface-500 mt-0.5">Scenario A Cost</div>
            </div>
            <div className="card text-center py-3 border-l-4 border-warning-400">
              <div className="text-xl font-bold text-warning-600">{Fmt(simResult.scenarios.B.cost)}</div>
              <div className="text-xs text-surface-500 mt-0.5">Scenario B Cost</div>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className={`rounded-xl p-5 border-2 flex items-start gap-4 ${simResult.recommendation === "A" ? "bg-danger-50 border-danger-300" : "bg-success-50 border-success-300"}`}>
            {simResult.recommendation === "A"
              ? <AlertTriangle size={28} className="text-danger-500 shrink-0 mt-0.5" />
              : <CheckCircle2 size={28} className="text-success-500 shrink-0 mt-0.5" />}
            <div>
              <div className={`text-base font-extrabold ${simResult.recommendation === "A" ? "text-danger-800" : "text-success-800"}`}>
                🤖 AI Recommends → Scenario {simResult.recommendation}: {recS.name}
              </div>
              <p className="text-sm mt-1 text-surface-700 leading-relaxed">{simResult.rationale}</p>
              {simResult.cost_savings > 0 && (
                <span className="mt-2 inline-block text-xs font-bold bg-white/80 px-3 py-1 rounded-full border border-surface-200">
                  💰 Estimated Savings: {Fmt(simResult.cost_savings)}
                </span>
              )}
            </div>
          </div>

          {/* Scenario Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[["A", "🔵 Scenario A — Immediate Maintenance", "indigo"], ["B", "🟡 Scenario B — Delay Maintenance", "amber"]].map(([key, title, color]) => {
              const s = simResult.scenarios[key];
              const isRec = simResult.recommendation === key;
              return (
                <div key={key} className={`card space-y-4 ${isRec ? "ring-2 ring-indigo-400 border-indigo-200" : ""}`}>
                  <div className="flex justify-between items-start">
                    <h3 className="text-sm font-bold text-surface-900">{title}</h3>
                    {isRec && <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium">✓ Recommended</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Total Cost",       Fmt(s.cost),           <DollarSign size={14} className="text-danger-500" />],
                      ["Downtime",         `${s.downtime}h`,      <Clock size={14} className="text-warning-500" />],
                      ["Production Loss",  Fmt(s.loss),           <Zap size={14} className="text-orange-500" />],
                      ["Residual Risk",    `${s.residual_fp}%`,   <ShieldAlert size={14} className="text-primary-500" />],
                    ].map(([label, val, icon]) => (
                      <div key={label} className="bg-surface-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 text-xs text-surface-500 mb-1">{icon}{label}</div>
                        <div className="text-base font-extrabold text-surface-900">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="card">
            <h3 className="text-sm font-semibold text-surface-900 mb-5 flex items-center gap-2">
              <Info size={16} className="text-indigo-500" /> Scenario A vs B — Cost Comparison
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={v => v >= 10000 ? `₹${(v/1000).toFixed(0)}k` : v} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v, n) => [n === "Downtime Hrs" ? `${(v/10000).toFixed(2)}h` : Fmt(v), n]} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="A" name="Scenario A (Immediate)" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="B" name="Scenario B (Delay)"     fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ─── Advanced Cost Parameters (collapsible) ─── */}
          <div className="card">
            <button onClick={() => setParamsOpen(p => !p)} className="w-full flex justify-between items-center text-sm font-semibold text-surface-700 hover:text-surface-900">
              <span className="flex items-center gap-2"><ShieldAlert size={16} className="text-indigo-500" /> Advanced Cost Parameters (Override defaults)</span>
              {paramsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {paramsOpen && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  ["Preventive Cost (₹)", "preventive_cost", selected.maint_cost],
                  ["Corrective Cost (₹)", "corrective_cost", selected.corrective],
                  ["Maint. Duration (hrs)", "maint_duration_hrs", selected.maint_hrs],
                  ["Corrective Downtime (hrs)", "corrective_downtime", 24],
                  ["Downtime Cost/hr (₹)", "downtime_cost", 8000],
                  ["Production Rate/hr (₹)", "production_rate", 5000],
                ].map(([label, key, placeholder]) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-surface-700 mb-1">{label}</label>
                    <input type="number" placeholder={`Default: ${placeholder}`} value={costParams[key]} onChange={e => handleParamChange(key, e.target.value)}
                      className="input-field w-full text-sm" />
                  </div>
                ))}
                <div className="col-span-full">
                  <label className="block text-xs font-semibold text-surface-700 mb-1">
                    Risk Reduction Factor: <span className="text-indigo-600">{Math.round(Number(costParams.failure_reduction) * 100)}%</span>
                  </label>
                  <input type="range" min="0.4" max="0.95" step="0.05" value={costParams.failure_reduction}
                    onChange={e => handleParamChange("failure_reduction", e.target.value)} className="w-full accent-indigo-600" />
                </div>
                <div className="col-span-full flex gap-3">
                  <button onClick={reRunWithParams} className="btn-primary flex items-center gap-2 text-sm"><Zap size={14} />Re-run with Custom Params</button>
                  <button onClick={resetParams} className="btn-secondary flex items-center gap-2 text-sm"><RotateCcw size={14} />Reset to Defaults</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
