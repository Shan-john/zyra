const maintenanceEngine = require("../services/maintenanceSimulationEngine");
const ApiResponse = require("../utils/apiResponse");

exports.runSimulation = async (req, res, next) => {
  try {
    const { equipment, costParams } = req.body;

    if (!equipment || !equipment.equipment_id) {
      return ApiResponse.error(res, "equipment.equipment_id is required", 400);
    }

    const result = await maintenanceEngine.runSimulation({ equipment, costParams });
    ApiResponse.success(res, result, "Maintenance simulation completed");
  } catch (err) {
    next(err);
  }
};
