const supplyChainService = require("../services/supplyChainService");
const ApiResponse = require("../utils/apiResponse");

exports.getSuppliers = async (req, res, next) => {
  try {
    const result = await supplyChainService.getSuppliers(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.addSupplier = async (req, res, next) => {
  try {
    const supplier = await supplyChainService.addSupplier(req.body);
    ApiResponse.created(res, supplier, "Supplier added");
  } catch (err) { next(err); }
};

exports.getPurchaseOrders = async (req, res, next) => {
  try {
    const result = await supplyChainService.getPurchaseOrders(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.createPurchaseOrder = async (req, res, next) => {
  try {
    const po = await supplyChainService.createPurchaseOrder(req.body);
    ApiResponse.created(res, po, "Purchase order created");
  } catch (err) { next(err); }
};

exports.receiveOrder = async (req, res, next) => {
  try {
    const po = await supplyChainService.receiveOrder(req.params.id);
    ApiResponse.success(res, po, "Order received");
  } catch (err) { next(err); }
};
