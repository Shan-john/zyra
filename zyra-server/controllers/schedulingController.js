const schedulingEngine = require("../services/schedulingEngine");
const ApiResponse = require("../utils/apiResponse");

exports.optimize = async (req, res, next) => {
  try {
    const { jobs, machines, weights, costs, fetchMlRisk } = req.body;

    if (!jobs || !Array.isArray(jobs) || !jobs.length) {
      return ApiResponse.error(res, "jobs array is required and must not be empty", 400);
    }
    if (!machines || !Array.isArray(machines) || !machines.length) {
      return ApiResponse.error(res, "machines array is required and must not be empty", 400);
    }

    const result = await schedulingEngine.optimize({
      jobs,
      machines,
      weights,
      costs,
      fetchMlRisk,
    });

    ApiResponse.success(res, result, "Scheduling optimization completed");
  } catch (err) {
    next(err);
  }
};
