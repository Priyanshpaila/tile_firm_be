const express = require('express');
const router = express.Router();
const Staff = require('./staff.model');
const { authenticate, adminOnly } = require('../../core/middlewares/auth.middleware');
const { successResponse, AppError } = require('../../core/utils');

router.use(authenticate, adminOnly);

router.post('/', async (req, res, next) => {
  try {
    const existing = await Staff.findOne({ phone: req.body.phone });
    if (existing) throw new AppError('Staff with this phone already exists', 409);

    const staff = await Staff.create(req.body);
    successResponse(res, { staff }, 'Staff created successfully', 201);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.isAvailable) filter.isAvailable = req.query.isAvailable === 'true';

    const staffList = await Staff.find(filter).sort({ name: 1 });
    successResponse(res, { staff: staffList });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!staff) throw new AppError('Staff not found', 404);
    
    successResponse(res, { staff }, 'Staff updated successfully');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
