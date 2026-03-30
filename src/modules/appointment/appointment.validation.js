const Joi = require('joi');
const {
  TIME_SLOTS,
  PAYMENT_METHOD,
  APPOINTMENT_STATUS,
} = require('../../core/constants');

const createAppointmentSchema = Joi.object({
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
    country: Joi.string().default('India'),
  }).required(),
  date: Joi.date().iso().required(),
  timeSlot: Joi.string().valid(...TIME_SLOTS).required(),
  notes: Joi.string().max(500).optional().allow('', null),
  paymentMethod: Joi.string().valid(...Object.values(PAYMENT_METHOD)).required(),
});

const assignStaffSchema = Joi.object({
  staffId: Joi.string().required(),
});

const updateAppointmentStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(APPOINTMENT_STATUS))
    .required(),
});

const appointmentCalendarQuerySchema = Joi.object({
  from: Joi.date().iso().optional(),
  to: Joi.date().iso().optional(),
  status: Joi.string().optional(),
  staffId: Joi.string().optional(),
  userId: Joi.string().optional(),
});

module.exports = {
  createAppointmentSchema,
  assignStaffSchema,
  updateAppointmentStatusSchema,
  appointmentCalendarQuerySchema,
};