const User = require('../auth/auth.model');
const { AppError, getPagination } = require('../../core/utils');

class UserService {
  /**
   * Update user profile
   */
  static async updateProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Change password
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new AppError('Incorrect current password', 400);
    }

    user.password = newPassword;
    await user.save();
    return true;
  }

  /**
   * Get user's wishlist details (populated)
   */
  static async getWishlist(userId) {
    const user = await User.findById(userId).populate({
      path: 'wishlist',
      select: 'name images price slug finishes sizes',
    });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user.wishlist;
  }

  /**
   * Toggle product in wishlist
   */
  static async toggleWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const index = user.wishlist.indexOf(productId);
    let added = false;
    
    if (index === -1) {
      user.wishlist.push(productId);
      added = true;
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();
    return { wishlist: user.wishlist, added };
  }

  /**
   * Get all users (Admin only)
   */
  static async getAllUsers(query) {
    const { page, limit, skip } = getPagination(query);
    
    const filter = {};
    if (query.role) filter.role = query.role;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-wishlist')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
      
    const total = await User.countDocuments(filter);

    return { users, page, limit, total };
  }

  /**
   * Toggle user active status (Admin only)
   */
  static async toggleUserStatus(adminId, targetUserId) {
    if (adminId === targetUserId) {
      throw new AppError('You cannot deactivate your own account', 400);
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Don't let normal admins deactivate other admins easily
    if (user.role === 'admin') {
      throw new AppError('Cannot deactivate another admin account directly', 403);
    }

    user.isActive = !user.isActive;
    await user.save();

    return user;
  }
}

module.exports = UserService;
