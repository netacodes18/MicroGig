const Notification = require('../models/Notification');

// GET /api/notifications
exports.getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'name avatar')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (err) { next(err); }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (err) { next(err); }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: 'All notifications marked as read' });
  } catch (err) { next(err); }
};

// Helper to notify both freelancer and client on dispute resolution
exports.notifyDisputeResolved = async (dispute) => {
  try {
    const Job = require('../models/Job');
    const job = await Job.findById(dispute.job);
    if (!job) return;

    const outcomeLabels = {
      RELEASE_PAYMENT: 'Platform Admin resolved the dispute: funds have been released to the freelancer.',
      REFUND_CLIENT: 'Platform Admin resolved the dispute: funds have been refunded to the client.',
      SPLIT_PAYMENT: 'Platform Admin resolved the dispute: funds have been split between both parties.',
      REJECTED: 'Platform Admin rejected the dispute. No payment action was taken.'
    };

    const outcomeText = outcomeLabels[dispute.resolutionOutcome] || 'The dispute has been resolved.';

    // Notify Client
    await Notification.create({
      recipient: job.poster,
      sender: dispute.resolvedBy, // admin
      type: 'other',
      job: job._id,
      message: `Dispute on "${job.title}" resolved: ${outcomeText} Reason: ${dispute.resolutionReason || 'None provided.'}`
    });

    // Notify Freelancer (if assigned)
    if (job.assignedTo) {
      await Notification.create({
        recipient: job.assignedTo,
        sender: dispute.resolvedBy, // admin
        type: 'other',
        job: job._id,
        message: `Dispute on "${job.title}" resolved: ${outcomeText} Reason: ${dispute.resolutionReason || 'None provided.'}`
      });
    }
  } catch (err) {
    console.error('Error creating dispute resolution notifications:', err);
  }
};
