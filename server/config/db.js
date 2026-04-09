const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('❌ CRITICAL ERROR: MONGO_URI is not defined in environment variables!');
      process.exit(1);
    }
    
    console.log('📡 Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ FATAL MONGODB CONNECTION ERROR:');
    console.error(`Message: ${error.message}`);
    console.error(`Code: ${error.code}`);
    process.exit(1);
  }
};

module.exports = connectDB;
