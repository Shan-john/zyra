/**
 * ★ EXPLAINABILITY SERVICE — explainabilityService.js
 *
 * Integrates Google AI Studio (Gemini 2.0 Flash) to translate raw ML
 * metrics and algorithmic scheduling decisions into plain language,
 * actionable insights. Enforces structured JSON output.
 */

const { generateJsonContent } = require("../utils/geminiClient");
const logger = require("../utils/logger");

/**
 * Generates a structured explanation for equipment health and scheduling trade-offs.
 * 
 * @param {Object} input
 * @param {Object} input.machine_metrics - Operating hours, temp, vibration, etc.
 * @param {number} input.failure_probability - From ML service
 * @param {Object} input.feature_importance - SHAP or global importance dict
 * @param {Object} input.scheduling_decision - e.g., "Assigned to Job X" or "Maintenance Scheduled"
 * @param {Array}  input.deferred_jobs - Jobs that were delayed due to this machine's capacity/risk
 * @param {Object} input.adjusted_weights - The user's W1/W2/W3 weights
 */
exports.explainDecision = async (input) => {
  const {
    machine_metrics,
    failure_probability,
    feature_importance,
    scheduling_decision,
    deferred_jobs,
    adjusted_weights,
  } = input;

  // We construct a highly structured prompt to guide the LLM's reasoning
  const prompt = `
You are an expert Production Manager and AI Explainability Engine.
I am passing you raw metrics from a factory machine, ML failure predictions, and the output of our optimization scheduling solver.

Your task is to translate this data into actionable, plain-language insights for human operators and managers.

INPUT DATA:
- Machine Metrics: ${JSON.stringify(machine_metrics)}
- Failure Probability: ${(failure_probability * 100).toFixed(1)}%
- Top Risk Factors (Importance): ${JSON.stringify(feature_importance)}
- Scheduling Decision: ${JSON.stringify(scheduling_decision)}
- Deferred Jobs: ${JSON.stringify(deferred_jobs)}
- User's Objectives (Weights): ${JSON.stringify(adjusted_weights)}

Please explain:
1. Why does this machine have a high (or low) failure risk?
2. Why was Job Y deferred (if any)? 
3. What is the tradeoff happening here based on the weights adjusted by the user? (e.g., did they favor throughput over risk?)

You must return ONLY a JSON object exactly matching this schema:
{
  "plain_language_explanation": "A 2-3 sentence clear explanation of the machine state and the scheduling decision.",
  "management_summary": "A 1-2 sentence executive summary of the financial/throughput tradeoff made.",
  "operator_recommendation": "1 bullet point actionable step for the floor operator (e.g., 'Monitor vibration levels closely')."
}
`;

  try {
    const startTime = Date.now();
    const explanationJson = await generateJsonContent(prompt);
    const executionTimeMs = Date.now() - startTime;

    logger.info("Generated actionable explanation via Gemini", { executionTimeMs });
    
    return {
      success: true,
      data: explanationJson,
      execution_time_ms: executionTimeMs
    };
  } catch (error) {
    logger.error("Explainability Service failed", { error: error.message });
    throw Object.assign(new Error("Failed to generate AI explanation"), { statusCode: 502 });
  }
};
