const hrService = require("../services/hrService");
const ApiResponse = require("../utils/apiResponse");

exports.getEmployees = async (req, res, next) => {
  try {
    const result = await hrService.getEmployees(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.addEmployee = async (req, res, next) => {
  try {
    const employee = await hrService.addEmployee(req.body);
    ApiResponse.created(res, employee, "Employee added");
  } catch (err) { next(err); }
};

exports.getAttendance = async (req, res, next) => {
  try {
    const records = await hrService.getAttendance(req.query);
    ApiResponse.success(res, records);
  } catch (err) { next(err); }
};

exports.clockInOut = async (req, res, next) => {
  try {
    const record = await hrService.clockInOut(req.body);
    ApiResponse.success(res, record);
  } catch (err) { next(err); }
};

exports.getPayroll = async (req, res, next) => {
  try {
    const records = await hrService.getPayroll(req.query);
    ApiResponse.success(res, records);
  } catch (err) { next(err); }
};
