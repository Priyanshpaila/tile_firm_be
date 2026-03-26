const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/env');
const { AppError } = require('../utils');
const { ROLES } = require('../constants');

/**
 * Authenticate user from JWT cookie or Authorization header
 */
const authenticate = (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    
    // Fallback to Authorization header
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }
    
    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please refresh your session.', 401));
    }
    next(error);
  }
};

/**
 * Optional authentication — attaches user if token present, continues otherwise
 */
const optionalAuth = (req, res, next) => {
  try {
    let token = req.cookies?.accessToken;
    if (!token && req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }
    
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    }
    next();
  } catch {
    // Token invalid/expired — continue without auth
    next();
  }
};

/**
 * Authorize by role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

/**
 * Admin-only middleware shorthand
 */
const adminOnly = authorize(ROLES.ADMIN);

/**
 * Staff or Admin middleware
 */
const staffOrAdmin = authorize(ROLES.STAFF, ROLES.ADMIN);

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  adminOnly,
  staffOrAdmin,
};
