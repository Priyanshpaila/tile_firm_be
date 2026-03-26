const ProductService = require('./product.service');
const { successResponse, paginatedResponse } = require('../../core/utils');

class ProductController {
  static async createProduct(req, res, next) {
    try {
      const product = await ProductService.createProduct(req.body);
      successResponse(res, { product }, 'Product created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getProducts(req, res, next) {
    try {
      const { products, page, limit, total } = await ProductService.getProducts(req.query);
      paginatedResponse(res, { products }, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  static async getProduct(req, res, next) {
    try {
      const product = await ProductService.getProductByParam(req.params.idOrSlugOrSku);
      successResponse(res, { product });
    } catch (error) {
      next(error);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      const product = await ProductService.updateProduct(req.params.id, req.body);
      successResponse(res, { product }, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      await ProductService.deleteProduct(req.params.id);
      successResponse(res, null, 'Product deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
