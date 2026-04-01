const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { PORT, NODE_ENV } = require('./config/env');
const connectDB = require('./config/db');
const corsMiddleware = require('./config/cors');
const { errorHandler, notFoundHandler } = require('./core/middlewares/error.middleware');
const { apiLimiter } = require('./core/middlewares/rateLimit.middleware');

// Import route modules
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const productRoutes = require('./modules/product/product.routes');
const categoryRoutes = require('./modules/category/category.routes');
const visualizerRoutes = require('./modules/visualizer/visualizer.routes');
const roomTemplateRoutes = require('./modules/roomTemplate/roomTemplate.routes');
const uploadRoutes = require('./modules/upload/upload.routes');
const uploadPublicRoutes = require('./modules/upload/upload.public.routes');
const appointmentRoutes = require('./modules/appointment/appointment.routes');
const paymentRoutes = require('./modules/payment/payment.routes');
const staffRoutes = require('./modules/staff/staff.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();

// ------- Global Middleware -------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(corsMiddleware);
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Public upload serving from MongoDB
app.use('/uploads', uploadPublicRoutes);

// Apply rate limit only to API routes
app.use('/api', apiLimiter);

// ------- API Routes -------
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'TileVista API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/visualizer', visualizerRoutes);
app.use('/api/room-templates', roomTemplateRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/admin', adminRoutes);

// ------- Error Handling -------
app.use(notFoundHandler);
app.use(errorHandler);

// ------- Start Server -------
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 API running on port ${PORT} in ${NODE_ENV} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;