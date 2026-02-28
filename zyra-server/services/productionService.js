const { db } = require("../config/firebase");
const { ref, get, set, remove, child } = require("firebase/database");
const { appendToCSV } = require("../utils/csvExport");

// ─── Machines (FIREBASE) ───────────────────────────────────────────────────
exports.getMachines = async (query = {}) => {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, "machines"));
  let machines = [];

  if (snapshot.exists()) {
    const data = snapshot.val();
    machines = Object.values(data).sort((a, b) => a.machineId.localeCompare(b.machineId));
  }

  // Seed default data if database is empty
  if (machines.length === 0) {
    const MACHINE_SEED = require("../data/machineSeed");
    for (const m of MACHINE_SEED) {
      await set(ref(db, "machines/" + m.machineId), m);
    }
    machines = MACHINE_SEED.sort((a, b) => a.machineId.localeCompare(b.machineId));
  }
  return machines;
};

exports.createMachine = async (data) => {
  await set(ref(db, "machines/" + data.machineId), data);
  appendToCSV("machines.csv", data);
  return data;
};

exports.updateMachine = async (id, data) => {
  await set(ref(db, "machines/" + id), data);
  return data;
};

exports.deleteMachine = async (id) => {
  await remove(ref(db, "machines/" + id));
  return { deleted: true };
};

// ─── Work Orders (FIREBASE) ─────────────────────────────────────────────────
exports.getWorkOrders = async (query = {}) => {
  const dbRef = ref(db);
  const snapshot = await get(child(dbRef, "workOrders"));
  let workOrders = [];

  if (snapshot.exists()) {
    const data = snapshot.val();
    workOrders = Object.values(data).sort((a, b) => a.orderNumber.localeCompare(b.orderNumber));
  }

  // Seed default data if database is empty
  if (workOrders.length === 0) {
    const WORK_ORDER_SEED = [
      { orderNumber: "WO-1001", job: "Steel Frame Assembly", machine: "Assembly Line A", hours: 3, priority: "High", status: "In Progress" },
      { orderNumber: "WO-1002", job: "CNC Shaft Machining", machine: "CNC Machine #1", hours: 2, priority: "Medium", status: "Queued" },
      { orderNumber: "WO-1003", job: "Precision Gear Cutting", machine: "CNC Machine #2", hours: 4, priority: "High", status: "In Progress" },
      { orderNumber: "WO-1004", job: "Aluminum Die Casting", machine: "Casting Station", hours: 5, priority: "Low", status: "Queued" },
      { orderNumber: "WO-1005", job: "Surface Heat Treatment", machine: "Heat Treatment Oven", hours: 6, priority: "Medium", status: "Complete" },
    ];
    for (const wo of WORK_ORDER_SEED) {
      await set(ref(db, "workOrders/" + wo.orderNumber), wo);
    }
    workOrders = WORK_ORDER_SEED.sort((a, b) => a.orderNumber.localeCompare(b.orderNumber));
  }
  return workOrders;
};

exports.createWorkOrder = async (data) => {
  await set(ref(db, "workOrders/" + data.orderNumber), data);
  appendToCSV("work_orders.csv", data);
  return data;
};

exports.updateWorkOrder = async (id, data) => {
  await set(ref(db, "workOrders/" + id), data);
  return data;
};

exports.deleteWorkOrder = async (id) => {
  await remove(ref(db, "workOrders/" + id));
  return { deleted: true };
};

// ─── Production Schedules (FIREBASE) ────────────────────────────────────────
const SCHEDULE_SEED = [
  { id: "SCH-001", product: { name: "Steel Frame Assembly", sku: "SFA-01" }, line: "Line A", status: "in_progress", startDate: "2026-02-20", endDate: "2026-03-05", assignedTo: "Eva Patel", targetQty: 200 },
  { id: "SCH-002", product: { name: "CNC Shaft Batch",      sku: "CNS-02" }, line: "Line B", status: "scheduled",   startDate: "2026-03-06", endDate: "2026-03-15", assignedTo: "Alice Martin", targetQty: 150 },
  { id: "SCH-003", product: { name: "Gear Set Production",  sku: "GSP-03" }, line: "Line A", status: "completed",   startDate: "2026-01-15", endDate: "2026-02-01", assignedTo: "Bob Thompson", targetQty: 300 },
];

const BOM_SEED = [
  {
    id: "BOM-001", productId: "SFA-01", product: { name: "Steel Frame Assembly", sku: "SFA-01" }, isActive: true,
    items: [
      { material: { name: "Steel Rod 4mm",      sku: "STL-4MM",  unitPrice: 3.50,  unit: "kg"  }, quantity: 5  },
      { material: { name: "Hex Bolt M10x30",     sku: "BOLT-M10", unitPrice: 0.15,  unit: "pcs" }, quantity: 20 },
      { material: { name: "Ball Bearing 6201",   sku: "BRG-6201", unitPrice: 2.20,  unit: "pcs" }, quantity: 4  },
    ],
  },
];

exports.getSchedules = async ({ page = 1, limit = 20, status, line } = {}) => {
  const snap = await get(child(ref(db), "productionSchedules"));
  if (!snap.exists()) {
    for (const s of SCHEDULE_SEED) await set(ref(db, `productionSchedules/${s.id}`), s);
  }
  let schedules = snap.exists() ? Object.values(snap.val()) : SCHEDULE_SEED;
  if (status) schedules = schedules.filter(s => s.status === status);
  if (line)   schedules = schedules.filter(s => s.line === line);
  schedules.sort((a, b) => a.startDate.localeCompare(b.startDate));
  const total = schedules.length;
  const start = (page - 1) * limit;
  return { schedules: schedules.slice(start, start + Number(limit)), total, page, totalPages: Math.ceil(total / limit) };
};

exports.createSchedule = async (data) => {
  const id = `SCH-${Date.now()}`;
  const schedule = { id, ...data };
  await set(ref(db, `productionSchedules/${id}`), schedule);
  return schedule;
};

// ─── Bill of Materials (FIREBASE) ─────────────────────────────────────────────
exports.getBom = async (productId) => {
  // Seed BOM data on first access
  const seedSnap = await get(child(ref(db), "bom"));
  if (!seedSnap.exists()) {
    for (const b of BOM_SEED) await set(ref(db, `bom/${b.id}`), b);
  }
  const bomSnap = await get(child(ref(db), "bom"));
  if (!bomSnap.exists()) throw Object.assign(new Error("BOM not found for this product"), { statusCode: 404 });
  const boms = Object.values(bomSnap.val());
  const bom = boms.find(b => b.productId === productId && b.isActive);
  if (!bom) throw Object.assign(new Error("BOM not found for this product"), { statusCode: 404 });
  return bom;
};
