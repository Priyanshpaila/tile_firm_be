const Joi = require('joi');
const { PRODUCT_FINISH, PRODUCT_USAGE, PRODUCT_MATERIAL, TILE_SIZES } = require('../../core/constants');

const createProductSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  sku: Joi.string().required(),
  price: Joi.number().min(0).required(),
  discountPrice: Joi.number().min(0).optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).required(),
  category: Joi.string().hex().length(24).required(),
  finishes: Joi.array().items(Joi.string().valid(...PRODUCT_FINISH)).min(1).required(),
  usages: Joi.array().items(Joi.string().valid(...PRODUCT_USAGE)).min(1).required(),
  material: Joi.string().valid(...PRODUCT_MATERIAL).required(),
  sizes: Joi.array().items(Joi.string().valid(...TILE_SIZES)).min(1).required(),
  thickness: Joi.string().optional(),
  boxCoverage: Joi.number().optional(),
  piecesPerBox: Joi.number().optional(),
  inStock: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
});

const updateProductSchema = Joi.object({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  sku: Joi.string().optional(),
  price: Joi.number().min(0).optional(),
  discountPrice: Joi.number().min(0).optional(),
  images: Joi.array().items(Joi.string().uri()).min(1).optional(),
  category: Joi.string().hex().length(24).optional(),
  finishes: Joi.array().items(Joi.string().valid(...PRODUCT_FINISH)).min(1).optional(),
  usages: Joi.array().items(Joi.string().valid(...PRODUCT_USAGE)).min(1).optional(),
  material: Joi.string().valid(...PRODUCT_MATERIAL).optional(),
  sizes: Joi.array().items(Joi.string().valid(...TILE_SIZES)).min(1).optional(),
  thickness: Joi.string().optional(),
  boxCoverage: Joi.number().optional(),
  piecesPerBox: Joi.number().optional(),
  inStock: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
});

module.exports = { createProductSchema, updateProductSchema };
