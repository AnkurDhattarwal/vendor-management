// backend/config/Database.js
const mongoose = require('mongoose');
require('dotenv').config();

class Database {
  constructor() {
    this.mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
  }

  async connect() {
    if (!this.mongoURI) {
      console.error('❌ No Mongo URI defined in env (MONGO_URI or MONGODB_URI)');
      process.exit(1);
    }
    try {
      await mongoose.connect(this.mongoURI);
      console.log('🗄️  MongoDB connected');
    } catch (err) {
      console.error('❌ MongoDB connection error:', err.message);
      process.exit(1);
    }
  }
}

module.exports = new Database();
