const mongoose = require("mongoose");

const qualityInspectionSchema = new mongoose.Schema(
  {
    inspectionNumber: { type: String, required: true, unique: true },
    workOrder: { type: mongoose.Schema.Types.ObjectId, ref: "WorkOrder" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    batchNumber: { type: String },
    inspector: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    inspectionDate: { type: Date, default: Date.now },
    sampleSize: { type: Number, required: true },
    passedCount: { type: Number, required: true },
    failedCount: { type: Number, required: true },
    defectTypes: [
      {
        type: { type: String, required: true },
        count: { type: Number, required: true },
        severity: { type: String, enum: ["minor", "major", "critical"] },
      },
    ],
    result: {
      type: String,
      enum: ["pass", "fail", "conditional"],
      required: true,
    },
    notes: { type: String },
    attachments: [{ type: String }], // file paths
  },
  { timestamps: true }
);

qualityInspectionSchema.virtual("defectRate").get(function () {
  return this.sampleSize > 0
    ? ((this.failedCount / this.sampleSize) * 100).toFixed(2)
    : 0;
});

qualityInspectionSchema.set("toJSON", { virtuals: true });
qualityInspectionSchema.index({ product: 1, inspectionDate: -1 });

module.exports = mongoose.model("QualityInspection", qualityInspectionSchema);
