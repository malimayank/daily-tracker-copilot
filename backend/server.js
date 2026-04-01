require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// CORS — restrict to explicit origin in production; default to localhost in development
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
const corsOptions = {
  origin: allowedOrigin,
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());

// Rate limiting — tighter limits on auth endpoints, general limit on everything else
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

app.use(generalLimiter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Daily Tracker API is running' });
});

// API routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/stats', require('./routes/stats'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;
