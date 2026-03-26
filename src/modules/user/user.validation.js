const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  phone: Joi.string().pattern(/^[0-9]{10}$/).optional().allow('', null),
  address: Joi.object({
    street: Joi.string().allow('', null),
    city: Joi.string().allow('', null),
    state: Joi.string().allow('', null),
    pincode: Joi.string().allow('', null),
    country: Joi.string().default('India'),
  }).optional(),
  avatar: Joi.string().uri().optional().allow('', null),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(128).required(),
});

module.exports = { updateProfileSchema, changePasswordSchema };
