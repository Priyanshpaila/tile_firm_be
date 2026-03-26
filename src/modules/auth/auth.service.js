const jwt = require('jsonwebtoken');
const User = require('./auth.model');
const { AppError } = require('../../core/utils');
const { JWT_SECRET, JWT_REFRESH_SECRET, JWT_EXPIRY, JWT_REFRESH_EXPIRY } = require('../../config/env');

class AuthService {
  /**
   * Generate access token
   */
  static generateAccessToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(user) {
    return jwt.sign(
      { id: user._id },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRY }
    );
  }

  /**
   * Register a new user
   */
  static async register({ name, email, password, phone }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('An account with this email already exists.', 409);
    }

    const user = await User.create({ name, email, password, phone });

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  }

  /**
   * Login user
   */
  static async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Contact support.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401);
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(token) {
    if (!token) {
      throw new AppError('Refresh token is required.', 400);
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token.', 401);
    }

    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout user
   */
  static async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: '' });
  }

  /**
   * Get current user
   */
  static async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }
}

module.exports = AuthService;
