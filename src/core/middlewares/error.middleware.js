const { NODE_ENV } = require('../../config/env');
const { AppError } = require('../utils');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error in development
  if (NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(`A record with this ${field} already exists.`, 409);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new AppError(messages.join('. '), 400);
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    error = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new AppError('Invalid token.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new AppError('Token has expired.', 401);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = new AppError('File size exceeds the maximum limit.', 400);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = new AppError('Unexpected file field.', 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFoundHandler };
