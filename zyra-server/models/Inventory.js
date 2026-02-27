const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    warehouse: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    reorderPoint: { type: Number, default: 10 },
    reorderQuantity: { type: Number, default: 50 },
    lastRestocked: { type: Date },
    location: { type: String }, // aisle-shelf-bin
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

inventorySchema.virtual("availableQuantity").get(function () {
  return this.quantity - this.reservedQuantity;
});

inventorySchema.virtual("needsReorder").get(function () {
  return this.quantity <= this.reorderPoint;
});

inventorySchema.set("toJSON", { virtuals: true });
inventorySchema.index({ sku: 1, warehouse: 1 }, { unique: true });
inventorySchema.index({ quantity: 1 });

module.exports = mongoose.model("Inventory", inventorySchema);
