/**
 * ★ SCHEDULING ENGINE — schedulingEngine.js
 *
 * Multi-objective production scheduling optimizer.
 *
 * Objective function:
 *   Score = (W1 × revenue) - (W2 × failure_prob × downtime_cost) - (W3 × maintenance_cost)
 *
 * Constraints:
 *   1. Each job assigned to exactly one machine
 *   2. Machine type must match job requirement
 *   3. Machine capacity (hours/day) respected
 *   4. Job deadline satisfied
 *   5. At most one maintenance window per machine
 *   6. No time-slot conflicts on the same machine
 *   7. Jobs cannot be split (atomic scheduling)
 *
 * Algorithm: Greedy priority-queue with composite scoring.
 *   1. Score every valid (job, machine) pair
 *   2. Sort by score descending
 *   3. Greedily assign respecting constraints
 *   4. Collect deferred (unschedulable) jobs
 */

const mlBridgeService = require("./mlBridgeService");
const logger = require("../utils/logger");

// ─── Default weights ────────────────────────────────────────────────
const DEFAULT_WEIGHTS = {
  W1_revenue: 1.0,          // weight for revenue maximization
  W2_downtime_risk: 0.8,    // weight for downtime risk minimization
  W3_maintenance_cost: 0.5, // weight for maintenance cost minimization
};

const DEFAULT_COSTS = {
  downtime_cost_per_hour: 8000,  // ₹ per hour of unplanned downtime
};

/**
 * Run the scheduling optimizer.
 *
 * @param {Object} input
 * @param {Array}  input.jobs          - Jobs to schedule
 * @param {Array}  input.machines      - Available machines
 * @param {Object} [input.weights]     - Objective function weights
 * @param {Object} [input.costs]       - Cost parameters
 * @param {boolean}[input.fetchMlRisk] - Whether to call ML service for failure probs
 *
 * Job shape:
 *   { id, name, type, duration_hours, revenue, deadline (ISO), priority }
 *
 * Machine shape:
 *   { id, name, type, capacity_hours_per_day, maintenance_cost,
 *     maintenance_duration_hours, failure_probability?,
 *     sensor_data?: { operating_hours, temperature, vibration, ... } }
 */
exports.optimize = async (input) => {
  const startTime = Date.now();
  const { jobs, machines, fetchMlRisk = false } = input;
  const weights = { ...DEFAULT_WEIGHTS, ...input.weights };
  const costs = { ...DEFAULT_COSTS, ...input.costs };

  if (!jobs?.length) throw Object.assign(new Error("No jobs provided"), { statusCode: 400 });
  if (!machines?.length) throw Object.assign(new Error("No machines provided"), { statusCode: 400 });

  // ─── 1. Enrich machines with ML failure probability ────────────
  const enrichedMachines = await enrichMachineRisk(machines, fetchMlRisk);

  // ─── 2. Compute all valid (job, machine) assignment candidates──
  const candidates = [];
  for (const job of jobs) {
    for (const machine of enrichedMachines) {
      // Constraint: machine type must match
      if (machine.type !== job.type) continue;

      // Constraint: job fits within machine daily capacity
      if (job.duration_hours > machine.capacity_hours_per_day) continue;

      // Score this candidate
      const failureProb = machine.failure_probability || 0;
      const maintenanceCost = machine.maintenance_cost || 0;
      const downtimeRisk = failureProb * costs.downtime_cost_per_hour * job.duration_hours;

      const score =
        weights.W1_revenue * (job.revenue || 0) -
        weights.W2_downtime_risk * downtimeRisk -
        weights.W3_maintenance_cost * maintenanceCost;

      candidates.push({
        job,
        machine,
        score: round(score, 2),
        failure_probability: round(failureProb, 4),
        downtime_risk: round(downtimeRisk, 2),
      });
    }
  }

  // ─── 3. Sort by score descending (best assignments first) ─────
  candidates.sort((a, b) => {
    // Primary: score. Secondary: priority. Tertiary: deadline urgency.
    if (b.score !== a.score) return b.score - a.score;
    if ((b.job.priority || 0) !== (a.job.priority || 0)) return (b.job.priority || 0) - (a.job.priority || 0);
    return new Date(a.job.deadline || "9999") - new Date(b.job.deadline || "9999");
  });

  // ─── 4. Greedy assignment with constraint tracking ────────────
  const assignedJobs = new Set();               // job IDs already scheduled
  const machineSchedules = {};                   // machine.id → { used_hours, slots[], maintenance_scheduled }
  const schedule = [];                           // final assignments
  const deferredJobs = [];                       // jobs that couldn't be scheduled

  // Initialize machine state
  for (const machine of enrichedMachines) {
    machineSchedules[machine.id] = {
      used_hours: 0,
      available_hours: machine.capacity_hours_per_day,
      slots: [],
      maintenance_scheduled: false,
    };
  }

  for (const candidate of candidates) {
    const { job, machine, score, failure_probability, downtime_risk } = candidate;

    // Skip if job already assigned (constraint 1: each job → one machine)
    if (assignedJobs.has(job.id)) continue;

    const ms = machineSchedules[machine.id];

    // Constraint 3: capacity check
    if (ms.used_hours + job.duration_hours > ms.available_hours) continue;

    // Constraint 4: deadline check
    if (job.deadline) {
      const hoursUntilDeadline = (new Date(job.deadline) - new Date()) / (1000 * 60 * 60);
      if (hoursUntilDeadline < job.duration_hours) continue;
    }

    // Constraint 6: no time-slot conflict (sequential scheduling on each machine)
    const slotStart = ms.used_hours;
    const slotEnd = slotStart + job.duration_hours;

    // Constraint 5: schedule maintenance if risk is high and not yet scheduled
    let maintenanceWindow = null;
    if (failure_probability > 0.5 && !ms.maintenance_scheduled && machine.maintenance_duration_hours) {
      if (ms.used_hours + job.duration_hours + machine.maintenance_duration_hours <= ms.available_hours) {
        maintenanceWindow = {
          start_hour: slotEnd,
          end_hour: slotEnd + machine.maintenance_duration_hours,
          cost: machine.maintenance_cost || 0,
        };
        ms.maintenance_scheduled = true;
      }
    }

    // Assign the job
    assignedJobs.add(job.id);
    ms.used_hours = maintenanceWindow ? maintenanceWindow.end_hour : slotEnd;
    ms.slots.push({
      job_id: job.id,
      job_name: job.name,
      start_hour: slotStart,
      end_hour: slotEnd,
    });

    schedule.push({
      job_id: job.id,
      job_name: job.name,
      machine_id: machine.id,
      machine_name: machine.name,
      start_hour: slotStart,
      end_hour: slotEnd,
      duration_hours: job.duration_hours,
      revenue: job.revenue || 0,
      score,
      failure_probability,
      downtime_risk,
      maintenance_window: maintenanceWindow,
    });
  }

  // ─── 5. Identify deferred (unschedulable) jobs ────────────────
  for (const job of jobs) {
    if (!assignedJobs.has(job.id)) {
      const reasons = [];
      const typeMatch = enrichedMachines.some((m) => m.type === job.type);
      if (!typeMatch) reasons.push("No machine matches job type");

      const capacityMatch = enrichedMachines.some(
        (m) => m.type === job.type && machineSchedules[m.id].available_hours - machineSchedules[m.id].used_hours >= job.duration_hours
      );
      if (typeMatch && !capacityMatch) reasons.push("All matching machines at capacity");

      if (job.deadline) {
        const hoursUntilDeadline = (new Date(job.deadline) - new Date()) / (1000 * 60 * 60);
        if (hoursUntilDeadline < job.duration_hours) reasons.push("Deadline cannot be met");
      }

      if (!reasons.length) reasons.push("Lower priority than competing jobs");

      deferredJobs.push({
        job_id: job.id,
        job_name: job.name,
        type: job.type,
        duration_hours: job.duration_hours,
        revenue: job.revenue || 0,
        reasons,
      });
    }
  }

  // ─── 6. Compute summary metrics ───────────────────────────────
  const totalRevenue = schedule.reduce((sum, s) => sum + s.revenue, 0);
  const totalDowntimeRisk = schedule.reduce((sum, s) => sum + s.downtime_risk, 0);
  const totalMaintenanceCost = schedule.reduce(
    (sum, s) => sum + (s.maintenance_window?.cost || 0),
    0
  );
  const totalScheduledHours = schedule.reduce((sum, s) => sum + s.duration_hours, 0);
  const totalMaintenanceHours = schedule.reduce(
    (sum, s) => sum + (s.maintenance_window ? s.maintenance_window.end_hour - s.maintenance_window.start_hour : 0),
    0
  );
  const deferredRevenue = deferredJobs.reduce((sum, d) => sum + d.revenue, 0);

  // Machine utilization
  const machineUtilization = enrichedMachines.map((m) => {
    const ms = machineSchedules[m.id];
    return {
      machine_id: m.id,
      machine_name: m.name,
      type: m.type,
      capacity_hours: ms.available_hours,
      used_hours: round(ms.used_hours, 2),
      utilization_percent: round((ms.used_hours / ms.available_hours) * 100, 1),
      jobs_assigned: ms.slots.length,
      maintenance_scheduled: ms.maintenance_scheduled,
      failure_probability: round(m.failure_probability || 0, 4),
    };
  });

  // Risk summary
  const highRiskMachines = machineUtilization.filter((m) => m.failure_probability > 0.5);
  const avgFailureProb =
    machineUtilization.length > 0
      ? round(machineUtilization.reduce((sum, m) => sum + m.failure_probability, 0) / machineUtilization.length, 4)
      : 0;

  const executionTimeMs = Date.now() - startTime;

  logger.info("Scheduling engine completed", {
    scheduled: schedule.length,
    deferred: deferredJobs.length,
    totalRevenue,
    executionTimeMs,
  });

  return {
    optimized_schedule: schedule,
    deferred_jobs: deferredJobs,
    summary: {
      total_jobs: jobs.length,
      scheduled_jobs: schedule.length,
      deferred_jobs: deferredJobs.length,
      total_throughput_hours: round(totalScheduledHours, 2),
      total_downtime_hours: round(totalMaintenanceHours, 2),
      total_revenue: round(totalRevenue, 2),
      deferred_revenue: round(deferredRevenue, 2),
      total_downtime_risk_cost: round(totalDowntimeRisk, 2),
      total_maintenance_cost: round(totalMaintenanceCost, 2),
      net_projected_value: round(totalRevenue - totalDowntimeRisk - totalMaintenanceCost, 2),
    },
    risk_summary: {
      average_failure_probability: avgFailureProb,
      high_risk_machines: highRiskMachines.length,
      high_risk_details: highRiskMachines,
      machines_with_scheduled_maintenance: machineUtilization.filter((m) => m.maintenance_scheduled).length,
    },
    machine_utilization: machineUtilization,
    weights_used: weights,
    costs_used: costs,
    execution_time_ms: executionTimeMs,
  };
};

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Enrich machines with ML failure probabilities if sensor data is available.
 */
async function enrichMachineRisk(machines, fetchMlRisk) {
  if (!fetchMlRisk) return machines;

  const enriched = [];
  for (const machine of machines) {
    if (machine.sensor_data) {
      try {
        const prediction = await mlBridgeService.predictFailure({
          equipment_id: machine.id,
          ...machine.sensor_data,
        });
        enriched.push({
          ...machine,
          failure_probability: prediction.failure_probability,
          health_score: prediction.health_score,
          risk_level: prediction.risk_level,
        });
        continue;
      } catch (err) {
        logger.warn(`ML prediction failed for machine ${machine.id}, using provided value`, {
          error: err.message,
        });
      }
    }
    enriched.push(machine);
  }
  return enriched;
}

function round(value, decimals) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}
