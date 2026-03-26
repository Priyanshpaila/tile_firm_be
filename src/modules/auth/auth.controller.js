const AuthService = require('./auth.service');
const { successResponse } = require('../../core/utils');
const { NODE_ENV } = require('../../config/env');

const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshCookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/api/auth/refresh',
};

class AuthController {
  static async register(req, res, next) {
    try {
      const { user, accessToken, refreshToken } = await AuthService.register(req.body);

      res.cookie('accessToken', accessToken, cookieOptions);
      res.cookie('refreshToken', refreshToken, refreshCookieOptions);

      successResponse(res, { user }, 'Registration successful', 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { user, accessToken, refreshToken } = await AuthService.login(req.body);

      res.cookie('accessToken', accessToken, cookieOptions);
      res.cookie('refreshToken', refreshToken, refreshCookieOptions);

      successResponse(res, { user }, 'Login successful');
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const token = req.cookies?.refreshToken;
      const { accessToken, refreshToken } = await AuthService.refreshToken(token);

      res.cookie('accessToken', accessToken, cookieOptions);
      res.cookie('refreshToken', refreshToken, refreshCookieOptions);

      successResponse(res, null, 'Token refreshed');
    } catch (error) {
      next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      await AuthService.logout(req.user.id);

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      successResponse(res, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }

  static async me(req, res, next) {
    try {
      const user = await AuthService.getCurrentUser(req.user.id);
      successResponse(res, { user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
