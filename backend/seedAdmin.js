// backend/seedAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🗄️  Connected to MongoDB for seeding');

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASS;
    if (!email || !password) {
      throw new Error('Missing ADMIN_EMAIL or ADMIN_PASS in .env');
    }

    let admin = await User.findOne({ email });
    if (admin) {
      console.log('ℹ️  Admin user already exists:', email);
    } else {
      const hash = await bcrypt.hash(password, 10);
      admin = await User.create({
        email,
        password: hash,
        role: 'admin',
        parentId: null
      });
      console.log('✅ Admin user created:', email);
    }

    await mongoose.disconnect();
    console.log('✔️  Seeding complete, disconnected from MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seedAdmin();
