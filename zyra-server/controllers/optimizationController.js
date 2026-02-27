const optimizationService = require("../services/optimizationService");
const ApiResponse = require("../utils/apiResponse");

exports.run = async (req, res, next) => {
  try {
    const result = await optimizationService.run({ ...req.body, userId: req.user.id });
    ApiResponse.success(res, result, "Optimization completed");
  } catch (err) { next(err); }
};

exports.getResult = async (req, res, next) => {
  try {
    const result = await optimizationService.getResult(req.params.runId);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const result = await optimizationService.getHistory(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};
