const mongoose = require("mongoose");

const optimizationRunSchema = new mongoose.Schema(
  {
    runId: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["production-scheduling", "inventory-reorder", "resource-allocation", "cost-minimization"],
      required: true,
    },
    constraints: { type: mongoose.Schema.Types.Mixed, required: true },
    objective: { type: String, required: true },
    status: {
      type: String,
      enum: ["queued", "running", "completed", "failed"],
      default: "queued",
    },
    result: {
      feasible: { type: Boolean },
      objectiveValue: { type: Number },
      variables: { type: mongoose.Schema.Types.Mixed },
      suggestions: [{ type: String }],
    },
    executionTimeMs: { type: Number },
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

optimizationRunSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("OptimizationRun", optimizationRunSchema);
