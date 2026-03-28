const express = require('express');
const crypto = require('crypto');
const router = express.Router();

const Staff = require('./staff.model');
const User = require('../auth/auth.model');
const { ROLES } = require('../../core/constants');
const { authenticate, adminOnly } = require('../../core/middlewares/auth.middleware');
const { successResponse, AppError } = require('../../core/utils');

router.use(authenticate, adminOnly);

const normalizeEmail = (email) =>
  typeof email === 'string' ? email.trim().toLowerCase() : '';

const normalizePhone = (phone) =>
  typeof phone === 'string' ? phone.trim() : '';

const buildTempPassword = () => {
  return `Staff@${crypto.randomBytes(4).toString('hex')}`;
};

async function ensureStaffUserUniqueness({
  email,
  phone,
  excludeStaffId,
  excludeUserId,
}) {
  if (phone) {
    const existingStaffByPhone = await Staff.findOne({
      phone,
      ...(excludeStaffId ? { _id: { $ne: excludeStaffId } } : {}),
    });

    if (existingStaffByPhone) {
      throw new AppError('Staff with this phone already exists', 409);
    }

    const existingUserByPhone = await User.findOne({
      phone,
      ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {}),
    });

    if (existingUserByPhone) {
      throw new AppError('User with this phone already exists', 409);
    }
  }

  if (email) {
    const existingStaffByEmail = await Staff.findOne({
      email,
      ...(excludeStaffId ? { _id: { $ne: excludeStaffId } } : {}),
    });

    if (existingStaffByEmail) {
      throw new AppError('Staff with this email already exists', 409);
    }

    const existingUserByEmail = await User.findOne({
      email,
      ...(excludeUserId ? { _id: { $ne: excludeUserId } } : {}),
    });

    if (existingUserByEmail) {
      throw new AppError('User with this email already exists', 409);
    }
  }
}

router.post('/', async (req, res, next) => {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const phone = normalizePhone(req.body.phone);
    const email = normalizeEmail(req.body.email);
    const password =
      typeof req.body.password === 'string' ? req.body.password.trim() : '';

    if (!name) {
      throw new AppError('Name is required', 400);
    }

    if (!phone) {
      throw new AppError('Phone is required', 400);
    }

    if (!email) {
      throw new AppError(
        'Email is required to create a staff login account',
        400
      );
    }

    await ensureStaffUserUniqueness({ email, phone });

    const generatedPassword = password || buildTempPassword();

    const user = await User.create({
      name,
      email,
      password: generatedPassword,
      phone,
      role: ROLES.STAFF,
    });

    try {
      const staff = await Staff.create({
        ...req.body,
        name,
        phone,
        email,
        userAccount: user._id,
      });

      const populatedStaff = await Staff.findById(staff._id).populate(
        'userAccount',
        'name email phone role isActive'
      );

      successResponse(
        res,
        {
          staff: populatedStaff,
          loginAccount: {
            email: user.email,
            role: user.role,
            temporaryPassword: password ? undefined : generatedPassword,
          },
        },
        'Staff created successfully',
        201
      );
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const filter = {};

    if (req.query.isAvailable) {
      filter.isAvailable = req.query.isAvailable === 'true';
    }

    const staffList = await Staff.find(filter)
      .populate('userAccount', 'name email phone role isActive')
      .sort({ name: 1 });

    successResponse(res, { staff: staffList });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const existingStaff = await Staff.findById(req.params.id);

    if (!existingStaff) {
      throw new AppError('Staff not found', 404);
    }

    const nextName =
      typeof req.body.name === 'string'
        ? req.body.name.trim()
        : existingStaff.name;

    const nextPhone = req.body.phone
      ? normalizePhone(req.body.phone)
      : existingStaff.phone;

    const nextEmail =
      req.body.email !== undefined
        ? normalizeEmail(req.body.email)
        : normalizeEmail(existingStaff.email);

    await ensureStaffUserUniqueness({
      email: nextEmail,
      phone: nextPhone,
      excludeStaffId: existingStaff._id,
      excludeUserId: existingStaff.userAccount || undefined,
    });

    const updatePayload = {
      ...req.body,
      name: nextName,
      phone: nextPhone,
      email: nextEmail || undefined,
    };

    const staff = await Staff.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
    });

    let temporaryPassword;

    if (staff.userAccount) {
      const userUpdate = {
        name: nextName,
        phone: nextPhone,
      };

      if (nextEmail) {
        userUpdate.email = nextEmail;
      }

      await User.findByIdAndUpdate(staff.userAccount, userUpdate, {
        new: true,
      });
    } else if (nextEmail) {
      const generatedPassword = buildTempPassword();

      const user = await User.create({
        name: nextName,
        email: nextEmail,
        password: generatedPassword,
        phone: nextPhone,
        role: ROLES.STAFF,
      });

      staff.userAccount = user._id;
      await staff.save();

      temporaryPassword = generatedPassword;
    }

    const populatedStaff = await Staff.findById(staff._id).populate(
      'userAccount',
      'name email phone role isActive'
    );

    successResponse(
      res,
      {
        staff: populatedStaff,
        loginAccount: temporaryPassword
          ? {
              email: nextEmail,
              role: ROLES.STAFF,
              temporaryPassword,
            }
          : undefined,
      },
      'Staff updated successfully'
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;