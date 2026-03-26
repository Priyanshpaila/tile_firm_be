const dotenv = require('dotenv');
dotenv.config();

const requiredVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
];

const optionalVars = [
  'PORT',
  'NODE_ENV',
  'CLIENT_URL',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'UPLOAD_MAX_SIZE',
  'JWT_EXPIRY',
  'JWT_REFRESH_EXPIRY',
];

// Validate required environment variables
for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  UPLOAD_MAX_SIZE: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10), // 10MB
};
