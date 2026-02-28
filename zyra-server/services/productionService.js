const ProductionSchedule = require("../models/ProductionSchedule");
const BillOfMaterials = require("../models/BillOfMaterials");

const { db } = require("../config/firebase");
const { ref, get, set, remove, child } = require("firebase/database");

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

// ─── Production Schedules (MONGOOSE) ────────────────────────────────────
exports.getSchedules = async ({ page = 1, limit = 20, status, line }) => {
  const query = {};
  if (status) query.status = status;
  if (line) query.line = line;

  const schedules = await ProductionSchedule.find(query)
    .populate("product", "name sku")
    .populate("assignedTo", "name")
    .sort({ startDate: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await ProductionSchedule.countDocuments(query);
  return { schedules, total, page, totalPages: Math.ceil(total / limit) };
};

exports.createSchedule = async (data) => {
  return ProductionSchedule.create(data);
};

// ─── Bill of Materials (MONGOOSE) ─────────────────────────────────────────
exports.getBom = async (productId) => {
  const bom = await BillOfMaterials.findOne({ product: productId, isActive: true })
    .populate("items.material", "name sku unitPrice unit")
    .lean();

  if (!bom) throw Object.assign(new Error("BOM not found for this product"), { statusCode: 404 });
  return bom;
};
