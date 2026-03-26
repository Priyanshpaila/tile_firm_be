const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(500).optional().allow('', null),
  image: Joi.string().uri().optional().allow('', null),
  isActive: Joi.boolean().optional(),
  parentCategory: Joi.string().hex().length(24).optional().allow('', null),
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(500).optional().allow('', null),
  image: Joi.string().uri().optional().allow('', null),
  isActive: Joi.boolean().optional(),
  parentCategory: Joi.string().hex().length(24).optional().allow('', null),
});

module.exports = { createCategorySchema, updateCategorySchema };
