const express = require('express');
const router = express.Router();

const Upload = require('./upload.model');
const { AppError } = require('../../core/utils');

router.get('/:filename', async (req, res, next) => {
  try {
    const { filename } = req.params;

    const uploadRecord = await Upload.findOne({ filename }).select('+data');

    if (!uploadRecord) {
      throw new AppError('File not found', 404);
    }

    res.setHeader('Content-Type', uploadRecord.mimetype);
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(uploadRecord.originalName)}"`
    );
    res.setHeader('Content-Length', uploadRecord.size);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    return res.send(uploadRecord.data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;