const Category = require('./category.model');
const { AppError } = require('../../core/utils');
const slugify = require('slugify');

class CategoryService {
  /**
   * Create a new category
   */
  static async createCategory(data) {
    const existing = await Category.findOne({ name: data.name });
    if (existing) {
      throw new AppError('Category with this name already exists', 409);
    }
    return Category.create(data);
  }

  /**
   * Get all categories (hierarchical or flat)
   */
  static async getCategories(query) {
    const filter = {};
    if (query.activeOnly !== 'false') filter.isActive = true;
    
    let categories = await Category.find(filter).sort({ name: 1 });

    // Build hierarchy if requested
    if (query.hierarchical === 'true') {
      const categoryMap = {};
      const rootCategories = [];

      categories.forEach((cat) => {
        categoryMap[cat._id] = { ...cat.toObject(), children: [] };
      });

      categories.forEach((cat) => {
        if (cat.parentCategory && categoryMap[cat.parentCategory]) {
          categoryMap[cat.parentCategory].children.push(categoryMap[cat._id]);
        } else {
          rootCategories.push(categoryMap[cat._id]);
        }
      });

      return rootCategories;
    }

    return categories;
  }

  /**
   * Get a single category by ID or slug
   */
  static async getCategoryByParam(param) {
    const isObjectId = param.match(/^[0-9a-fA-F]{24}$/);
    const filter = isObjectId ? { _id: param } : { slug: param };
    
    const category = await Category.findOne(filter);
    if (!category) {
      throw new AppError('Category not found', 404);
    }
    
    return category;
  }

  /**
   * Update category
   */
  static async updateCategory(id, data) {
    // Check name uniqueness if name is updated
    if (data.name) {
      const existing = await Category.findOne({ name: data.name, _id: { $ne: id } });
      if (existing) {
        throw new AppError('Category with this name already exists', 409);
      }
      data.slug = slugify(data.name, { lower: true, strict: true });
    }

    if (data.parentCategory === id) {
      throw new AppError('A category cannot be its own parent', 400);
    }

    const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!category) throw new AppError('Category not found', 404);
    
    return category;
  }

  /**
   * Delete category
   */
  static async deleteCategory(id) {
    // Check if it has children
    const children = await Category.countDocuments({ parentCategory: id });
    if (children > 0) {
      throw new AppError('Cannot delete category with sub-categories. Reassign or delete children first.', 400);
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new AppError('Category not found', 404);
    
    return true;
  }
}

module.exports = CategoryService;
