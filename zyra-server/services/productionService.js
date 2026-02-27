const ProductionSchedule = require("../models/ProductionSchedule");
const WorkOrder = require("../models/WorkOrder");
const BillOfMaterials = require("../models/BillOfMaterials");

// ─── Production Schedules ──────────────────────────────────

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

// ─── Work Orders ───────────────────────────────────────────

exports.getWorkOrders = async ({ page = 1, limit = 20, status }) => {
  const query = {};
  if (status) query.status = status;

  const workOrders = await WorkOrder.find(query)
    .populate("product", "name sku")
    .populate("schedule", "title line")
    .sort({ dueDate: 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await WorkOrder.countDocuments(query);
  return { workOrders, total, page, totalPages: Math.ceil(total / limit) };
};

exports.createWorkOrder = async (data) => {
  return WorkOrder.create(data);
};

exports.updateWorkOrderStatus = async (id, status) => {
  const update = { status };
  if (status === "completed") update.completedDate = new Date();

  const workOrder = await WorkOrder.findByIdAndUpdate(id, update, { new: true });
  if (!workOrder) throw Object.assign(new Error("Work order not found"), { statusCode: 404 });
  return workOrder;
};

// ─── Bill of Materials ─────────────────────────────────────

exports.getBom = async (productId) => {
  const bom = await BillOfMaterials.findOne({ product: productId, isActive: true })
    .populate("items.material", "name sku unitPrice unit")
    .lean();

  if (!bom) throw Object.assign(new Error("BOM not found for this product"), { statusCode: 404 });
  return bom;
};
