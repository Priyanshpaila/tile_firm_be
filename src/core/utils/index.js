/**
 * Custom application error with status code
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Standardized success response
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Standardized paginated response
 */
const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  });
};

/**
 * Wrap async route handlers to catch promise rejections
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Build pagination query params from request
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build sort object from query string
 */
const getSortOptions = (query, defaults = { createdAt: -1 }) => {
  if (!query.sort) return defaults;
  
  const sortObj = {};
  const sortFields = query.sort.split(',');
  
  for (const field of sortFields) {
    if (field.startsWith('-')) {
      sortObj[field.substring(1)] = -1;
    } else {
      sortObj[field] = 1;
    }
  }
  
  return sortObj;
};

module.exports = {
  AppError,
  successResponse,
  paginatedResponse,
  asyncHandler,
  getPagination,
  getSortOptions,
};
