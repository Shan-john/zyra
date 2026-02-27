const mongoose = require("mongoose");

const simulationScenarioSchema = new mongoose.Schema(
  {
    scenarioId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["what-if", "monte-carlo", "sensitivity-analysis", "stress-test"],
      required: true,
    },
    baselineSnapshot: { type: mongoose.Schema.Types.Mixed },
    mutations: [
      {
        parameter: { type: String, required: true },
        change: { type: String, required: true }, // e.g. "+20%", "-500", "replace:value"
        description: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "running", "completed", "failed"],
      default: "draft",
    },
    result: {
      kpiDeltas: { type: mongoose.Schema.Types.Mixed },
      timeline: [{ type: mongoose.Schema.Types.Mixed }],
      riskScore: { type: Number },
      summary: { type: String },
    },
    iterations: { type: Number, default: 1 },
    executionTimeMs: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

simulationScenarioSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("SimulationScenario", simulationScenarioSchema);
