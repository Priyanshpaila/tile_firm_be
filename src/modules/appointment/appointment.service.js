const Appointment = require('./appointment.model');
const { AppError } = require('../../core/utils');
const { APPOINTMENT_STATUS, PAYMENT_METHOD, PAYMENT_STATUS } = require('../../core/constants');

class AppointmentService {
  /**
   * Create a new appointment booking
   */
  static async createAppointment(userId, data) {
    // Check if slot is heavily booked (allow multiple unassigned, but ideally system checks availability)
    const existingCount = await Appointment.countDocuments({
      date: new Date(data.date),
      timeSlot: data.timeSlot,
      status: { $ne: APPOINTMENT_STATUS.CANCELLED }
    });

    if (existingCount > 5) { // Arbitrary limit for unassigned bookings per slot
      throw new AppError('This time slot is full. Please select another slot.', 409);
    }

    const ticketNumber = `TV-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    const appointmentData = {
      ...data,
      user: userId,
      ticketNumber,
      // If cash, mark status as pending until visit. If online, keep as created until payment verifies.
      status: data.paymentMethod === PAYMENT_METHOD.CASH ? APPOINTMENT_STATUS.CONFIRMED : APPOINTMENT_STATUS.CREATED,
    };

    return Appointment.create(appointmentData);
  }

  /**
   * Get user's appointments
   */
  static async getUserAppointments(userId) {
    return Appointment.find({ user: userId })
      .populate('staff', 'name phone')
      .sort({ date: 1, timeSlot: 1 });
  }

  /**
   * Admin: Get all appointments
   */
  static async getAllAppointments(query) {
    const filter = {};
    if (query.status) filter.status = query.status;
    if (query.date) filter.date = new Date(query.date);

    return Appointment.find(filter)
      .populate('user', 'name email phone')
      .populate('staff', 'name phone isAvailable')
      .sort({ date: -1 });
  }

  /**
   * Admin: Assign staff to appointment
   */
  static async assignStaff(appointmentId, staffId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) throw new AppError('Appointment not found', 404);

    if (appointment.status === APPOINTMENT_STATUS.CANCELLED || appointment.status === APPOINTMENT_STATUS.CLOSED) {
      throw new AppError('Cannot assign staff to a cancelled or closed appointment', 400);
    }

    // Check if staff is already booked for this slot
    const conflict = await Appointment.findOne({
      staff: staffId,
      date: appointment.date,
      timeSlot: appointment.timeSlot,
      _id: { $ne: appointmentId },
      status: { $nin: [APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.CLOSED] }
    });

    if (conflict) {
      throw new AppError('Staff is already booked for this time slot', 409);
    }

    appointment.staff = staffId;
    appointment.status = APPOINTMENT_STATUS.ASSIGNED;
    await appointment.save();

    return appointment;
  }

  /**
   * Update appointment status
   */
  static async updateStatus(appointmentId, status) {
    const validStatuses = Object.values(APPOINTMENT_STATUS);
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const appointment = await Appointment.findByIdAndUpdate(appointmentId, { status }, { new: true });
    if (!appointment) throw new AppError('Appointment not found', 404);

    return appointment;
  }
}

module.exports = AppointmentService;
