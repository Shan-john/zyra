const simulationService = require("../services/simulationService");
const ApiResponse = require("../utils/apiResponse");

exports.run = async (req, res, next) => {
  try {
    const result = await simulationService.runScenario({ ...req.body, userId: req.user.id });
    ApiResponse.success(res, result, "Simulation completed");
  } catch (err) { next(err); }
};

exports.getResult = async (req, res, next) => {
  try {
    const result = await simulationService.getResult(req.params.scenarioId);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.listScenarios = async (req, res, next) => {
  try {
    const result = await simulationService.listScenarios(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};
