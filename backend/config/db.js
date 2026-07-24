import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.warn('⚠️ MONGODB_URI is not defined in environment variables.');
      return false;
    }

    if (mongoose.connection.readyState >= 1) {
      return true;
    }

    const conn = await mongoose.connect(connStr);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ Database connection failed: ${error.message}`);
    return false;
  }
};

export default connectDB;
