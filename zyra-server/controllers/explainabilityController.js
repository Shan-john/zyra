const explainabilityService = require("../services/explainabilityService");
const ApiResponse = require("../utils/apiResponse");

exports.explainDecision = async (req, res, next) => {
  try {
    const {
      machine_metrics,
      failure_probability,
      feature_importance,
      scheduling_decision,
      deferred_jobs,
      adjusted_weights,
    } = req.body;

    // Validate required fields
    if (failure_probability === undefined || !scheduling_decision) {
      return ApiResponse.error(
        res,
        "failure_probability and scheduling_decision are required",
        400
      );
    }

    const result = await explainabilityService.explainDecision({
      machine_metrics,
      failure_probability,
      feature_importance,
      scheduling_decision,
      deferred_jobs,
      adjusted_weights,
    });

    ApiResponse.success(res, result.data, "Explanation generated successfully");
  } catch (err) {
    next(err);
  }
};
