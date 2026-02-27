const mongoose = require("mongoose");

const machineSchema = new mongoose.Schema(
  {
    machineId: { type: String, required: true, unique: true }, // e.g., "M01"
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["assembly", "cnc", "casting", "welding", "pressing", "furnace"],
      required: true,
    },
    capacity: { type: Number, default: 8 },
    status: {
      type: String,
      enum: ["Running", "High Risk", "Maintenance", "Offline"],
      default: "Running",
    },
    operator: { type: String },
    lastMaint: { type: Date },
    // Sensor Config for Auto-Risk Calculation
    sensorConfig: {
      baseTempC: { type: Number, default: 70 },
      baseVibration: { type: Number, default: 2.0 },
      baseEnergyKWh: { type: Number, default: 20 },
      tempVariance: { type: Number, default: 5 },
      vibVariance: { type: Number, default: 0.5 },
      energyVariance: { type: Number, default: 3 },
      degradationRate: { type: Number, default: 0.1 },
    },
    thresholds: {
      safeMaxTemp: { type: Number, default: 90 },
      safeMaxVib: { type: Number, default: 4.0 },
      baselineEnergy: { type: Number, default: 25 },
      maintIntervalDays: { type: Number, default: 30 },
    },
  },
  { timestamps: true }
);

machineSchema.index({ machineId: 1 });
machineSchema.index({ status: 1 });

module.exports = mongoose.model("Machine", machineSchema);
