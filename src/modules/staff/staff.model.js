const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    serviceAreas: {
      type: [String], // Array of pincodes or city regions
    },
    userAccount: {
      // Optional link to a user account with 'staff' role for login capability
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Staff', staffSchema);
