const ApiResponse = require("../utils/apiResponse");

/**
 * Role-based access control middleware.
 * @param  {...string} allowedRoles - Roles that can access the route
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return ApiResponse.forbidden(res, "No role assigned");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Access denied. Required role: ${allowedRoles.join(" or ")}`
      );
    }

    next();
  };
};

module.exports = roleMiddleware;
