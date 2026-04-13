const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 2000,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Technology & IT', 'Creative & Design', 'Writing & Translation',
      'Marketing & Sales', 'Business & Operations', 'Lifestyle & Health',
      'Photography & Media', 'Events & Hospitality', 'Other Services'
    ],
  },
  skills: [{
    type: String,
    trim: true,
  }],
  budget: {
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    type: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
  },
  duration: {
    type: String,
    required: true,
  },
  poster: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  applicants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    experience: { type: String, default: '' },
    message: { type: String, default: '' },
    contactInfo: { type: String, default: '' },
    attachmentUrl: { type: String, default: '' },
    attachmentName: { type: String, default: '' },
    appliedAt: { type: Date, default: Date.now },
  }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'needs-review', 'accepted', 'completed', 'cancelled'],
    default: 'open',
  },
  submission: {
    content: { type: String, default: '' },
    submittedAt: { type: Date },
  },
  isUrgent: {
    type: Boolean,
    default: false,
  },
  isInstantHire: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

jobSchema.index({ category: 1, status: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ poster: 1 });
jobSchema.index({ status: 1, 'budget.max': -1, createdAt: -1 });
jobSchema.index({ isUrgent: -1 });

module.exports = mongoose.model('Job', jobSchema);
