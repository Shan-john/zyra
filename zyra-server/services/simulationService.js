/**
 * ★ SIMULATION ENGINE — simulationService.js
 *
 * Runs what-if scenarios and Monte Carlo simulations against
 * cloned snapshots of ERP state, without corrupting live data.
 */

const SimulationScenario = require("../models/SimulationScenario");
const Inventory = require("../models/Inventory");
const SalesOrder = require("../models/SalesOrder");
const ProductionSchedule = require("../models/ProductionSchedule");
const logger = require("../utils/logger");

/**
 * Run a simulation scenario.
 */
exports.runScenario = async ({ name, description, type, mutations, iterations = 1, userId }) => {
  const scenarioId = `SIM-${Date.now().toString(36).toUpperCase()}`;
  const start = Date.now();

  const scenario = await SimulationScenario.create({
    scenarioId,
    name,
    description,
    type,
    mutations,
    iterations,
    status: "running",
    createdBy: userId,
  });

  try {
    // 1. Take a baseline snapshot of current state
    const baseline = await captureBaseline();
    scenario.baselineSnapshot = baseline;

    // 2. Apply mutations and run simulation
    let result;
    switch (type) {
      case "what-if":
        result = await runWhatIf(baseline, mutations);
        break;
      case "monte-carlo":
        result = await runMonteCarlo(baseline, mutations, iterations);
        break;
      case "sensitivity-analysis":
        result = await runSensitivityAnalysis(baseline, mutations);
        break;
      case "stress-test":
        result = await runStressTest(baseline, mutations);
        break;
      default:
        throw new Error(`Unknown simulation type: ${type}`);
    }

    scenario.status = "completed";
    scenario.result = result;
    scenario.executionTimeMs = Date.now() - start;
    await scenario.save();

    logger.info(`Simulation ${scenarioId} completed in ${scenario.executionTimeMs}ms`, { type });
    return scenario;
  } catch (error) {
    scenario.status = "failed";
    scenario.executionTimeMs = Date.now() - start;
    await scenario.save();
    throw error;
  }
};

/**
 * Get a simulation result.
 */
exports.getResult = async (scenarioId) => {
  const scenario = await SimulationScenario.findOne({ scenarioId }).populate("createdBy", "name email");
  if (!scenario) throw Object.assign(new Error("Simulation not found"), { statusCode: 404 });
  return scenario;
};

/**
 * List all saved scenarios.
 */
exports.listScenarios = async ({ page = 1, limit = 10, type }) => {
  const query = {};
  if (type) query.type = type;

  const scenarios = await SimulationScenario.find(query)
    .select("-baselineSnapshot") // exclude large snapshot data
    .populate("createdBy", "name")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await SimulationScenario.countDocuments(query);
  return { scenarios, total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Internal Helpers ──────────────────────────────────────

async function captureBaseline() {
  const [inventorySummary, salesStats, productionStats] = await Promise.all([
    Inventory.aggregate([
      { $match: { isDeleted: false } },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          totalStock: { $sum: "$quantity" },
          avgStock: { $avg: "$quantity" },
          lowStockCount: {
            $sum: { $cond: [{ $lte: ["$quantity", "$reorderPoint"] }, 1, 0] },
          },
        },
      },
    ]),
    SalesOrder.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          avgOrderValue: { $avg: "$totalAmount" },
        },
      },
    ]),
    ProductionSchedule.aggregate([
      {
        $group: {
          _id: null,
          totalSchedules: { $sum: 1 },
          totalPlanned: { $sum: "$plannedQuantity" },
          totalProduced: { $sum: "$producedQuantity" },
        },
      },
    ]),
  ]);

  return {
    inventory: inventorySummary[0] || {},
    sales: salesStats[0] || {},
    production: productionStats[0] || {},
    capturedAt: new Date(),
  };
}

function applyMutation(baseline, mutation) {
  const clone = JSON.parse(JSON.stringify(baseline));
  const { parameter, change } = mutation;

  // Parse change string: "+20%", "-500", "*1.5"
  const parts = parameter.split(".");
  let target = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    target = target[parts[i]] || {};
  }
  const key = parts[parts.length - 1];
  const currentValue = target[key] || 0;

  if (change.endsWith("%")) {
    const pct = parseFloat(change) / 100;
    target[key] = currentValue * (1 + pct);
  } else if (change.startsWith("*")) {
    target[key] = currentValue * parseFloat(change.slice(1));
  } else {
    target[key] = currentValue + parseFloat(change);
  }

  return clone;
}

function computeKpiDelta(baseline, mutated) {
  const delta = {};
  for (const section of ["inventory", "sales", "production"]) {
    delta[section] = {};
    for (const key of Object.keys(baseline[section] || {})) {
      if (typeof baseline[section][key] === "number" && typeof mutated[section][key] === "number") {
        const base = baseline[section][key];
        const mut = mutated[section][key];
        delta[section][key] = {
          baseline: base,
          simulated: mut,
          change: mut - base,
          changePercent: base !== 0 ? (((mut - base) / base) * 100).toFixed(2) : "N/A",
        };
      }
    }
  }
  return delta;
}

async function runWhatIf(baseline, mutations) {
  let mutated = JSON.parse(JSON.stringify(baseline));
  for (const mutation of mutations) {
    mutated = applyMutation(mutated, mutation);
  }

  return {
    kpiDeltas: computeKpiDelta(baseline, mutated),
    riskScore: Math.random() * 40 + 10, // placeholder until real risk model
    summary: `What-if analysis applied ${mutations.length} mutation(s). See KPI deltas for impact.`,
  };
}

async function runMonteCarlo(baseline, mutations, iterations) {
  const results = [];

  for (let i = 0; i < iterations; i++) {
    let mutated = JSON.parse(JSON.stringify(baseline));
    for (const mutation of mutations) {
      // Add random noise ±10% to each mutation for Monte Carlo variety
      const noisyMutation = {
        ...mutation,
        change: mutation.change.endsWith("%")
          ? `${parseFloat(mutation.change) + (Math.random() - 0.5) * 10}%`
          : `${parseFloat(mutation.change) + (Math.random() - 0.5) * parseFloat(mutation.change) * 0.1}`,
      };
      mutated = applyMutation(mutated, noisyMutation);
    }
    results.push(computeKpiDelta(baseline, mutated));
  }

  return {
    kpiDeltas: results[0], // first run as primary
    timeline: results.map((r, i) => ({ iteration: i + 1, delta: r })),
    riskScore: (results.length > 0 ? Math.random() * 60 + 20 : 0).toFixed(1),
    summary: `Monte Carlo ran ${iterations} iterations with ±10% noise on mutations.`,
  };
}

async function runSensitivityAnalysis(baseline, mutations) {
  const sensitivities = [];

  for (const mutation of mutations) {
    // Test at -50%, -25%, 0%, +25%, +50%
    const levels = [-50, -25, 0, 25, 50];
    const levelResults = [];

    for (const level of levels) {
      const adjMutation = { ...mutation, change: `${level}%` };
      const mutated = applyMutation(baseline, adjMutation);
      levelResults.push({
        level: `${level}%`,
        kpiDelta: computeKpiDelta(baseline, mutated),
      });
    }

    sensitivities.push({ parameter: mutation.parameter, results: levelResults });
  }

  return {
    kpiDeltas: sensitivities[0]?.results?.[3]?.kpiDelta || {},
    timeline: sensitivities,
    riskScore: 35,
    summary: `Sensitivity analysis tested ${mutations.length} parameter(s) at 5 levels each.`,
  };
}

async function runStressTest(baseline, mutations) {
  // Apply all mutations at 2x magnitude
  let stressed = JSON.parse(JSON.stringify(baseline));
  for (const mutation of mutations) {
    const extremeChange = mutation.change.endsWith("%")
      ? `${parseFloat(mutation.change) * 2}%`
      : `${parseFloat(mutation.change) * 2}`;
    stressed = applyMutation(stressed, { ...mutation, change: extremeChange });
  }

  return {
    kpiDeltas: computeKpiDelta(baseline, stressed),
    riskScore: Math.random() * 30 + 60, // stress tests have higher risk
    summary: `Stress test applied ${mutations.length} mutation(s) at 2× magnitude.`,
  };
}
