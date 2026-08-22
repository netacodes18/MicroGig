const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
    select: false,
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  dob: {
    type: Date,
  },
  bio: {
    type: String,
    default: '',
    maxlength: 500,
  },
  role: {
    type: String,
    enum: ['freelancer', 'client', 'admin'],
    default: 'freelancer',
  },
  skills: [{
    type: String,
    trim: true,
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  completedGigs: {
    type: Number,
    default: 0,
  },
  portfolio: {
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  guild: {
    type: String,
    default: '',
    trim: true,
  },
  traits: [{
    type: String,
    trim: true,
  }],
  verifiedSkills: [{
    skill: { type: String, trim: true },
    level: { type: Number, default: 0 },
    verifiedAt: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active',
  },
  statusReason: {
    type: String,
    default: '',
  },
  lastLoginAt: {
    type: Date,
  },
  clientProfile: {
    companyName: { type: String, default: '' },
    companyLogoUrl: { type: String, default: '' },
    industry: { type: String, default: '' },
    companySize: { type: String, enum: ['solo', '2-10', '11-50', '51-200', '200+', ''], default: '' },
    companyWebsite: { type: String, default: '' },
    aboutCompany: { type: String, default: '' },
    hiringIndustries: [{ type: String }],
    preferredBudgetRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    timezone: { type: String, default: '' },
    isVerifiedBusiness: { type: Boolean, default: false },
  },
}, { timestamps: true });

// Role-based field validation hook
userSchema.pre('validate', function(next) {
  if (this.role !== 'client') {
    // Prevent non-clients from storing clientProfile data
    this.clientProfile = undefined;
  }
  
  if (this.role !== 'freelancer') {
    // If we wanted to clear freelancer fields, we could do it here. 
    // But per plan, we just reject writes if someone tries to modify them when not a freelancer.
    // For Mongoose pre-validate, the best we can do is ensure new fields aren't added, but 
    // existing fields won't cause validation errors since they are optional.
    // The controller will also enforce this.
  }
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
