/**
 * ★ MAINTENANCE SIMULATION ENGINE — maintenanceSimulationEngine.js
 *
 * Compares two maintenance scenarios using ML failure predictions:
 *
 *   Scenario A: Immediate Maintenance
 *     - Incurs preventive maintenance cost + downtime
 *     - Reduces failure probability by 70%
 *
 *   Scenario B: Delayed Maintenance
 *     - No immediate cost
 *     - Expected failure risk cost = failure_probability × corrective_cost
 *     - Expected downtime = failure_probability × downtime_hours
 *
 * Returns projected_downtime_hours, projected_production_loss,
 * projected_total_cost, and a weighted recommendation.
 */

const mlBridgeService = require("./mlBridgeService");
const logger = require("../utils/logger");

// ─── Default cost parameters (can be overridden per-request) ─────────
const DEFAULTS = {
  preventive_maintenance_cost: 15000,       // ₹ cost of scheduled maintenance
  corrective_maintenance_cost: 75000,       // ₹ cost of emergency repair
  maintenance_duration_hours: 4,            // hours of planned downtime
  corrective_downtime_hours: 24,            // hours if failure occurs
  production_rate_per_hour: 5000,           // ₹ revenue generated per hour
  downtime_cost_per_hour: 8000,             // ₹ cost per downtime hour (labor + overhead)
  failure_reduction_factor: 0.70,           // 70% reduction after preventive maintenance
};

/**
 * Run the maintenance simulation.
 * @param {Object} params
 * @param {Object} params.equipment     - Equipment sensor data for ML prediction
 * @param {Object} [params.costParams]  - Optional cost overrides
 * @returns {Object} Comparison of Scenario A vs B with recommendation
 */
exports.runSimulation = async ({ equipment, costParams = {} }) => {
  const params = { ...DEFAULTS, ...costParams };
  const startTime = Date.now();

  // ─── 1. Get ML failure prediction ──────────────────────────────
  let mlPrediction;
  try {
    mlPrediction = await mlBridgeService.predictFailure(equipment);
  } catch (error) {
    logger.error("ML prediction failed in simulation engine", { error: error.message });
    throw Object.assign(
      new Error("Could not fetch ML prediction. Ensure the ML service is running."),
      { statusCode: 503 }
    );
  }

  const failureProbability = mlPrediction.failure_probability;
  const healthScore = mlPrediction.health_score;
  const riskLevel = mlPrediction.risk_level;

  // ─── 2. Scenario A: Immediate Maintenance ─────────────────────
  const reducedFailureProb = failureProbability * (1 - params.failure_reduction_factor);

  const scenarioA = {
    name: "Immediate Preventive Maintenance",
    maintenance_cost: params.preventive_maintenance_cost,
    planned_downtime_hours: params.maintenance_duration_hours,
    residual_failure_probability: round(reducedFailureProb, 4),

    // Downtime: planned maintenance + residual risk-based failure downtime
    projected_downtime_hours: round(
      params.maintenance_duration_hours +
      reducedFailureProb * params.corrective_downtime_hours,
      2
    ),

    // Production loss from total downtime
    projected_production_loss: 0, // calculated below
    
    // Total cost: maintenance + residual failure risk + downtime costs
    projected_total_cost: 0, // calculated below
  };

  scenarioA.projected_production_loss = round(
    scenarioA.projected_downtime_hours * params.production_rate_per_hour,
    2
  );

  scenarioA.projected_total_cost = round(
    params.preventive_maintenance_cost +
    reducedFailureProb * params.corrective_maintenance_cost +
    scenarioA.projected_downtime_hours * params.downtime_cost_per_hour,
    2
  );

  // ─── 3. Scenario B: Delayed Maintenance ───────────────────────
  const scenarioB = {
    name: "Delayed / No Maintenance",
    maintenance_cost: 0,
    planned_downtime_hours: 0,
    residual_failure_probability: round(failureProbability, 4),

    // Expected downtime from failure only
    projected_downtime_hours: round(
      failureProbability * params.corrective_downtime_hours,
      2
    ),

    projected_production_loss: 0,
    projected_total_cost: 0,
  };

  scenarioB.projected_production_loss = round(
    scenarioB.projected_downtime_hours * params.production_rate_per_hour,
    2
  );

  scenarioB.projected_total_cost = round(
    failureProbability * params.corrective_maintenance_cost +
    scenarioB.projected_downtime_hours * params.downtime_cost_per_hour,
    2
  );

  // ─── 4. Weighted Recommendation ───────────────────────────────
  const costSavings = scenarioB.projected_total_cost - scenarioA.projected_total_cost;
  const downtimeSavings = scenarioB.projected_downtime_hours - scenarioA.projected_downtime_hours;

  // Weighted decision score (higher = favor immediate maintenance)
  // Cost weight: 60%, Downtime weight: 30%, Risk weight: 10%
  const costScore = costSavings > 0 ? 1 : costSavings < 0 ? -1 : 0;
  const downtimeScore = downtimeSavings > 0 ? 1 : downtimeSavings < 0 ? -1 : 0;
  const riskScore = failureProbability > 0.5 ? 1 : failureProbability > 0.25 ? 0.5 : 0;
  const decisionScore = 0.6 * costScore + 0.3 * downtimeScore + 0.1 * riskScore;

  let recommendation;
  let rationale;

  if (decisionScore > 0) {
    recommendation = "Scenario A: Immediate Maintenance";
    rationale = `Immediate maintenance saves ₹${Math.abs(costSavings).toLocaleString("en-IN")} in projected costs and ${Math.abs(downtimeSavings).toFixed(1)}h of downtime. With a failure probability of ${(failureProbability * 100).toFixed(1)}%, the risk of delaying outweighs the upfront maintenance cost.`;
  } else if (decisionScore < 0) {
    recommendation = "Scenario B: Delay Maintenance";
    rationale = `With a low failure probability of ${(failureProbability * 100).toFixed(1)}%, the expected failure cost (₹${scenarioB.projected_total_cost.toLocaleString("en-IN")}) is lower than the preventive maintenance cost. Schedule a re-assessment in 2 weeks.`;
  } else {
    recommendation = "Borderline — schedule inspection within 1 week";
    rationale = `Costs are comparable between both scenarios. Failure probability is ${(failureProbability * 100).toFixed(1)}%. Recommend a physical inspection before committing to full maintenance.`;
  }

  const executionTimeMs = Date.now() - startTime;

  logger.info("Maintenance simulation completed", {
    equipment_id: equipment.equipment_id,
    recommendation,
    executionTimeMs,
  });

  return {
    equipment_id: equipment.equipment_id,
    ml_prediction: {
      failure_probability: failureProbability,
      health_score: healthScore,
      risk_level: riskLevel,
    },
    scenarios: {
      immediate_maintenance: scenarioA,
      delayed_maintenance: scenarioB,
    },
    comparison: {
      cost_difference: round(costSavings, 2),
      cost_difference_label: costSavings > 0
        ? `Immediate maintenance saves ₹${costSavings.toLocaleString("en-IN")}`
        : `Delayed is cheaper by ₹${Math.abs(costSavings).toLocaleString("en-IN")}`,
      downtime_difference_hours: round(downtimeSavings, 2),
      production_loss_difference: round(
        scenarioB.projected_production_loss - scenarioA.projected_production_loss,
        2
      ),
    },
    recommendation,
    rationale,
    cost_parameters_used: params,
    execution_time_ms: executionTimeMs,
  };
};

function round(value, decimals) {
  return Math.round(value * 10 ** decimals) / 10 ** decimals;
}
