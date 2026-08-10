const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  }, // e.g. 'USER_SUSPENDED', 'USER_BANNED', 'USER_REINSTATED', 'DISPUTE_UNDER_REVIEW', 'DISPUTE_RESOLVED', 'ROLE_PROMOTED'
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  targetDispute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispute'
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
