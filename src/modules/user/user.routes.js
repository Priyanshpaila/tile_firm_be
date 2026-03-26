const express = require('express');
const router = express.Router();
const UserController = require('./user.controller');
const { authenticate, adminOnly } = require('../../core/middlewares/auth.middleware');
const { validate } = require('../../core/middlewares/validate.middleware');
const { updateProfileSchema, changePasswordSchema } = require('./user.validation');

// All user routes require authentication
router.use(authenticate);

// Profile
router.put('/profile', validate(updateProfileSchema), UserController.updateProfile);
router.put('/change-password', validate(changePasswordSchema), UserController.changePassword);

// Wishlist
router.get('/wishlist', UserController.getWishlist);
router.post('/wishlist/:productId', UserController.toggleWishlist);

// Admin only routes
router.use(adminOnly);
router.get('/', UserController.getAllUsers);
router.patch('/:id/status', UserController.toggleUserStatus);

module.exports = router;
