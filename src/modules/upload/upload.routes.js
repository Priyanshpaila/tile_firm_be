const express = require('express');
const router = express.Router();
const Upload = require('./upload.model');
const { upload } = require('../../core/middlewares/upload.middleware');
const { uploadLimiter } = require('../../core/middlewares/rateLimit.middleware');
const { authenticate } = require('../../core/middlewares/auth.middleware');
const { successResponse, AppError } = require('../../core/utils');

router.use(authenticate);

function buildRelativeFileUrl(filename) {
  return `/uploads/${filename}`;
}

async function createUploadRecord({ file, uploadType, userId }) {
  const fileUrl = buildRelativeFileUrl(file.filename);

  const uploadRecord = await Upload.create({
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
    uploadType,
    uploadedBy: userId,
    url: fileUrl,
  });

  return uploadRecord;
}

// Single file upload
router.post(
  '/single',
  uploadLimiter,
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) throw new AppError('No file uploaded', 400);

      const { uploadType } = req.body;
      if (!uploadType) throw new AppError('uploadType form field is required', 400);

      const uploadRecord = await createUploadRecord({
        file: req.file,
        uploadType,
        userId: req.user.id,
      });

      successResponse(
        res,
        {
          upload: uploadRecord,
          fileUrl: uploadRecord.url,
        },
        'File uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// Multiple files upload (max 5)
router.post(
  '/multiple',
  uploadLimiter,
  upload.array('files', 5),
  async (req, res, next) => {
    try {
      if (!req.files || req.files.length === 0) {
        throw new AppError('No files uploaded', 400);
      }

      const { uploadType } = req.body;
      if (!uploadType) throw new AppError('uploadType form field is required', 400);

      const uploadRecords = [];

      for (const file of req.files) {
        const record = await createUploadRecord({
          file,
          uploadType,
          userId: req.user.id,
        });
        uploadRecords.push(record);
      }

      successResponse(
        res,
        {
          uploads: uploadRecords,
          fileUrls: uploadRecords.map((item) => item.url),
        },
        'Files uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;