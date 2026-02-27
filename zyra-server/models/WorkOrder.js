const mongoose = require("mongoose");

const workOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // e.g. "WO-1001"
    job: { type: String, required: true }, // e.g. "Steel Frame Assembly"
    machine: { type: String, required: true }, // e.g. "Assembly Line A"
    hours: { type: Number, required: true, min: 1, default: 1 },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["Queued", "In Progress", "Complete"],
      default: "Queued",
    },
  },
  { timestamps: true }
);

workOrderSchema.index({ orderNumber: 1 });
workOrderSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model("WorkOrder", workOrderSchema);
