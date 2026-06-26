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
    vibeMatch: { type: Number, default: 0 },
    bidAmount: { type: Number, default: 0 },
    deliveryTime: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    status: { type: String, enum: ['PENDING', 'HIRED', 'REJECTED'], default: 'PENDING' },
  }],
  status: {
    type: String,
    enum: ['OPEN', 'APPLICATION_RECEIVED', 'HIRED', 'IN_PROGRESS', 'WORK_SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'COMPLETED', 'REJECTED'],
    default: 'OPEN',
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'READY_FOR_RELEASE', 'RELEASED'],
    default: 'PENDING',
  },
  revisionFeedback: {
    type: String,
    default: '',
  },
  statusHistory: [{
    status: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  workspace: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    attachments: [{
      url: String,
      name: String
    }],
    createdAt: { type: Date, default: Date.now }
  }],
  submission: {
    content: { type: String, default: '' },
    submittedAt: { type: Date },
    aiVerificationScore: { type: Number, default: null },
    aiVerificationNotes: { type: String, default: '' },
  },
  isUrgent: {
    type: Boolean,
    default: false,
  },
  isFunded: {
    type: Boolean,
    default: false,
  },
  paymentDetails: {
    orderId: { type: String },
    paymentId: { type: String },
    paidAt: { type: Date }
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
