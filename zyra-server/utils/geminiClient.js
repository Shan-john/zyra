const { GoogleGenerativeAI, SchemaType } = require("@google/generative-ai");
const { GEMINI_API_KEY } = require("../config/env");
const logger = require("./logger");

let genAI = null;
let model = null;

/**
 * Initialize the Gemini client lazily.
 */
function getModel() {
  if (!model) {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.4,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });
  }
  return model;
}

/**
 * Generate content using Gemini.
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} - Generated text
 */
async function generateContent(prompt) {
  try {
    const geminiModel = getModel();
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    logger.error("Gemini API call failed", { error: error.message });
    throw error;
  }
}

/**
 * Default Explainability Schema to enforce strict JSON matching
 */
const defaultSchema = {
  type: SchemaType.OBJECT,
  properties: {
    plain_language_explanation: {
      type: SchemaType.STRING,
      description: "A 2-3 sentence clear explanation of the machine state and the scheduling decision."
    },
    management_summary: {
      type: SchemaType.STRING,
      description: "A 1-2 sentence executive summary of the financial/throughput tradeoff made."
    },
    operator_recommendation: {
      type: SchemaType.STRING,
      description: "1 bullet point actionable step for the floor operator."
    }
  },
  required: ["plain_language_explanation", "management_summary", "operator_recommendation"]
};

/**
 * Generate structured JSON content using Gemini.
 * @param {string} prompt - The prompt to send
 * @param {Object} [schema] - Optional Schema definition
 * @returns {Promise<Object>} - Parsed JSON object
 */
async function generateJsonContent(prompt, schema = defaultSchema) {
  try {
    if (!model) getModel();
    
    // We override the generation config per-request to enforce strict JSON schemas
    const jsonModel = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.2, // lower temp for more deterministic JSON
        responseMimeType: "application/json",
        responseSchema: schema
      },
    });

    const result = await jsonModel.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error) {
    logger.error("Gemini structured JSON generation failed", { error: error.message });
    throw error;
  }
}

module.exports = { generateContent, generateJsonContent };
