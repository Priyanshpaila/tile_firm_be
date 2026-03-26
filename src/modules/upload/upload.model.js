const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    path: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
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
    },
    url: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Upload', uploadSchema);
