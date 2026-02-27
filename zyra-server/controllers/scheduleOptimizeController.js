const scheduleService = require("../services/scheduleOptimizeService");
const ApiResponse = require("../utils/apiResponse");

exports.optimize = (req, res, next) => {
  try {
    const {
      throughputWeight = 1,
      downtimeWeight = 0.8,
      maintenanceWeight = 0.5,
    } = req.body;

    const result = scheduleService.optimize({
      throughputWeight: Number(throughputWeight),
      downtimeWeight: Number(downtimeWeight),
      maintenanceWeight: Number(maintenanceWeight),
    });

    ApiResponse.success(res, result, "Schedule optimized");
  } catch (err) {
    next(err);
  }
};
