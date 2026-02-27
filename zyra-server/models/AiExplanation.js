const mongoose = require("mongoose");

const aiExplanationSchema = new mongoose.Schema(
  {
    contextType: {
      type: String,
      enum: ["optimization", "simulation", "forecast", "defect", "inventory", "general"],
      required: true,
    },
    contextId: { type: mongoose.Schema.Types.ObjectId },
    question: { type: String, required: true },
    dataContext: { type: mongoose.Schema.Types.Mixed }, // serialized KPIs / data snapshot
    explanation: { type: String, required: true },
    model: { type: String, default: "gemini-2.0-flash" },
    tokensUsed: { type: Number },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

aiExplanationSchema.index({ contextType: 1, contextId: 1 });
aiExplanationSchema.index({ createdAt: -1 });

module.exports = mongoose.model("AiExplanation", aiExplanationSchema);
