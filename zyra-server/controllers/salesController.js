const salesService = require("../services/salesService");
const ApiResponse = require("../utils/apiResponse");

exports.getOrders = async (req, res, next) => {
  try {
    const result = await salesService.getOrders(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.createOrder = async (req, res, next) => {
  try {
    const order = await salesService.createOrder({ ...req.body, createdBy: req.user.id });
    ApiResponse.created(res, order, "Sales order created");
  } catch (err) { next(err); }
};

exports.getInvoices = async (req, res, next) => {
  try {
    const result = await salesService.getInvoices(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.generateInvoice = async (req, res, next) => {
  try {
    const invoice = await salesService.generateInvoice(req.body.salesOrderId);
    ApiResponse.created(res, invoice, "Invoice generated");
  } catch (err) { next(err); }
};

exports.getForecast = async (req, res, next) => {
  try {
    const forecast = await salesService.getDemandForecast();
    ApiResponse.success(res, forecast);
  } catch (err) { next(err); }
};
