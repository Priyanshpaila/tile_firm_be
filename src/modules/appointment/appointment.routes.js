const express = require('express');
const router = express.Router();
const AppointmentService = require('./appointment.service');
const { validate } = require('../../core/middlewares/validate.middleware');
const {
  createAppointmentSchema,
  assignStaffSchema,
  updateAppointmentStatusSchema,
  appointmentCalendarQuerySchema,
} = require('./appointment.validation');
const { authenticate, adminOnly } = require('../../core/middlewares/auth.middleware');
const { successResponse, AppError } = require('../../core/utils');
const { ROLES } = require('../../core/constants');

router.use(authenticate);

// User routes
router.post('/', validate(createAppointmentSchema), async (req, res, next) => {
  try {
    const appointment = await AppointmentService.createAppointment(req.user.id, req.body);
    successResponse(res, { appointment }, 'Appointment created', 201);
  } catch (error) {
    next(error);
  }
});

router.get('/my-appointments', async (req, res, next) => {
  try {
    const appointments = await AppointmentService.getUserAppointments(req.user.id, req.query);
    successResponse(res, { appointments });
  } catch (error) {
    next(error);
  }
});

// Staff routes
router.get('/staff/my-appointments', async (req, res, next) => {
  try {
    if (req.user.role !== ROLES.STAFF) {
      throw new AppError('Only staff can access assigned appointments', 403);
    }

    const appointments = await AppointmentService.getStaffAppointments(req.user.id, req.query);
    successResponse(res, { appointments });
  } catch (error) {
    next(error);
  }
});

// Admin routes
router.get('/', adminOnly, async (req, res, next) => {
  try {
    const appointments = await AppointmentService.getAllAppointments(req.query);
    successResponse(res, { appointments });
  } catch (error) {
    next(error);
  }
});

router.get(
  '/calendar',
  adminOnly,
  validate(appointmentCalendarQuerySchema, 'query'),
  async (req, res, next) => {
    try {
      const appointments = await AppointmentService.getCalendarAppointments(req.query);
      successResponse(res, { appointments });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id/assign',
  adminOnly,
  validate(assignStaffSchema),
  async (req, res, next) => {
    try {
      const { staffId } = req.body;
      const appointment = await AppointmentService.assignStaff(req.params.id, staffId);
      successResponse(res, { appointment }, 'Staff assigned successfully');
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/:id/status',
  adminOnly,
  validate(updateAppointmentStatusSchema),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const appointment = await AppointmentService.updateStatus(req.params.id, status);
      successResponse(res, { appointment }, `Appointment marked as ${status}`);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;