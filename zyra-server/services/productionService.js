const ProductionSchedule = require("../models/ProductionSchedule");
const WorkOrder = require("../models/WorkOrder");
const BillOfMaterials = require("../models/BillOfMaterials");
const Machine = require("../models/Machine");

// ─── Machines ────────────────────────────────────────────────────────────────
exports.getMachines = async (query = {}) => {
  let machines = await Machine.find(query).sort({ machineId: 1 }).lean();

  // Seed default data if database is empty
  if (machines.length === 0) {
    const MACHINE_SEED = require("../data/machineSeed"); // We'll create this temporarily below, or just inline it
    await Machine.insertMany(MACHINE_SEED);
    machines = await Machine.find(query).sort({ machineId: 1 }).lean();
  }
  return machines;
};

exports.createMachine = async (data) => {
  return Machine.create(data);
};

exports.updateMachine = async (id, data) => {
  const machine = await Machine.findOneAndUpdate({ machineId: id }, data, { new: true });
  // Fallback to _id if machineId wasn't used
  if (!machine) {
    return Machine.findByIdAndUpdate(id, data, { new: true });
  }
  return machine;
};

exports.deleteMachine = async (id) => {
  let result = await Machine.findOneAndDelete({ machineId: id });
  if (!result) result = await Machine.findByIdAndDelete(id);
  return result;
};

// ─── Work Orders ─────────────────────────────────────────────────────────────
exports.getWorkOrders = async (query = {}) => {
  let workOrders = await WorkOrder.find(query).sort({ dueDate: 1, orderNumber: 1 }).lean();

  // Seed default data if database is empty
  if (workOrders.length === 0) {
    const WORK_ORDER_SEED = [
      { orderNumber: "WO-1001", job: "Steel Frame Assembly", machine: "Assembly Line A", hours: 3, priority: "High", status: "In Progress" },
      { orderNumber: "WO-1002", job: "CNC Shaft Machining", machine: "CNC Machine #1", hours: 2, priority: "Medium", status: "Queued" },
      { orderNumber: "WO-1003", job: "Precision Gear Cutting", machine: "CNC Machine #2", hours: 4, priority: "High", status: "In Progress" },
      { orderNumber: "WO-1004", job: "Aluminum Die Casting", machine: "Casting Station", hours: 5, priority: "Low", status: "Queued" },
      { orderNumber: "WO-1005", job: "Surface Heat Treatment", machine: "Heat Treatment Oven", hours: 6, priority: "Medium", status: "Complete" },
    ];
    await WorkOrder.insertMany(WORK_ORDER_SEED);
    workOrders = await WorkOrder.find(query).sort({ orderNumber: 1 }).lean();
  }
  return workOrders;
};

exports.createWorkOrder = async (data) => {
  return WorkOrder.create(data);
};

exports.updateWorkOrder = async (id, data) => {
  let wo = await WorkOrder.findOneAndUpdate({ orderNumber: id }, data, { new: true });
  if (!wo) wo = await WorkOrder.findByIdAndUpdate(id, data, { new: true });
  return wo;
};

exports.deleteWorkOrder = async (id) => {
  let wo = await WorkOrder.findOneAndDelete({ orderNumber: id });
  if (!wo) wo = await WorkOrder.findByIdAndDelete(id);
  return wo;
};

// ─── Production Schedules ────────────────────────────────────────────────────
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

// ─── Bill of Materials ───────────────────────────────────────────────────────
exports.getBom = async (productId) => {
  const bom = await BillOfMaterials.findOne({ product: productId, isActive: true })
    .populate("items.material", "name sku unitPrice unit")
    .lean();

  if (!bom) throw Object.assign(new Error("BOM not found for this product"), { statusCode: 404 });
  return bom;
};
