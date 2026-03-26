const express = require('express');
const router = express.Router();
const Upload = require('./upload.model');
const { upload } = require('../../core/middlewares/upload.middleware');
const { uploadLimiter } = require('../../core/middlewares/rateLimit.middleware');
const { authenticate } = require('../../core/middlewares/auth.middleware');
const { successResponse, AppError } = require('../../core/utils');

router.use(authenticate);

// Single file upload
router.post('/single', uploadLimiter, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);

    const { uploadType } = req.body;
    if (!uploadType) throw new AppError('uploadType forms field is required', 400);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`;

    const uploadRecord = await Upload.create({
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadType,
      uploadedBy: req.user.id,
      url: fileUrl,
    });

    successResponse(res, { upload: uploadRecord }, 'File uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
});

// Multiple files upload (max 5)
router.post('/multiple', uploadLimiter, upload.array('files', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new AppError('No files uploaded', 400);
    }

    const { uploadType } = req.body;
    if (!uploadType) throw new AppError('uploadType forms field is required', 400);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const uploadRecords = [];

    for (const file of req.files) {
      const fileUrl = `${baseUrl}/uploads/${file.filename}`;
      
      const record = await Upload.create({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadType,
        uploadedBy: req.user.id,
        url: fileUrl,
      });
      
      uploadRecords.push(record);
    }

    successResponse(res, { uploads: uploadRecords }, 'Files uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
