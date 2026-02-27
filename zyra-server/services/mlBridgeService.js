/**
 * ML Bridge Service — mlBridgeService.js
 *
 * HTTP client that proxies requests to the Python FastAPI
 * microservice for failure prediction.
 */

const axios = require("axios");
const { ML_SERVICE_URL } = require("../config/env");
const logger = require("../utils/logger");

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 30000, // ML inference can be slow
  headers: { "Content-Type": "application/json" },
});

/**
 * Predict equipment/component failure probability.
 * @param {Object} features - Feature vector for the ML model
 */
exports.predictFailure = async (features) => {
  try {
    const response = await mlClient.post("/predict/failure", features);
    return response.data;
  } catch (error) {
    logger.error("ML prediction failed", {
      error: error.message,
      status: error.response?.status,
    });

    if (error.code === "ECONNREFUSED") {
      throw Object.assign(new Error("ML service is unavailable"), { statusCode: 503 });
    }

    throw Object.assign(
      new Error(error.response?.data?.detail || "ML prediction failed"),
      { statusCode: error.response?.status || 500 }
    );
  }
};

/**
 * Check if the ML service is healthy.
 */
exports.healthCheck = async () => {
  try {
    const response = await mlClient.get("/health");
    return { status: "healthy", data: response.data };
  } catch (error) {
    return { status: "unhealthy", error: error.message };
  }
};
