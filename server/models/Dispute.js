const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Dispute reason is required']
  },
  description: {
    type: String,
    required: [true, 'Dispute description is required']
  },
  evidenceUrls: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'],
    default: 'OPEN'
  },
  resolutionOutcome: {
    type: String,
    enum: ['RELEASE_PAYMENT', 'REFUND_CLIENT', 'SPLIT_PAYMENT', 'REJECTED']
  },
  resolutionReason: {
    type: String
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  }
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
