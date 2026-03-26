const express = require('express');
const router = express.Router();
const User = require('../auth/auth.model');
const Product = require('../product/product.model');
const Appointment = require('../appointment/appointment.model');
const Upload = require('../upload/upload.model');
const { authenticate, adminOnly } = require('../../core/middlewares/auth.middleware');
const { successResponse } = require('../../core/utils');

router.use(authenticate, adminOnly);

/**
 * Get dashboard aggregated statistics
 */
router.get('/stats', async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalAppointments,
      totalUploads,
      recentAppointments
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Appointment.countDocuments(),
      Upload.countDocuments(),
      Appointment.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email').populate('staff', 'name')
    ]);

    const stats = {
      totalUsers,
      totalProducts,
      totalAppointments,
      totalUploads,
      recentAppointments
    };

    successResponse(res, { stats });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
