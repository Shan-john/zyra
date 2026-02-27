const mongoose = require("mongoose");

const workOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionSchedule" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    completedQuantity: { type: Number, default: 0 },
    defectQuantity: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "released", "in-progress", "completed", "closed"],
      default: "draft",
    },
    startDate: { type: Date },
    dueDate: { type: Date, required: true },
    completedDate: { type: Date },
    assignedWorkers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
    instructions: { type: String },
  },
  { timestamps: true }
);

workOrderSchema.index({ orderNumber: 1 });
workOrderSchema.index({ status: 1, dueDate: 1 });

module.exports = mongoose.model("WorkOrder", workOrderSchema);
