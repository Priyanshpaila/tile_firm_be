const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    // kept to preserve old URL pattern: /uploads/:filename
    filename: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    // kept for backward compatibility with old response shape
    path: {
      type: String,
      default: null,
    },
    mimetype: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    uploadType: {
      type: String,
      enum: ['product_image', 'room_photo', 'room_template', 'avatar'],
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    // actual binary stored in MongoDB
    data: {
      type: Buffer,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Upload', uploadSchema);