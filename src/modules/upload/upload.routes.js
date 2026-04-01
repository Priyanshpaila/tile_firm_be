const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

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

function generateVirtualFilename(originalName = '') {
  const ext = path.extname(originalName || '');
  return `${uuidv4()}${ext}`;
}

function serializeUpload(uploadDoc) {
  return {
    _id: uploadDoc._id,
    originalName: uploadDoc.originalName,
    filename: uploadDoc.filename,
    path: uploadDoc.path,
    mimetype: uploadDoc.mimetype,
    size: uploadDoc.size,
    uploadType: uploadDoc.uploadType,
    uploadedBy: uploadDoc.uploadedBy,
    url: uploadDoc.url,
    createdAt: uploadDoc.createdAt,
    updatedAt: uploadDoc.updatedAt,
  };
}

async function createUploadRecord({ file, uploadType, userId }) {
  if (!file || !file.buffer) {
    throw new AppError('Uploaded file buffer not found', 400);
  }

  const filename = generateVirtualFilename(file.originalname);
  const fileUrl = buildRelativeFileUrl(filename);

  const uploadRecord = await Upload.create({
    originalName: file.originalname,
    filename,
    path: null,
    mimetype: file.mimetype,
    size: file.size,
    uploadType,
    uploadedBy: userId,
    url: fileUrl,
    data: file.buffer,
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
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const { uploadType } = req.body;
      if (!uploadType) {
        throw new AppError('uploadType form field is required', 400);
      }

      const uploadRecord = await createUploadRecord({
        file: req.file,
        uploadType,
        userId: req.user.id,
      });

      return successResponse(
        res,
        {
          upload: serializeUpload(uploadRecord),
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
      if (!uploadType) {
        throw new AppError('uploadType form field is required', 400);
      }

      const uploadRecords = [];

      for (const file of req.files) {
        const record = await createUploadRecord({
          file,
          uploadType,
          userId: req.user.id,
        });
        uploadRecords.push(record);
      }

      return successResponse(
        res,
        {
          uploads: uploadRecords.map(serializeUpload),
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