const mongoose = require('mongoose');
const slugify = require('slugify');
const { PRODUCT_FINISH, PRODUCT_USAGE, PRODUCT_MATERIAL, TILE_SIZES } = require('../../core/constants');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      min: 0,
    },
    images: {
      type: [String], // Array of image URLs
      required: true,
      validate: [v => v.length > 0, 'At least one image is required'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    // Tile-specific attributes
    finishes: {
      type: [String],
      enum: PRODUCT_FINISH,
      required: true,
    },
    usages: {
      type: [String],
      enum: PRODUCT_USAGE,
      required: true,
    },
    material: {
      type: String,
      enum: PRODUCT_MATERIAL,
      required: true,
    },
    sizes: {
      type: [String],
      enum: TILE_SIZES,
      required: true,
    },
    thickness: {
      type: String, // e.g., '9mm'
    },
    boxCoverage: {
      type: Number, // in sq.ft or sq.m
    },
    piecesPerBox: {
      type: Number,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Indexes for searching and filtering
productSchema.index({ name: 'text', description: 'text', sku: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ finishes: 1 });
productSchema.index({ usages: 1 });
productSchema.index({ sizes: 1 });

module.exports = mongoose.model('Product', productSchema);
