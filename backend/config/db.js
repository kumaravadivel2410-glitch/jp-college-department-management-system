const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let connStr = process.env.MONGODB_URI;
    if (!connStr || connStr.includes('PASTE_MY_MONGODB_ATLAS_CONNECTION_STRING_HERE') || connStr.includes('<username>')) {
      console.error('❌ MONGODB_URI is not configured in backend/.env!');
      console.error('Please configure your valid MongoDB Atlas Connection String in backend/.env');
      process.exit(1);
    }

    // Auto-fix URI to ensure collegeDB database is targeted
    if (connStr.includes('.mongodb.net') && !connStr.includes('.mongodb.net/collegeDB')) {
      if (connStr.includes('.mongodb.net/')) {
        connStr = connStr.replace(/\.mongodb\.net\/([^?]*)/, '.mongodb.net/collegeDB');
      } else {
        connStr = connStr + '/collegeDB?retryWrites=true&w=majority';
      }
    }

    const conn = await mongoose.connect(connStr, {
      dbName: 'collegeDB'
    });

    const dbName = conn.connection.db.databaseName;
    console.log('✅ MongoDB Atlas Connected');
    console.log(`Connected Database: ${dbName}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
