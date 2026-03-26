const express = require('express');
const router = express.Router();
const ProductController = require('./product.controller');
const { validate } = require('../../core/middlewares/validate.middleware');
const { authenticate, staffOrAdmin } = require('../../core/middlewares/auth.middleware');
const { createProductSchema, updateProductSchema } = require('./product.validation');

// Public routes
router.get('/', ProductController.getProducts);
router.get('/:idOrSlugOrSku', ProductController.getProduct);

// Staff or Admin only routes
router.use(authenticate, staffOrAdmin);
router.post('/', validate(createProductSchema), ProductController.createProduct);
router.patch('/:id', validate(updateProductSchema), ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

module.exports = router;
