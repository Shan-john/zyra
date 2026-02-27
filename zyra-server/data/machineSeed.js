const MACHINE_SEED = [
  {
    machineId: "M01", name: "Assembly Line A", type: "assembly", capacity: 8, status: "Running", operator: "Ravi Kumar", lastMaint: new Date("2026-02-10"),
    sensorConfig: { baseTempC: 62, baseVibration: 1.8, baseEnergyKWh: 18, tempVariance: 4, vibVariance: 0.4, energyVariance: 2, degradationRate: 0.04 },
    thresholds: { safeMaxTemp: 80, safeMaxVib: 3.5, baselineEnergy: 20, maintIntervalDays: 30 },
  },
  {
    machineId: "M02", name: "Assembly Line B", type: "assembly", capacity: 8, status: "Running", operator: "Anita Sharma", lastMaint: new Date("2026-01-28"),
    sensorConfig: { baseTempC: 74, baseVibration: 2.9, baseEnergyKWh: 22, tempVariance: 6, vibVariance: 0.7, energyVariance: 3, degradationRate: 0.18 },
    thresholds: { safeMaxTemp: 80, safeMaxVib: 3.5, baselineEnergy: 22, maintIntervalDays: 30 },
  },
  {
    machineId: "M03", name: "CNC Machine #1", type: "cnc", capacity: 10, status: "Running", operator: "Vijay Singh", lastMaint: new Date("2026-02-15"),
    sensorConfig: { baseTempC: 68, baseVibration: 2.1, baseEnergyKWh: 30, tempVariance: 5, vibVariance: 0.5, energyVariance: 4, degradationRate: 0.08 },
    thresholds: { safeMaxTemp: 90, safeMaxVib: 4.0, baselineEnergy: 32, maintIntervalDays: 21 },
  },
  {
    machineId: "M04", name: "CNC Machine #2", type: "cnc", capacity: 10, status: "High Risk", operator: "Priya Nair", lastMaint: new Date("2026-01-15"),
    sensorConfig: { baseTempC: 88, baseVibration: 3.9, baseEnergyKWh: 36, tempVariance: 8, vibVariance: 0.9, energyVariance: 6, degradationRate: 0.30 },
    thresholds: { safeMaxTemp: 90, safeMaxVib: 4.0, baselineEnergy: 32, maintIntervalDays: 21 },
  },
  {
    machineId: "M05", name: "Casting Station", type: "casting", capacity: 12, status: "Running", operator: "Suresh Rao", lastMaint: new Date("2026-02-20"),
    sensorConfig: { baseTempC: 190, baseVibration: 1.2, baseEnergyKWh: 55, tempVariance: 10, vibVariance: 0.3, energyVariance: 5, degradationRate: 0.05 },
    thresholds: { safeMaxTemp: 220, safeMaxVib: 2.5, baselineEnergy: 58, maintIntervalDays: 45 },
  },
  {
    machineId: "M06", name: "Welding Bay Alpha", type: "welding", capacity: 8, status: "Running", operator: "Mohan Das", lastMaint: new Date("2026-02-01"),
    sensorConfig: { baseTempC: 155, baseVibration: 2.4, baseEnergyKWh: 28, tempVariance: 12, vibVariance: 0.6, energyVariance: 4, degradationRate: 0.12 },
    thresholds: { safeMaxTemp: 180, safeMaxVib: 4.0, baselineEnergy: 30, maintIntervalDays: 30 },
  },
  {
    machineId: "M07", name: "Hydraulic Press #1", type: "pressing", capacity: 8, status: "High Risk", operator: "Kavitha Iyer", lastMaint: new Date("2026-01-20"),
    sensorConfig: { baseTempC: 80, baseVibration: 4.2, baseEnergyKWh: 42, tempVariance: 7, vibVariance: 1.1, energyVariance: 7, degradationRate: 0.25 },
    thresholds: { safeMaxTemp: 95, safeMaxVib: 4.5, baselineEnergy: 40, maintIntervalDays: 21 },
  },
  {
    machineId: "M08", name: "Heat Treatment Oven", type: "furnace", capacity: 16, status: "Running", operator: "Ramesh Pillai", lastMaint: new Date("2026-02-18"),
    sensorConfig: { baseTempC: 780, baseVibration: 0.8, baseEnergyKWh: 110, tempVariance: 15, vibVariance: 0.2, energyVariance: 8, degradationRate: 0.06 },
    thresholds: { safeMaxTemp: 900, safeMaxVib: 1.5, baselineEnergy: 115, maintIntervalDays: 60 },
  },
  {
    machineId: "M09", name: "Robotic Welding Arm", type: "welding", capacity: 10, status: "Offline", operator: "Deepa Menon", lastMaint: new Date("2025-12-01"),
    sensorConfig: { baseTempC: 95, baseVibration: 5.8, baseEnergyKWh: 38, tempVariance: 10, vibVariance: 1.5, energyVariance: 8, degradationRate: 0.45 },
    thresholds: { safeMaxTemp: 100, safeMaxVib: 5.0, baselineEnergy: 35, maintIntervalDays: 30 },
  },
  {
    machineId: "M10", name: "Laser Cutting Unit", type: "cnc", capacity: 12, status: "Running", operator: "Arjun Patel", lastMaint: new Date("2026-02-22"),
    sensorConfig: { baseTempC: 70, baseVibration: 1.5, baseEnergyKWh: 45, tempVariance: 4, vibVariance: 0.3, energyVariance: 3, degradationRate: 0.05 },
    thresholds: { safeMaxTemp: 90, safeMaxVib: 3.0, baselineEnergy: 47, maintIntervalDays: 30 },
  },
];

module.exports = MACHINE_SEED;
