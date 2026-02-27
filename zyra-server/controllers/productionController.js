const productionService = require("../services/productionService");
const ApiResponse = require("../utils/apiResponse");

// ─── Machines ────────────────────────────────────────────────────────────────
exports.getMachines = async (req, res, next) => {
  try {
    const machines = await productionService.getMachines(req.query);
    ApiResponse.success(res, machines);
  } catch (err) { next(err); }
};

exports.createMachine = async (req, res, next) => {
  try {
    const machine = await productionService.createMachine(req.body);
    ApiResponse.created(res, machine, "Machine added successfully");
  } catch (err) { next(err); }
};

exports.updateMachine = async (req, res, next) => {
  try {
    const machine = await productionService.updateMachine(req.params.id, req.body);
    ApiResponse.success(res, machine, "Machine updated successfully");
  } catch (err) { next(err); }
};

exports.deleteMachine = async (req, res, next) => {
  try {
    await productionService.deleteMachine(req.params.id);
    ApiResponse.success(res, null, "Machine deleted successfully");
  } catch (err) { next(err); }
};

// ─── Work Orders ─────────────────────────────────────────────────────────────
exports.getWorkOrders = async (req, res, next) => {
  try {
    const result = await productionService.getWorkOrders(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.createWorkOrder = async (req, res, next) => {
  try {
    const wo = await productionService.createWorkOrder(req.body);
    ApiResponse.created(res, wo, "Work order created successfully");
  } catch (err) { next(err); }
};

exports.updateWorkOrder = async (req, res, next) => {
  try {
    const wo = await productionService.updateWorkOrder(req.params.id, req.body);
    ApiResponse.success(res, wo, "Work order updated successfully");
  } catch (err) { next(err); }
};

exports.deleteWorkOrder = async (req, res, next) => {
  try {
    await productionService.deleteWorkOrder(req.params.id);
    ApiResponse.success(res, null, "Work order deleted successfully");
  } catch (err) { next(err); }
};

// ─── Schedules & BOM (Legacy/Existing) ───────────────────────────────────────
exports.getSchedules = async (req, res, next) => {
  try {
    const result = await productionService.getSchedules(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.createSchedule = async (req, res, next) => {
  try {
    const schedule = await productionService.createSchedule(req.body);
    ApiResponse.created(res, schedule, "Schedule created");
  } catch (err) { next(err); }
};

exports.getBom = async (req, res, next) => {
  try {
    const bom = await productionService.getBom(req.params.productId);
    ApiResponse.success(res, bom);
  } catch (err) { next(err); }
};
