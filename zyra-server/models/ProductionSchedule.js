const mongoose = require("mongoose");

const productionScheduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    line: { type: String, required: true },
    plannedQuantity: { type: Number, required: true, min: 1 },
    producedQuantity: { type: Number, default: 0, min: 0 },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    shift: { type: String, enum: ["morning", "afternoon", "night"], default: "morning" },
    status: {
      type: String,
      enum: ["planned", "in-progress", "completed", "delayed", "cancelled"],
      default: "planned",
    },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], default: "medium" },
    notes: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

productionScheduleSchema.index({ startDate: 1, endDate: 1 });
productionScheduleSchema.index({ status: 1 });

module.exports = mongoose.model("ProductionSchedule", productionScheduleSchema);
