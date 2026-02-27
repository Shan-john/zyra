const mongoose = require("mongoose");

const bomItemSchema = new mongoose.Schema({
  material: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 0.01 },
  unit: { type: String, default: "pcs" },
  wastagePercent: { type: Number, default: 0, min: 0, max: 100 },
});

const billOfMaterialsSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    version: { type: Number, default: 1 },
    items: [bomItemSchema],
    laborHours: { type: Number, default: 0 },
    overheadCost: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
  },
  { timestamps: true }
);

billOfMaterialsSchema.index({ product: 1, version: 1 }, { unique: true });

module.exports = mongoose.model("BillOfMaterials", billOfMaterialsSchema);
