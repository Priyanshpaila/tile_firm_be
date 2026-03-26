const Joi = require('joi');
const { TIME_SLOTS, PAYMENT_METHOD } = require('../../core/constants');

const createAppointmentSchema = Joi.object({
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
    country: Joi.string().default('India'),
  }).required(),
  date: Joi.date().iso().min('now').required(),
  timeSlot: Joi.string().valid(...TIME_SLOTS).required(),
  notes: Joi.string().max(500).optional().allow('', null),
  paymentMethod: Joi.string().valid(...Object.values(PAYMENT_METHOD)).required(),
});

module.exports = { createAppointmentSchema };
