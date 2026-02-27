const authService = require("../services/authService");
const ApiResponse = require("../utils/apiResponse");

exports.register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    ApiResponse.created(res, result, "User registered successfully");
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    ApiResponse.success(res, result, "Login successful");
  } catch (err) { next(err); }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    ApiResponse.success(res, user);
  } catch (err) { next(err); }
};
