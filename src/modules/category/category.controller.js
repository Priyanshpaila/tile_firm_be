const CategoryService = require('./category.service');
const { successResponse } = require('../../core/utils');

class CategoryController {
  static async createCategory(req, res, next) {
    try {
      const category = await CategoryService.createCategory(req.body);
      successResponse(res, { category }, 'Category created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const categories = await CategoryService.getCategories(req.query);
      successResponse(res, { categories });
    } catch (error) {
      next(error);
    }
  }

  static async getCategory(req, res, next) {
    try {
      const category = await CategoryService.getCategoryByParam(req.params.idOrSlug);
      successResponse(res, { category });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const category = await CategoryService.updateCategory(req.params.id, req.body);
      successResponse(res, { category }, 'Category updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      await CategoryService.deleteCategory(req.params.id);
      successResponse(res, null, 'Category deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;
