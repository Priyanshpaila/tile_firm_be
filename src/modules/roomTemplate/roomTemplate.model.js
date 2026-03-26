const mongoose = require('mongoose');

const roomTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['2d_preset', '3d_model'],
      required: true,
    },
    roomCategory: {
      type: String,
      enum: ['bathroom', 'kitchen', 'living_room', 'bedroom', 'outdoor', 'commercial'],
      required: true,
    },
    // For 2D Preset
    backgroundImageUrl: {
      type: String, // Base image URL
    },
    surfaceMasks: [
      {
        name: String, // e.g., 'floor_main', 'wall_left'
        surfaceType: { type: String, enum: ['floor', 'wall'] },
        polygon: [
          { x: Number, y: Number } // Array of 4 points {x, y} ratios (0 to 1) for perspective map
        ],
        zIndex: Number
      }
    ],
    // For 3D Model
    modelUrl: {
      type: String, // GLB/GLTF file URL
    },
    meshTargets: [
      {
        name: String, // Mesh name inside the GLB file
        surfaceType: { type: String, enum: ['floor', 'wall'] },
        defaultRepeat: { x: Number, y: Number } // Default texture repeat mapping
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('RoomTemplate', roomTemplateSchema);
