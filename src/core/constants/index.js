const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  STAFF: 'staff',
};

const APPOINTMENT_STATUS = {
  CREATED: 'created',
  CONFIRMED: 'confirmed',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  CLOSED: 'closed',
};

const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

const PAYMENT_METHOD = {
  ONLINE: 'online',
  CASH: 'cash',
};

const PRODUCT_FINISH = ['glossy', 'matte', 'satin', 'textured', 'polished', 'rustic', 'lappato'];
const PRODUCT_USAGE = ['floor', 'wall', 'both', 'outdoor', 'bathroom', 'kitchen', 'living_room'];
const PRODUCT_MATERIAL = ['ceramic', 'porcelain', 'vitrified', 'natural_stone', 'marble', 'granite', 'mosaic'];
const TILE_SIZES = ['300x300', '300x600', '600x600', '600x1200', '800x800', '800x1600', '1000x1000', '1200x1200', '1200x2400'];

const UPLOAD_TYPES = {
  PRODUCT_IMAGE: 'product_image',
  ROOM_PHOTO: 'room_photo',
  ROOM_TEMPLATE: 'room_template',
  AVATAR: 'avatar',
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const TIME_SLOTS = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
];

module.exports = {
  ROLES,
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHOD,
  PRODUCT_FINISH,
  PRODUCT_USAGE,
  PRODUCT_MATERIAL,
  TILE_SIZES,
  UPLOAD_TYPES,
  ALLOWED_IMAGE_TYPES,
  TIME_SLOTS,
};
