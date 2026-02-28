const { db } = require("../config/firebase");
const { ref, get, set, child } = require("firebase/database");

// ─── Seed Data ────────────────────────────────────────────────────────────────
const INSPECTION_SEED = [
  {
    id: "QI-001", product: { name: "Steel Frame Kit", sku: "SFK-01" }, workOrder: { orderNumber: "WO-1001" },
    inspector: { firstName: "Bob", lastName: "Thompson" },
    inspectionDate: "2026-02-01", sampleSize: 50, passedCount: 48, failedCount: 2,
    result: "pass", defectTypes: [{ type: "Surface Scratch", severity: "minor", count: 2 }],
    notes: "Minor surface defects on 2 units. Accepted with note.",
  },
  {
    id: "QI-002", product: { name: "CNC Shaft", sku: "CNC-SFT-02" }, workOrder: { orderNumber: "WO-1002" },
    inspector: { firstName: "Clara", lastName: "Singh" },
    inspectionDate: "2026-02-05", sampleSize: 30, passedCount: 27, failedCount: 3,
    result: "conditional", defectTypes: [{ type: "Dimensional Variance", severity: "major", count: 3 }],
    notes: "3 units exceed tolerance by 0.05mm. Rework required.",
  },
  {
    id: "QI-003", product: { name: "Spur Gear Module", sku: "GEAR-M2" }, workOrder: { orderNumber: "WO-1003" },
    inspector: { firstName: "Alice", lastName: "Martin" },
    inspectionDate: "2026-02-10", sampleSize: 100, passedCount: 100, failedCount: 0,
    result: "pass", defectTypes: [],
    notes: "All units within spec. Batch cleared for shipment.",
  },
  {
    id: "QI-004", product: { name: "Hydraulic Cylinder", sku: "HYD-CYL-01" }, workOrder: { orderNumber: "WO-1004" },
    inspector: { firstName: "David", lastName: "Lee" },
    inspectionDate: "2026-02-15", sampleSize: 20, passedCount: 14, failedCount: 6,
    result: "fail", defectTypes: [{ type: "Seal Leak", severity: "critical", count: 4 }, { type: "Surface Corrosion", severity: "major", count: 2 }],
    notes: "High failure rate. Production batch quarantined pending root cause analysis.",
  },
  {
    id: "QI-005", product: { name: "O-Ring Seal Pack", sku: "SEAL-OR" }, workOrder: { orderNumber: "WO-1005" },
    inspector: { firstName: "Eva", lastName: "Patel" },
    inspectionDate: "2026-02-20", sampleSize: 80, passedCount: 79, failedCount: 1,
    result: "pass", defectTypes: [{ type: "Deformation", severity: "minor", count: 1 }],
    notes: "One deformed seal found. Remaining 79 units approved.",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getAll = async () => {
  const snap = await get(child(ref(db), "qualityInspections"));
  if (!snap.exists()) return [];
  return Object.values(snap.val());
};

const seedIfEmpty = async () => {
  const snap = await get(child(ref(db), "qualityInspections"));
  if (!snap.exists()) {
    for (const item of INSPECTION_SEED) {
      await set(ref(db, `qualityInspections/${item.id}`), item);
    }
  }
};

// ─── Get Inspections ──────────────────────────────────────────────────────────
exports.getInspections = async ({ page = 1, limit = 20, result, productId } = {}) => {
  await seedIfEmpty();
  let inspections = await getAll();
  if (result)    inspections = inspections.filter(i => i.result === result);
  if (productId) inspections = inspections.filter(i => i.product?.id === productId);
  inspections.sort((a, b) => b.inspectionDate.localeCompare(a.inspectionDate));
  const total = inspections.length;
  const start = (page - 1) * limit;
  return { inspections: inspections.slice(start, start + Number(limit)), total, page, totalPages: Math.ceil(total / limit) };
};

// ─── Log Inspection ───────────────────────────────────────────────────────────
exports.logInspection = async (data) => {
  const id = `QI-${Date.now()}`;
  const inspection = { id, ...data, inspectionDate: data.inspectionDate || new Date().toISOString().split("T")[0] };
  await set(ref(db, `qualityInspections/${id}`), inspection);
  return inspection;
};

// ─── Defect Analytics ─────────────────────────────────────────────────────────
exports.getDefectAnalytics = async ({ startDate, endDate } = {}) => {
  await seedIfEmpty();
  let inspections = await getAll();
  if (startDate && endDate) {
    inspections = inspections.filter(i => i.inspectionDate >= startDate && i.inspectionDate <= endDate);
  }

  const defectMap = {};
  inspections.forEach(i => {
    (i.defectTypes || []).forEach(d => {
      const key = `${d.type}|${d.severity}`;
      if (!defectMap[key]) defectMap[key] = { _id: { type: d.type, severity: d.severity }, count: 0, inspections: 0 };
      defectMap[key].count += d.count;
      defectMap[key].inspections++;
    });
  });
  const defectsByType = Object.values(defectMap).sort((a, b) => b.count - a.count);

  const totalInspections = inspections.length;
  const totalSampled  = inspections.reduce((s, i) => s + (i.sampleSize || 0), 0);
  const totalPassed   = inspections.reduce((s, i) => s + (i.passedCount || 0), 0);
  const totalFailed   = inspections.reduce((s, i) => s + (i.failedCount || 0), 0);

  return {
    defectsByType,
    overall: { totalInspections, totalSampled, totalPassed, totalFailed },
    overallDefectRate: totalSampled > 0 ? ((totalFailed / totalSampled) * 100).toFixed(2) : 0,
  };
};
