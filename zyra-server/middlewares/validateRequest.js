const ApiResponse = require("../utils/apiResponse");

/**
 * Express middleware factory for Joi schema validation.
 * @param {Object} schema - Joi schema with optional body, query, params keys
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    const errors = [];

    ["body", "query", "params"].forEach((source) => {
      if (schema[source]) {
        const { error } = schema[source].validate(req[source], {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          error.details.forEach((detail) => {
            errors.push({ source, message: detail.message });
          });
        }
      }
    });

    if (errors.length > 0) {
      return ApiResponse.badRequest(res, "Validation failed", errors);
    }

    next();
  };
};

module.exports = validateRequest;
