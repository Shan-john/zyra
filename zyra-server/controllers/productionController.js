const productionService = require("../services/productionService");
const ApiResponse = require("../utils/apiResponse");

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

exports.getWorkOrders = async (req, res, next) => {
  try {
    const result = await productionService.getWorkOrders(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.createWorkOrder = async (req, res, next) => {
  try {
    const wo = await productionService.createWorkOrder(req.body);
    ApiResponse.created(res, wo, "Work order created");
  } catch (err) { next(err); }
};

exports.updateWorkOrderStatus = async (req, res, next) => {
  try {
    const wo = await productionService.updateWorkOrderStatus(req.params.id, req.body.status);
    ApiResponse.success(res, wo, "Status updated");
  } catch (err) { next(err); }
};

exports.getBom = async (req, res, next) => {
  try {
    const bom = await productionService.getBom(req.params.productId);
    ApiResponse.success(res, bom);
  } catch (err) { next(err); }
};
