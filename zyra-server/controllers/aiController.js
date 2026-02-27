const aiService = require("../services/aiService");
const mlBridgeService = require("../services/mlBridgeService");
const ApiResponse = require("../utils/apiResponse");

exports.explain = async (req, res, next) => {
  try {
    const result = await aiService.explain({ ...req.body, userId: req.user.id });
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.getCached = async (req, res, next) => {
  try {
    const result = await aiService.getCached(req.params.id);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.summarize = async (req, res, next) => {
  try {
    const result = await aiService.summarize({ ...req.body, userId: req.user.id });
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.predictFailure = async (req, res, next) => {
  try {
    const result = await mlBridgeService.predictFailure(req.body);
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};

exports.mlHealth = async (req, res, next) => {
  try {
    const result = await mlBridgeService.healthCheck();
    ApiResponse.success(res, result);
  } catch (err) { next(err); }
};
