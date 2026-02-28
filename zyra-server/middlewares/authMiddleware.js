/**
 * Mock auth middleware to remove authentication.
 * Injects a dummy admin user into every request.
 */
const authMiddleware = (req, res, next) => {
  req.user = { id: "mock-admin-id", email: "admin@zyra.com", role: "admin", name: "System Admin" };
  next();
};

module.exports = authMiddleware;
