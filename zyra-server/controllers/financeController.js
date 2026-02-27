const financeService = require("../services/financeService");
const ApiResponse = require("../utils/apiResponse");

exports.getLedger = async (req, res, next) => {
  try {
    const result = await financeService.getLedger(req.query);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.createEntry = async (req, res, next) => {
  try {
    const entry = await financeService.createEntry({ ...req.body, createdBy: req.user.id });
    ApiResponse.created(res, entry, "Ledger entry created");
  } catch (err) { next(err); }
};

exports.getPnL = async (req, res, next) => {
  try {
    const report = await financeService.getPnL(req.query);
    ApiResponse.success(res, report);
  } catch (err) { next(err); }
};

exports.getCashFlow = async (req, res, next) => {
  try {
    const cashFlow = await financeService.getCashFlow(req.query);
    ApiResponse.success(res, cashFlow);
  } catch (err) { next(err); }
};
