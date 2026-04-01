const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      if (process.env.NODE_ENV === 'production') {
        console.error('MONGODB_URI environment variable is not set. Exiting.');
        process.exit(1);
      }
      console.warn('MONGODB_URI not set, falling back to mongodb://localhost:27017/daily-tracker');
    }
    const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/daily-tracker');
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
