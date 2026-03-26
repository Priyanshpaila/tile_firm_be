const Product = require('./product.model');
const Category = require('../category/category.model');
const { AppError, getPagination, getSortOptions } = require('../../core/utils');
const slugify = require('slugify');

class ProductService {
  /**
   * Create a new product
   */
  static async createProduct(data) {
    // Verify category exists
    const category = await Category.findById(data.category);
    if (!category) {
      throw new AppError('Invalid category ID', 400);
    }

    // Check SKU uniqueness
    const existingSku = await Product.findOne({ sku: data.sku });
    if (existingSku) {
      throw new AppError('Product with this SKU already exists', 409);
    }

    // Check Name uniqueness
    const existingName = await Product.findOne({ name: data.name });
    if (existingName) {
      throw new AppError('Product with this name already exists', 409);
    }

    return Product.create(data);
  }

  /**
   * Get all products with filtering, sorting, and pagination
   */
  static async getProducts(query) {
    const { page, limit, skip } = getPagination(query);
    const filter = {};

    // Search (text index)
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    // Filters
    if (query.category) {
      // Allow searching by category slug or ID
      const isObjectId = query.category.match(/^[0-9a-fA-F]{24}$/);
      if (isObjectId) {
        filter.category = query.category;
      } else {
        const cat = await Category.findOne({ slug: query.category });
        if (cat) filter.category = cat._id;
      }
    }
    
    if (query.finishes) filter.finishes = { $in: query.finishes.split(',') };
    if (query.usages) filter.usages = { $in: query.usages.split(',') };
    if (query.material) filter.material = query.material;
    if (query.sizes) filter.sizes = { $in: query.sizes.split(',') };
    if (query.inStock) filter.inStock = query.inStock === 'true';
    if (query.isFeatured) filter.isFeatured = query.isFeatured === 'true';

    // Price range
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }

    // Sorting
    const sort = getSortOptions(query, { createdAt: -1 });
    
    // If text search is active, sort by relevance by default unless overridden
    if (query.search && !query.sort) {
      sort.score = { $meta: 'textScore' };
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    return { products, page, limit, total };
  }

  /**
   * Get single product by ID, Slug, or SKU
   */
  static async getProductByParam(param) {
    const isObjectId = param.match(/^[0-9a-fA-F]{24}$/);
    let filter;
    
    if (isObjectId) {
      filter = { _id: param };
    } else {
      filter = { $or: [{ slug: param }, { sku: param.toUpperCase() }] };
    }

    const product = await Product.findOne(filter).populate('category', 'name slug');
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    return product;
  }

  /**
   * Update product
   */
  static async updateProduct(id, data) {
    if (data.category) {
      const category = await Category.findById(data.category);
      if (!category) throw new AppError('Invalid category ID', 400);
    }

    if (data.sku) {
      const existingSku = await Product.findOne({ sku: data.sku, _id: { $ne: id } });
      if (existingSku) throw new AppError('Product with this SKU already exists', 409);
    }

    if (data.name) {
      const existingName = await Product.findOne({ name: data.name, _id: { $ne: id } });
      if (existingName) throw new AppError('Product with this name already exists', 409);
      data.slug = slugify(data.name, { lower: true, strict: true });
    }

    const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate('category', 'name slug');
    if (!product) throw new AppError('Product not found', 404);

    return product;
  }

  /**
   * Delete product
   */
  static async deleteProduct(id) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) throw new AppError('Product not found', 404);
    return true;
  }
}

module.exports = ProductService;
