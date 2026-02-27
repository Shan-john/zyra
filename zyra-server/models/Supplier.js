const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true },
    contactPerson: { type: String },
    email: { type: String, lowercase: true },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      postalCode: String,
    },
    productsSupplied: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    rating: { type: Number, min: 1, max: 5, default: 3 },
    leadTimeDays: { type: Number, default: 7 },
    paymentTerms: { type: String, default: "Net 30" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

supplierSchema.index({ code: 1 });

module.exports = mongoose.model("Supplier", supplierSchema);
