const Razorpay = require('razorpay');
const crypto = require('crypto');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET } = require('../../config/env');
const Appointment = require('../appointment/appointment.model');
const { AppError } = require('../../core/utils');
const { PAYMENT_STATUS, APPOINTMENT_STATUS } = require('../../core/constants');

class PaymentService {
  constructor() {
    if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
      });
    }
  }

  /**
   * Create Razorpay order for an appointment
   */
  async createPaymentOrder(appointmentId, userId) {
    if (!this.razorpay) throw new AppError('Payment gateway not configured', 501);

    const appointment = await Appointment.findOne({ _id: appointmentId, user: userId });
    
    if (!appointment) throw new AppError('Appointment not found', 404);
    if (appointment.paymentStatus === PAYMENT_STATUS.COMPLETED) {
      throw new AppError('Payment already completed for this appointment', 400);
    }

    const options = {
      amount: appointment.visitFee * 100, // Amount in paise
      currency: 'INR',
      receipt: appointment.ticketNumber,
      payment_capture: 1, // Auto capture
    };

    const order = await this.razorpay.orders.create(options);
    
    // Save order ID to appointment
    appointment.razorpayOrderId = order.id;
    await appointment.save();

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: RAZORPAY_KEY_ID,
    };
  }

  /**
   * Verify Razorpay payment signature
   */
  async verifyPayment(orderId, paymentId, signature) {
    if (!this.razorpay) throw new AppError('Payment gateway not configured', 501);

    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new AppError('Invalid payment signature', 400);
    }

    // Update appointment status
    const appointment = await Appointment.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { 
        razorpayPaymentId: paymentId,
        paymentStatus: PAYMENT_STATUS.COMPLETED,
        status: APPOINTMENT_STATUS.CONFIRMED // Move from CREATED to CONFIRMED
      },
      { new: true }
    );

    if (!appointment) throw new AppError('Associated appointment not found', 404);

    return appointment;
  }
}

module.exports = new PaymentService();
