const express = require('express');
const router = express.Router();
const PaymentService = require('./payment.service');
const { authenticate } = require('../../core/middlewares/auth.middleware');
const { successResponse } = require('../../core/utils');

// Razorpay webhook - no auth middleware because it's called by Razorpay
router.post('/webhook', (req, res) => {
  // In a real app, verify `X-Razorpay-Signature` header here.
  // For MVP, we resolve verified manually via the frontend callback route.
  res.status(200).send('OK');
});

router.use(authenticate);

router.post('/create-order', async (req, res, next) => {
  try {
    const { appointmentId } = req.body;
    const orderDetails = await PaymentService.createPaymentOrder(appointmentId, req.user.id);
    successResponse(res, orderDetails, 'Order created successfully');
  } catch (error) {
    next(error);
  }
});

router.post('/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const appointment = await PaymentService.verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
    successResponse(res, { appointment }, 'Payment verified and appointment confirmed');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
