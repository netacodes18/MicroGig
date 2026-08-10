const User = require('../models/User');
const Job = require('../models/Job');
const Dispute = require('../models/Dispute');
const AuditLog = require('../models/AuditLog');
const { refundClientPayment, releaseMilestonePayment } = require('./paymentController');
const { notifyDisputeResolved } = require('./notificationController');
const { clearCachePattern } = require('../middleware/cache');

// Helper to convert dynamic date range query params
const getDateRangeFilter = (range) => {
  const now = new Date();
  switch (range) {
    case '7d':
      return { $gte: new Date(now.setDate(now.getDate() - 7)) };
    case '30d':
      return { $gte: new Date(now.setDate(now.getDate() - 30)) };
    case '90d':
      return { $gte: new Date(now.setDate(now.getDate() - 90)) };
    default:
      return null;
  }
};

// GET /api/admin/analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const { range } = req.query;
    const dateQuery = getDateRangeFilter(range);

    // 1. GMV and Take Rate
    const jobFilter = {};
    if (dateQuery) {
      jobFilter.createdAt = dateQuery;
    }
    jobFilter.status = { $in: ['HIRED', 'COMPLETED'] };

    const matchingJobsForGMV = await Job.find(jobFilter);
    let gmv = 0;
    matchingJobsForGMV.forEach(job => {
      gmv += (job.budget?.max || job.budget || 0);
    });

    const takeRate = gmv * 0.1; // 10% platform fee

    // 2. Active Users (DAU / MAU)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const dau = await User.countDocuments({ lastLoginAt: { $gte: oneDayAgo } });
    const mau = await User.countDocuments({ lastLoginAt: { $gte: thirtyDaysAgo } });

    // Churn Rate (Users inactive for 30+ days relative to total users)
    const inactiveUsers = await User.countDocuments({ lastLoginAt: { $lt: thirtyDaysAgo } });
    const totalUsers = await User.countDocuments();
    const churnRate = totalUsers > 0 ? (inactiveUsers / totalUsers) * 100 : 0;

    // 3. Conversion Rate (% of job postings that result in a hire)
    const totalJobsFilter = {};
    if (dateQuery) totalJobsFilter.createdAt = dateQuery;
    const totalJobs = await Job.countDocuments(totalJobsFilter);
    const hiredJobs = await Job.countDocuments({
      ...totalJobsFilter,
      status: { $in: ['HIRED', 'COMPLETED', 'APPROVED', 'WORK_SUBMITTED', 'UNDER_REVIEW'] }
    });
    const conversionRate = totalJobs > 0 ? (hiredJobs / totalJobs) * 100 : 0;

    // 4. Average Time-to-Hire (in days)
    const hiredJobsList = await Job.find({
      status: { $in: ['HIRED', 'COMPLETED', 'APPROVED', 'WORK_SUBMITTED', 'UNDER_REVIEW'] }
    }).select('createdAt statusHistory');

    let totalDurationMs = 0;
    let hireCount = 0;

    hiredJobsList.forEach(job => {
      const hireEvent = job.statusHistory?.find(h => h.status === 'HIRED');
      if (hireEvent) {
        totalDurationMs += (new Date(hireEvent.timestamp) - new Date(job.createdAt));
        hireCount++;
      }
    });

    const avgTimeToHireDays = hireCount > 0 ? (totalDurationMs / hireCount) / (1000 * 60 * 60 * 24) : 0;

    // 5. Build timeline charts (GMV, Hires over time)
    // Group completed/hired jobs by month or day
    const gmvTimeline = [];
    const userGrowthTimeline = [];
    const funnel = {
      applications: await Job.aggregate([
        { $project: { numberOfApplicants: { $size: { $ifNull: ["$applicants", []] } } } },
        { $group: { _id: null, total: { $sum: "$numberOfApplicants" } } }
      ]).then(res => res[0]?.total || 0),
      hires: hiredJobs,
      completions: await Job.countDocuments({ status: 'COMPLETED' })
    };

    res.json({
      gmv,
      takeRate,
      dau,
      mau,
      churnRate,
      conversionRate,
      avgTimeToHireDays,
      funnel,
      gmvTimeline,
      userGrowthTimeline
    });
  } catch (err) { next(err); }
};

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) filter.role = role;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      users,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalUsers: total
    });
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id/status
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'Invalid user status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.status = status;
    user.statusReason = reason || '';
    await user.save();

    const actionMap = {
      active: 'USER_REINSTATED',
      suspended: 'USER_SUSPENDED',
      banned: 'USER_BANNED'
    };

    // Log the moderation action in AuditLog
    await AuditLog.create({
      action: actionMap[status],
      targetUser: user._id,
      performedBy: req.user._id,
      reason: reason || 'Moderator status update'
    });

    await clearCachePattern('analytics:*');

    res.json({ message: `User account status updated to ${status}`, user });
  } catch (err) { next(err); }
};

// PUT /api/admin/users/:id/role
exports.promoteUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['admin', 'client', 'freelancer'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = role;
    await user.save();

    await AuditLog.create({
      action: 'ROLE_PROMOTED',
      targetUser: user._id,
      performedBy: req.user._id,
      reason: `Promoted to ${role}`
    });

    await clearCachePattern('analytics:*');

    res.json({ message: `User role updated to ${role}`, user });
  } catch (err) { next(err); }
};

// GET /api/admin/disputes
exports.getDisputes = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const disputes = await Dispute.find(filter)
      .populate('job', 'title budget poster assignedTo status')
      .populate('raisedBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(disputes);
  } catch (err) { next(err); }
};

// GET /api/admin/disputes/:id
exports.getDisputeById = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate({
        path: 'job',
        populate: [
          { path: 'poster', select: 'name email avatar rating' },
          { path: 'assignedTo', select: 'name email avatar rating' }
        ]
      })
      .populate('raisedBy', 'name email avatar');

    if (!dispute) return res.status(404).json({ message: 'Dispute record not found' });

    res.json(dispute);
  } catch (err) { next(err); }
};

// PUT /api/admin/disputes/:id/review
exports.reviewDispute = async (req, res, next) => {
  try {
    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

    dispute.status = 'UNDER_REVIEW';
    await dispute.save();

    await AuditLog.create({
      action: 'DISPUTE_UNDER_REVIEW',
      targetJob: dispute.job,
      targetDispute: dispute._id,
      performedBy: req.user._id,
      reason: 'Dispute status marked under review'
    });

    res.json({ message: 'Dispute is now under review', dispute });
  } catch (err) { next(err); }
};

// PUT /api/admin/disputes/:id/resolve
exports.resolveDispute = async (req, res, next) => {
  try {
    const { resolutionOutcome, resolutionReason } = req.body;
    if (!['RELEASE_PAYMENT', 'REFUND_CLIENT', 'SPLIT_PAYMENT', 'REJECTED'].includes(resolutionOutcome)) {
      return res.status(400).json({ message: 'Invalid resolution outcome' });
    }

    const dispute = await Dispute.findById(req.params.id);
    if (!dispute) return res.status(404).json({ message: 'Dispute not found' });

    if (dispute.status === 'RESOLVED' || dispute.status === 'REJECTED') {
      return res.status(400).json({ message: 'Dispute is already resolved' });
    }

    const job = await Job.findById(dispute.job);
    if (!job) return res.status(404).json({ message: 'Associated job not found' });

    // Execute payment action FIRST, to handle errors correctly
    if (resolutionOutcome === 'RELEASE_PAYMENT') {
      await releaseMilestonePayment(job._id);
    } else if (resolutionOutcome === 'REFUND_CLIENT') {
      await refundClientPayment(job._id, job.budget?.max || job.budget || 0);
    } else if (resolutionOutcome === 'SPLIT_PAYMENT') {
      const totalAmount = job.budget?.max || job.budget || 0;
      const splitAmount = Math.floor(totalAmount / 2);
      // Refund 50% to client
      await refundClientPayment(job._id, splitAmount);
      // Release remaining 50% to freelancer
      // We manually construct the payout updates since releaseMilestonePayment processes the max budget
      job.status = 'COMPLETED';
      job.paymentStatus = 'RELEASED';
      job.isFunded = true;
      job.statusHistory.push({
        status: 'COMPLETED',
        timestamp: new Date()
      });
      job.workspace.push({
        sender: null,
        text: `[DISPUTE RESOLVED] Split payment: ₹${splitAmount} refunded to client, ₹${splitAmount} released to freelancer.`,
        createdAt: new Date()
      });
      await job.save();

      const targetFreelancerId = job.assignedTo;
      if (targetFreelancerId) {
        const freelancer = await User.findById(targetFreelancerId);
        if (freelancer) {
          freelancer.totalEarnings = (freelancer.totalEarnings || 0) + splitAmount;
          freelancer.completedGigs = (freelancer.completedGigs || 0) + 1;
          await freelancer.save();
        }
      }
    } else if (resolutionOutcome === 'REJECTED') {
      // Revert Job status back to IN_PROGRESS or similar
      job.status = 'IN_PROGRESS';
      job.statusHistory.push({
        status: 'IN_PROGRESS',
        timestamp: new Date()
      });
      job.workspace.push({
        sender: null,
        text: `[DISPUTE REJECTED] Platform Admin rejected the dispute. Project status reverted to IN_PROGRESS.`,
        createdAt: new Date()
      });
      await job.save();
    }

    // Now update Dispute details
    dispute.status = resolutionOutcome === 'REJECTED' ? 'REJECTED' : 'RESOLVED';
    dispute.resolutionOutcome = resolutionOutcome;
    dispute.resolutionReason = resolutionReason || '';
    dispute.resolvedBy = req.user._id;
    dispute.resolvedAt = new Date();
    await dispute.save();

    // Create AuditLog entry
    await AuditLog.create({
      action: resolutionOutcome === 'REJECTED' ? 'DISPUTE_REJECTED' : 'DISPUTE_RESOLVED',
      targetJob: job._id,
      targetDispute: dispute._id,
      performedBy: req.user._id,
      reason: resolutionReason || 'Dispute resolution action'
    });

    // Notify both freelancer and client
    await notifyDisputeResolved(dispute);

    await clearCachePattern('analytics:*');

    res.json({ message: 'Dispute successfully resolved', dispute });
  } catch (err) { next(err); }
};
