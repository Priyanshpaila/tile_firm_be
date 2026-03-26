const UserService = require('./user.service');
const { successResponse, paginatedResponse } = require('../../core/utils');

class UserController {
  // --- Profile Endpoints ---
  
  static async updateProfile(req, res, next) {
    try {
      const user = await UserService.updateProfile(req.user.id, req.body);
      successResponse(res, { user }, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      await UserService.changePassword(req.user.id, currentPassword, newPassword);
      successResponse(res, null, 'Password changed successfully');
    } catch (error) {
      next(error);
    }
  }

  // --- Wishlist Endpoints ---

  static async getWishlist(req, res, next) {
    try {
      const wishlist = await UserService.getWishlist(req.user.id);
      successResponse(res, { wishlist });
    } catch (error) {
      next(error);
    }
  }

  static async toggleWishlist(req, res, next) {
    try {
      const { productId } = req.params;
      const result = await UserService.toggleWishlist(req.user.id, productId);
      const message = result.added ? 'Added to wishlist' : 'Removed from wishlist';
      successResponse(res, result, message);
    } catch (error) {
      next(error);
    }
  }

  // --- Admin Endpoints ---

  static async getAllUsers(req, res, next) {
    try {
      const { users, page, limit, total } = await UserService.getAllUsers(req.query);
      paginatedResponse(res, { users }, page, limit, total);
    } catch (error) {
      next(error);
    }
  }

  static async toggleUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const user = await UserService.toggleUserStatus(req.user.id, id);
      const statusStr = user.isActive ? 'activated' : 'deactivated';
      successResponse(res, { user }, `User account has been ${statusStr}`);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
