const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Warn about missing optional vars - don't crash server in demo mode
if (!process.env.MONGO_URI) {
  console.warn("⚠️  MONGO_URI not set — running in AI Demo Mode (no database required)");
}
if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️  GEMINI_API_KEY not set — ExplainabilityService will be unavailable");
}

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  ML_SERVICE_URL: process.env.ML_SERVICE_URL || "http://localhost:8000",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
};
