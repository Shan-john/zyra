const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: "SalesOrder", required: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String },
      address: { type: String },
    },
    items: [
      {
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "sent", "paid", "overdue", "cancelled"],
      default: "draft",
    },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    paymentMethod: { type: String },
  },
  { timestamps: true }
);

invoiceSchema.index({ invoiceNumber: 1 });

module.exports = mongoose.model("Invoice", invoiceSchema);
