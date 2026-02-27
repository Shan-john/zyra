const inventoryService = require("../services/inventoryService");
const ApiResponse = require("../utils/apiResponse");

exports.getAll = async (req, res, next) => {
  try {
    const result = await inventoryService.getAll(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const item = await inventoryService.getById(req.params.id);
    ApiResponse.success(res, item);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const item = await inventoryService.addItem(req.body);
    ApiResponse.created(res, item, "Inventory item created");
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const item = await inventoryService.updateItem(req.params.id, req.body);
    ApiResponse.success(res, item, "Item updated");
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    await inventoryService.deleteItem(req.params.id);
    ApiResponse.success(res, null, "Item deleted");
  } catch (err) { next(err); }
};

exports.getAlerts = async (req, res, next) => {
  try {
    const alerts = await inventoryService.getAlerts();
    ApiResponse.success(res, alerts);
  } catch (err) { next(err); }
};
