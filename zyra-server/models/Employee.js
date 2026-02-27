const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    department: { type: String, required: true },
    designation: { type: String, required: true },
    dateOfJoining: { type: Date, required: true },
    dateOfLeaving: { type: Date },
    salary: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["active", "on-leave", "terminated", "resigned"],
      default: "active",
    },
    skills: [{ type: String }],
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

employeeSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

employeeSchema.set("toJSON", { virtuals: true });
employeeSchema.index({ employeeId: 1 });
employeeSchema.index({ department: 1 });

module.exports = mongoose.model("Employee", employeeSchema);
