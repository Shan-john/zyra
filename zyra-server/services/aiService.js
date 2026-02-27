/**
 * ★ AI EXPLAINABILITY SERVICE — aiService.js
 *
 * Calls Google AI Studio (Gemini) to generate natural-language
 * explanations of ERP data, optimization results, and forecasts.
 * Used for EXPLAINABILITY ONLY — not decision-making.
 */

const { generateContent } = require("../utils/geminiClient");
const AiExplanation = require("../models/AiExplanation");
const logger = require("../utils/logger");

/**
 * Explain a data point or decision result using Gemini.
 * @param {string} contextType - "optimization" | "simulation" | "forecast" | "defect" | "inventory" | "general"
 * @param {ObjectId} contextId - ID of the related document (optional)
 * @param {string} question - User's natural-language question
 * @param {Object} dataContext - Serialized data (KPIs, results, etc.)
 * @param {string} userId - Who requested the explanation
 */
exports.explain = async ({ contextType, contextId, question, dataContext, userId }) => {
  // Check cache first
  if (contextId) {
    const cached = await AiExplanation.findOne({ contextType, contextId });
    if (cached) {
      logger.debug("Returning cached AI explanation", { contextType, contextId });
      return cached;
    }
  }

  // Build a structured prompt
  const systemPrompt = `You are an expert ERP analytics assistant for a manufacturing company.
Your role is to explain data, trends, and optimization results in clear, actionable language.
Always structure your response with:
1. A concise summary (1-2 sentences)
2. Key factors that contributed to the result
3. Recommended actions (if applicable)
Keep responses under 300 words. Use bullet points for clarity.`;

  const userPrompt = `Context type: ${contextType}

Data:
${JSON.stringify(dataContext, null, 2)}

Question: ${question}`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const explanationText = await generateContent(fullPrompt);

    // Cache the explanation
    const saved = await AiExplanation.create({
      contextType,
      contextId,
      question,
      dataContext,
      explanation: explanationText,
      requestedBy: userId,
    });

    logger.info("AI explanation generated", { contextType, question });
    return saved;
  } catch (error) {
    logger.error("AI explanation failed", { error: error.message });

    // Return a graceful fallback
    return {
      contextType,
      question,
      explanation: `Unable to generate AI explanation at this time. Error: ${error.message}`,
      fallback: true,
    };
  }
};

/**
 * Summarize a set of data points / trends using Gemini.
 */
exports.summarize = async ({ dataPoints, timeframe, userId }) => {
  const prompt = `You are an ERP data analyst. Summarize the following business metrics into a concise paragraph highlighting key trends, anomalies, and insights.

Timeframe: ${timeframe || "Recent"}
Data:
${JSON.stringify(dataPoints, null, 2)}

Provide a 2-3 sentence executive summary followed by 3-5 bullet points of key observations.`;

  try {
    const summary = await generateContent(prompt);

    const saved = await AiExplanation.create({
      contextType: "general",
      question: `Summarize trends for ${timeframe || "recent period"}`,
      dataContext: dataPoints,
      explanation: summary,
      requestedBy: userId,
    });

    return saved;
  } catch (error) {
    logger.error("AI summarization failed", { error: error.message });
    return {
      explanation: `Unable to generate summary. Error: ${error.message}`,
      fallback: true,
    };
  }
};

/**
 * Get a cached explanation by ID.
 */
exports.getCached = async (id) => {
  const explanation = await AiExplanation.findById(id).populate("requestedBy", "name email");
  if (!explanation) throw Object.assign(new Error("Explanation not found"), { statusCode: 404 });
  return explanation;
};
