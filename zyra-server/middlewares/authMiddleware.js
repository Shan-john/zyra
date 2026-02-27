const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/env");
const ApiResponse = require("../utils/apiResponse");

/**
 * Verify JWT token from Authorization header.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ApiResponse.unauthorized(res, "No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return ApiResponse.unauthorized(res, "Invalid or expired token");
  }
};

module.exports = authMiddleware;
