const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true },
    category: { type: String, required: true },
    description: { type: String },
    unitPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    unit: { type: String, default: "pcs", enum: ["pcs", "kg", "litre", "meter", "box"] },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

productSchema.index({ sku: 1 });
productSchema.index({ category: 1 });

module.exports = mongoose.model("Product", productSchema);
