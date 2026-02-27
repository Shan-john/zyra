/**
 * ★ SCHEDULE OPTIMIZE (Weight-Driven) — scheduleOptimizeService.js
 *
 * A lightweight, real-time scheduling endpoint designed for the
 * interactive dashboard. Accepts only 3 weights and immediately
 * recalculates the schedule + KPIs using a sample factory dataset.
 *
 * POST /api/schedule/optimize
 * Body: { throughputWeight, downtimeWeight, maintenanceWeight }
 *
 * On every call:
 *   1. Maps weights → objective function
 *   2. Scores all (job, machine) pairs
 *   3. Greedy-assigns with full constraint enforcement
 *   4. Computes updated KPIs
 *   5. Returns schedule + KPIs in <50ms
 */

const logger = require("../utils/logger");

// ─── Sample Factory Data (used when no live DB data) ─────────────────

const SAMPLE_JOBS = [
  { id: "J001", name: "Steel Frame Assembly",    type: "assembly",  duration_hours: 3, revenue: 45000, priority: 5, deadline: null },
  { id: "J002", name: "CNC Shaft Machining",     type: "cnc",       duration_hours: 2, revenue: 32000, priority: 4, deadline: null },
  { id: "J003", name: "Circuit Board Soldering",  type: "assembly",  duration_hours: 1.5, revenue: 18000, priority: 3, deadline: null },
  { id: "J004", name: "Precision Gear Cutting",   type: "cnc",       duration_hours: 4, revenue: 56000, priority: 5, deadline: null },
  { id: "J005", name: "Aluminum Die Casting",     type: "casting",   duration_hours: 5, revenue: 68000, priority: 4, deadline: null },
  { id: "J006", name: "Weld Joint Fabrication",   type: "welding",   duration_hours: 2.5, revenue: 28000, priority: 3, deadline: null },
  { id: "J007", name: "Motor Assembly",           type: "assembly",  duration_hours: 2, revenue: 35000, priority: 4, deadline: null },
  { id: "J008", name: "Hydraulic Press Forming",  type: "pressing",  duration_hours: 3, revenue: 42000, priority: 3, deadline: null },
  { id: "J009", name: "Surface Heat Treatment",   type: "furnace",   duration_hours: 6, revenue: 52000, priority: 2, deadline: null },
  { id: "J010", name: "Final QC & Packaging",     type: "assembly",  duration_hours: 1, revenue: 12000, priority: 2, deadline: null },
  { id: "J011", name: "Titanium Rod Turning",     type: "cnc",       duration_hours: 3, revenue: 48000, priority: 5, deadline: null },
  { id: "J012", name: "Spot Welding Panel",       type: "welding",   duration_hours: 2, revenue: 22000, priority: 3, deadline: null },
];

const SAMPLE_MACHINES = [
  { id: "M01", name: "Assembly Line A",     type: "assembly",  capacity_hours_per_day: 8, maintenance_cost: 12000, maintenance_duration_hours: 1.5, failure_probability: 0.12 },
  { id: "M02", name: "Assembly Line B",     type: "assembly",  capacity_hours_per_day: 8, maintenance_cost: 14000, maintenance_duration_hours: 2,   failure_probability: 0.55 },
  { id: "M03", name: "CNC Machine #1",      type: "cnc",       capacity_hours_per_day: 10, maintenance_cost: 25000, maintenance_duration_hours: 2,  failure_probability: 0.30 },
  { id: "M04", name: "CNC Machine #2",      type: "cnc",       capacity_hours_per_day: 10, maintenance_cost: 22000, maintenance_duration_hours: 1.5, failure_probability: 0.72 },
  { id: "M05", name: "Casting Station",     type: "casting",   capacity_hours_per_day: 12, maintenance_cost: 35000, maintenance_duration_hours: 3,  failure_probability: 0.18 },
  { id: "M06", name: "Welding Bay Alpha",   type: "welding",   capacity_hours_per_day: 8,  maintenance_cost: 10000, maintenance_duration_hours: 1,  failure_probability: 0.40 },
  { id: "M07", name: "Hydraulic Press #1",  type: "pressing",  capacity_hours_per_day: 8,  maintenance_cost: 20000, maintenance_duration_hours: 2,  failure_probability: 0.62 },
  { id: "M08", name: "Heat Treatment Oven", type: "furnace",   capacity_hours_per_day: 16, maintenance_cost: 18000, maintenance_duration_hours: 2,  failure_probability: 0.25 },
];

const DOWNTIME_COST_PER_HOUR = 8000;

/**
 * Run real-time schedule optimization with user-supplied weights.
 *
 * @param {Object} params
 * @param {number} params.throughputWeight    - W1 (revenue importance)
 * @param {number} params.downtimeWeight      - W2 (risk importance)
 * @param {number} params.maintenanceWeight   - W3 (cost importance)
 * @returns {Object} Schedule + KPIs
 */
exports.optimize = ({ throughputWeight = 1, downtimeWeight = 0.8, maintenanceWeight = 0.5 }) => {
  const startTime = performance.now();

  // Normalize weights to 0–1 range
  const maxW = Math.max(throughputWeight, downtimeWeight, maintenanceWeight, 1);
  const W1 = throughputWeight / maxW;
  const W2 = downtimeWeight / maxW;
  const W3 = maintenanceWeight / maxW;

  const jobs = SAMPLE_JOBS;
  const machines = SAMPLE_MACHINES;

  // ─── 1. Score all valid (job, machine) candidates ──────────────
  const candidates = [];
  for (const job of jobs) {
    for (const machine of machines) {
      if (machine.type !== job.type) continue;
      if (job.duration_hours > machine.capacity_hours_per_day) continue;

      const fp = machine.failure_probability;
      const downtimeRisk = fp * DOWNTIME_COST_PER_HOUR * job.duration_hours;
      const mCost = machine.maintenance_cost;

      const score = W1 * job.revenue - W2 * downtimeRisk - W3 * mCost;

      candidates.push({ job, machine, score: r(score), fp, downtimeRisk: r(downtimeRisk) });
    }
  }

  // Sort by score desc → priority desc
  candidates.sort((a, b) =>
    b.score !== a.score ? b.score - a.score : (b.job.priority || 0) - (a.job.priority || 0)
  );

  // ─── 2. Greedy assign with constraints ─────────────────────────
  const assigned = new Set();
  const machState = {};
  for (const m of machines) {
    machState[m.id] = { used: 0, cap: m.capacity_hours_per_day, slots: [], maintDone: false };
  }

  const schedule = [];
  for (const c of candidates) {
    if (assigned.has(c.job.id)) continue;
    const ms = machState[c.machine.id];
    if (ms.used + c.job.duration_hours > ms.cap) continue;

    const slotStart = ms.used;
    const slotEnd = slotStart + c.job.duration_hours;

    // Auto-maintenance for high-risk machines
    let maint = null;
    if (c.fp > 0.5 && !ms.maintDone && c.machine.maintenance_duration_hours) {
      if (slotEnd + c.machine.maintenance_duration_hours <= ms.cap) {
        maint = {
          start_hour: slotEnd,
          end_hour: slotEnd + c.machine.maintenance_duration_hours,
          cost: c.machine.maintenance_cost,
        };
        ms.maintDone = true;
      }
    }

    assigned.add(c.job.id);
    ms.used = maint ? maint.end_hour : slotEnd;
    ms.slots.push(c.job.id);

    schedule.push({
      job_id: c.job.id,
      job_name: c.job.name,
      machine_id: c.machine.id,
      machine_name: c.machine.name,
      start_hour: slotStart,
      end_hour: slotEnd,
      duration_hours: c.job.duration_hours,
      revenue: c.job.revenue,
      score: c.score,
      failure_probability: r(c.fp, 4),
      downtime_risk: c.downtimeRisk,
      maintenance_window: maint,
    });
  }

  // ─── 3. Deferred jobs ──────────────────────────────────────────
  const deferred = jobs
    .filter((j) => !assigned.has(j.id))
    .map((j) => ({
      job_id: j.id,
      job_name: j.name,
      revenue_lost: j.revenue,
      reason: machines.some((m) => m.type === j.type) ? "Machines at capacity" : "No matching machine type",
    }));

  // ─── 4. KPIs ──────────────────────────────────────────────────
  const totalRevenue = schedule.reduce((s, x) => s + x.revenue, 0);
  const totalDowntimeRisk = schedule.reduce((s, x) => s + x.downtime_risk, 0);
  const totalMaintenanceCost = schedule.reduce((s, x) => s + (x.maintenance_window?.cost || 0), 0);
  const totalProductionHours = schedule.reduce((s, x) => s + x.duration_hours, 0);
  const totalMaintenanceHours = schedule.reduce(
    (s, x) => s + (x.maintenance_window ? x.maintenance_window.end_hour - x.maintenance_window.start_hour : 0),
    0
  );
  const deferredRevenue = deferred.reduce((s, x) => s + x.revenue_lost, 0);

  // Machine utilization
  const utilization = machines.map((m) => {
    const ms = machState[m.id];
    return {
      machine_id: m.id,
      machine_name: m.name,
      type: m.type,
      capacity_hours: ms.cap,
      used_hours: r(ms.used),
      utilization_pct: r((ms.used / ms.cap) * 100, 1),
      jobs_count: ms.slots.length,
      maintenance_scheduled: ms.maintDone,
      failure_probability: r(m.failure_probability, 4),
    };
  });

  const avgUtilization = r(
    utilization.reduce((s, u) => s + u.utilization_pct, 0) / utilization.length,
    1
  );

  const executionMs = r(performance.now() - startTime, 2);

  return {
    schedule,
    deferred_jobs: deferred,
    kpis: {
      total_revenue: totalRevenue,
      total_downtime_risk_cost: r(totalDowntimeRisk),
      total_maintenance_cost: totalMaintenanceCost,
      net_value: r(totalRevenue - totalDowntimeRisk - totalMaintenanceCost),
      total_production_hours: r(totalProductionHours),
      total_downtime_hours: r(totalMaintenanceHours),
      scheduled_jobs: schedule.length,
      deferred_jobs: deferred.length,
      deferred_revenue: deferredRevenue,
      avg_utilization_pct: avgUtilization,
    },
    risk_summary: {
      high_risk_machines: utilization.filter((u) => u.failure_probability > 0.5).length,
      machines_with_maintenance: utilization.filter((u) => u.maintenance_scheduled).length,
      avg_failure_probability: r(
        utilization.reduce((s, u) => s + u.failure_probability, 0) / utilization.length,
        4
      ),
    },
    machine_utilization: utilization,
    weights_applied: { throughputWeight: W1, downtimeWeight: W2, maintenanceWeight: W3 },
    execution_time_ms: executionMs,
  };
};

function r(v, d = 2) {
  return Math.round(v * 10 ** d) / 10 ** d;
}
