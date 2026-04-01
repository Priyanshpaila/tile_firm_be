const multer = require('multer');
const { ALLOWED_IMAGE_TYPES } = require('../constants');
const { UPLOAD_MAX_SIZE } = require('../../config/env');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new Error('Only JPEG, PNG and WebP images are allowed.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(UPLOAD_MAX_SIZE),
    files: 10,
  },
});

module.exports = { upload };