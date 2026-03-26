const mongoose = require('mongoose');
const { APPOINTMENT_STATUS, PAYMENT_STATUS, PAYMENT_METHOD, TIME_SLOTS } = require('../../core/constants');

const appointmentSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    date: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      enum: TIME_SLOTS,
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: Object.values(APPOINTMENT_STATUS),
      default: APPOINTMENT_STATUS.CREATED,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    visitFee: {
      type: Number,
      required: true,
      default: 500, // INR 500 fixed visitation fee
    },
    razorpayOrderId: {
      type: String,
    },
    razorpayPaymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double booking at schema level (date + timeslot + staff)
appointmentSchema.index({ date: 1, timeSlot: 1, staff: 1 }, { unique: true, partialFilterExpression: { staff: { $type: 'objectId' } } });

module.exports = mongoose.model('Appointment', appointmentSchema);
