const express = require('express');
const router = express.Router();
const CategoryController = require('./category.controller');
const { validate } = require('../../core/middlewares/validate.middleware');
const { authenticate, adminOnly } = require('../../core/middlewares/auth.middleware');
const { createCategorySchema, updateCategorySchema } = require('./category.validation');

// Public routes
router.get('/', CategoryController.getCategories);
router.get('/:idOrSlug', CategoryController.getCategory);

// Admin only routes
router.use(authenticate, adminOnly);
router.post('/', validate(createCategorySchema), CategoryController.createCategory);
router.patch('/:id', validate(updateCategorySchema), CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

module.exports = router;
