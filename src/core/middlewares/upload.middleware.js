const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ALLOWED_IMAGE_TYPES } = require('../constants');
const { UPLOAD_MAX_SIZE } = require('../../config/env');

const uploadsDir = path.join(__dirname, '../../../uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD_MAX_SIZE,
    files: 10,
  },
});

module.exports = { upload };