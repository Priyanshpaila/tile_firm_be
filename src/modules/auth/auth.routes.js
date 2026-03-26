const express = require('express');
const router = express.Router();
const AuthController = require('./auth.controller');
const { validate } = require('../../core/middlewares/validate.middleware');
const { authenticate } = require('../../core/middlewares/auth.middleware');
const { authLimiter } = require('../../core/middlewares/rateLimit.middleware');
const { registerSchema, loginSchema } = require('./auth.validation');

router.post('/register', authLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authLimiter, validate(loginSchema), AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);

module.exports = router;
