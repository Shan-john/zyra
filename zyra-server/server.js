/**
 * zyra-server — Express Application Entry Point
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Load environment config (must be first)
const { PORT, NODE_ENV } = require("./config/env");
const connectDB = require("./config/db");
const corsOptions = require("./config/cors");
const errorHandler = require("./middlewares/errorHandler");
const { rateLimiter } = require("./middlewares/rateLimiter");
const logger = require("./utils/logger");

// Import routes
const authRoutes = require("./routes/authRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const productionRoutes = require("./routes/productionRoutes");
const supplyChainRoutes = require("./routes/supplyChainRoutes");
const salesRoutes = require("./routes/salesRoutes");
const hrRoutes = require("./routes/hrRoutes");
const financeRoutes = require("./routes/financeRoutes");
const qualityRoutes = require("./routes/qualityRoutes");
const optimizationRoutes = require("./routes/optimizationRoutes");
const simulationRoutes = require("./routes/simulationRoutes");
const aiRoutes = require("./routes/aiRoutes");
const maintenanceSimRoutes = require("./routes/maintenanceSimRoutes");
const schedulingRoutes = require("./routes/schedulingRoutes");
const scheduleOptimizeRoutes = require("./routes/scheduleOptimizeRoutes");
const explainabilityRoutes = require("./routes/explainabilityRoutes");

// Import background jobs
const reorderAlertJob = require("./jobs/reorderAlertJob");

const app = express();

// ─── Global Middleware ─────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));
app.use(rateLimiter);

// ─── Health Check ──────────────────────────────────────────
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    message: "Zyra ERP API is running",
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes (v1) ──────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/production", productionRoutes);
app.use("/api/v1/supply-chain", supplyChainRoutes);
app.use("/api/v1/sales", salesRoutes);
app.use("/api/v1/hr", hrRoutes);
app.use("/api/v1/finance", financeRoutes);
app.use("/api/v1/quality", qualityRoutes);
app.use("/api/v1/optimization", optimizationRoutes);
app.use("/api/v1/simulation", simulationRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/maintenance", maintenanceSimRoutes);
app.use("/api/v1/scheduling", schedulingRoutes);
app.use("/api/v1/explainability", explainabilityRoutes);
app.use("/api/schedule", scheduleOptimizeRoutes); // Real-time dash endpoint

// ─── 404 Handler ───────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// ─── Error Handler (must be last) ──────────────────────────
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`🚀 Zyra ERP Server running on port ${PORT} [${NODE_ENV}]`);
    });

    // Start background jobs
    reorderAlertJob.start();
    logger.info("Background jobs initialized");
  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
};

startServer();

module.exports = app; // for testing
