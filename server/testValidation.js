const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function test() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/microgig');
    const users = await User.find({});
    for (const user of users) {
      try {
        user.lastLoginAt = new Date();
        await user.save();
      } catch (err) {
        console.error(`Validation failed for user ${user.email}:`, err.message);
      }
    }
    console.log('Finished testing all users.');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
test();
