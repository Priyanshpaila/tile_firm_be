const Appointment = require('./appointment.model');
const Staff = require('../staff/staff.model');
const { AppError } = require('../../core/utils');
const {
  APPOINTMENT_STATUS,
  PAYMENT_METHOD,
} = require('../../core/constants');

function getDayRange(inputDate) {
  const date = new Date(inputDate);

  if (Number.isNaN(date.getTime())) {
    throw new AppError('Invalid date', 400);
  }

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function buildDateRangeFilter(query) {
  const filter = {};

  if (query.from || query.to) {
    filter.date = {};

    if (query.from) {
      const from = new Date(query.from);
      from.setHours(0, 0, 0, 0);
      filter.date.$gte = from;
    }

    if (query.to) {
      const to = new Date(query.to);
      to.setHours(23, 59, 59, 999);
      filter.date.$lte = to;
    }
  }

  return filter;
}

class AppointmentService {
  static async createAppointment(userId, data) {
    const { start, end } = getDayRange(data.date);

    const existingCount = await Appointment.countDocuments({
      date: { $gte: start, $lte: end },
      timeSlot: data.timeSlot,
      status: { $ne: APPOINTMENT_STATUS.CANCELLED },
    });

    if (existingCount > 5) {
      throw new AppError('This time slot is full. Please select another slot.', 409);
    }

    const ticketNumber = `TV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const appointmentData = {
      ...data,
      date: start,
      user: userId,
      ticketNumber,
      status:
        data.paymentMethod === PAYMENT_METHOD.CASH
          ? APPOINTMENT_STATUS.CONFIRMED
          : APPOINTMENT_STATUS.CREATED,
    };

    return Appointment.create(appointmentData);
  }

  static async getUserAppointments(userId, query = {}) {
    const filter = {
      user: userId,
      ...buildDateRangeFilter(query),
    };

    return Appointment.find(filter)
      .populate('staff', 'name phone email isAvailable')
      .sort({ date: 1, timeSlot: 1 });
  }

  static async getStaffAppointments(userId, query = {}) {
    const staff = await Staff.findOne({ userAccount: userId });

    if (!staff) {
      throw new AppError('Staff profile not found', 404);
    }

    const filter = {
      staff: staff._id,
      ...buildDateRangeFilter(query),
    };

    if (query.status) {
      filter.status = query.status;
    }

    return Appointment.find(filter)
      .populate('user', 'name email phone')
      .populate('staff', 'name phone email isAvailable')
      .sort({ date: 1, timeSlot: 1 });
  }

  static async getAllAppointments(query = {}) {
    const filter = {
      ...buildDateRangeFilter(query),
    };

    if (query.status) filter.status = query.status;
    if (query.staffId) filter.staff = query.staffId;
    if (query.userId) filter.user = query.userId;

    if (query.date) {
      const { start, end } = getDayRange(query.date);
      filter.date = { $gte: start, $lte: end };
    }

    return Appointment.find(filter)
      .populate('user', 'name email phone')
      .populate('staff', 'name phone email isAvailable')
      .sort({ date: 1, timeSlot: 1 });
  }

  static async getCalendarAppointments(query = {}) {
    const filter = {
      ...buildDateRangeFilter(query),
    };

    if (query.status) filter.status = query.status;
    if (query.staffId) filter.staff = query.staffId;
    if (query.userId) filter.user = query.userId;

    return Appointment.find(filter)
      .populate('user', 'name email phone')
      .populate('staff', 'name phone email isAvailable')
      .sort({ date: 1, timeSlot: 1 });
  }

  static async assignStaff(appointmentId, staffId) {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) throw new AppError('Appointment not found', 404);

    if (
      appointment.status === APPOINTMENT_STATUS.CANCELLED ||
      appointment.status === APPOINTMENT_STATUS.CLOSED
    ) {
      throw new AppError(
        'Cannot assign staff to a cancelled or closed appointment',
        400
      );
    }

    const staff = await Staff.findById(staffId);

    if (!staff) {
      throw new AppError('Staff not found', 404);
    }

    if (staff.isAvailable === false) {
      throw new AppError('Selected staff is currently unavailable', 409);
    }

    const conflict = await Appointment.findOne({
      staff: staffId,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      _id: { $ne: appointmentId },
      status: {
        $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.CLOSED],
      },
    });

    if (conflict) {
      throw new AppError('Staff is already booked for this time slot', 409);
    }

    appointment.staff = staffId;
    appointment.status = APPOINTMENT_STATUS.ASSIGNED;
    await appointment.save();

    return Appointment.findById(appointment._id)
      .populate('user', 'name email phone')
      .populate('staff', 'name phone email isAvailable');
  }

  static async updateStatus(appointmentId, status) {
    const validStatuses = Object.values(APPOINTMENT_STATUS);

    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    )
      .populate('user', 'name email phone')
      .populate('staff', 'name phone email isAvailable');

    if (!appointment) throw new AppError('Appointment not found', 404);

    return appointment;
  }
}

module.exports = AppointmentService;