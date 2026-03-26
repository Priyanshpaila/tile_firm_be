const mongoose = require('mongoose');

const visualizationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      default: 'My Saved Room',
    },
    roomTemplate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RoomTemplate',
    },
    // If it's a completely custom user upload
    uploadedImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upload',
    },
    selectedTile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    // View state data (camera angle, applied surfaces, scale, rotation)
    viewState: {
      type: Object,
      required: true,
    },
    thumbnailUrl: {
      type: String, // Pre-rendered snapshot
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Visualization', visualizationSchema);
