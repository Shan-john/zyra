/**
 * Uniform API response helper.
 * All controller responses should use these methods.
 */

class ApiResponse {
  static success(res, data = null, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static created(res, data = null, message = "Resource created") {
    return ApiResponse.success(res, data, message, 201);
  }

  static error(res, message = "Something went wrong", statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static notFound(res, message = "Resource not found") {
    return ApiResponse.error(res, message, 404);
  }

  static unauthorized(res, message = "Unauthorized") {
    return ApiResponse.error(res, message, 401);
  }

  static forbidden(res, message = "Forbidden") {
    return ApiResponse.error(res, message, 403);
  }

  static badRequest(res, message = "Bad request", errors = null) {
    return ApiResponse.error(res, message, 400, errors);
  }
}

module.exports = ApiResponse;
