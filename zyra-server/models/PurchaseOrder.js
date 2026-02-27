const mongoose = require("mongoose");

const poItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  receivedQuantity: { type: Number, default: 0 },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    poNumber: { type: String, required: true, unique: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    items: [poItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["draft", "sent", "acknowledged", "partially-received", "received", "cancelled"],
      default: "draft",
    },
    orderDate: { type: Date, default: Date.now },
    expectedDelivery: { type: Date },
    actualDelivery: { type: Date },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

purchaseOrderSchema.index({ poNumber: 1 });
purchaseOrderSchema.index({ status: 1 });

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
