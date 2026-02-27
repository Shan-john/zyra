const { GoogleGenerativeAI } = require("@google/generative-ai");
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

module.exports = { generateContent };
