const qualityService = require("../services/qualityService");
const ApiResponse = require("../utils/apiResponse");

exports.getInspections = async (req, res, next) => {
  try {
    const result = await qualityService.getInspections(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.logInspection = async (req, res, next) => {
  try {
    const inspection = await qualityService.logInspection(req.body);
    ApiResponse.created(res, inspection, "Inspection logged");
  } catch (err) { next(err); }
};

exports.getDefects = async (req, res, next) => {
  try {
    const analytics = await qualityService.getDefectAnalytics(req.query);
    ApiResponse.success(res, analytics);
  } catch (err) { next(err); }
};
