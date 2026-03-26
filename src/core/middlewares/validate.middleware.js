const { AppError } = require('../utils');

/**
 * Creates a Joi validation middleware for a given schema and source
 * @param {Object} schema - Joi validation schema
 * @param {string} source - 'body', 'query', or 'params'
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join('. ');
      return next(new AppError(messages, 400));
    }

    // Replace request data with validated/sanitized values
    req[source] = value;
    next();
  };
};

module.exports = { validate };
