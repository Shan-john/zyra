/**
 * Mock role middleware that assumes the user has required permissions.
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    next();
  };
};

module.exports = roleMiddleware;
