const mongoose = require("mongoose");

const ledgerEntrySchema = new mongoose.Schema(
  {
    entryNumber: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["income", "expense", "asset", "liability"],
      required: true,
    },
    category: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    debit: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    account: { type: String, required: true },
    reference: { type: String }, // PO number, invoice number, etc.
    referenceModel: { type: String, enum: ["SalesOrder", "PurchaseOrder", "Invoice", "Payroll"] },
    referenceId: { type: mongoose.Schema.Types.ObjectId },
    date: { type: Date, required: true, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ledgerEntrySchema.index({ date: -1 });
ledgerEntrySchema.index({ type: 1, category: 1 });

module.exports = mongoose.model("LedgerEntry", ledgerEntrySchema);
