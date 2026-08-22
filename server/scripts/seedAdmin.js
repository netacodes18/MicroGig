const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@microgig.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin account already exists.');
      process.exit(0);
    }

    const adminUser = await User.create({
      name: 'Platform Admin',
      email: adminEmail,
      password: 'AdminPassword123',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=platformadmin',
      status: 'active'
    });

    console.log('✅ Admin account seeded successfully!');
    console.log(`Email: ${adminUser.email}`);
    console.log('Password: AdminPassword123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
