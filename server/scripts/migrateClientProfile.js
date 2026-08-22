require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/microgig');
    console.log('Connected to MongoDB');

    const clients = await User.find({ role: 'client', clientProfile: { $exists: false } });
    console.log(`Found ${clients.length} clients needing migration.`);

    let count = 0;
    for (const client of clients) {
      // Initialize an empty clientProfile
      client.clientProfile = {
        companyName: '',
        companyLogoUrl: '',
        industry: '',
        companySize: '',
        companyWebsite: '',
        aboutCompany: '',
        hiringIndustries: [],
        preferredBudgetRange: { min: 0, max: 0 },
        timezone: '',
        isVerifiedBusiness: false
      };
      await client.save({ validateBeforeSave: false }); // Skip validation in case legacy data is weird
      count++;
    }

    console.log(`Successfully migrated ${count} clients.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
};

migrate();
