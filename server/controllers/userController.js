const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');

// GET /api/users — list freelancers
exports.getUsers = async (req, res, next) => {
  try {
    const { skill, sort, search, limit = 12, page = 1, featured, verified } = req.query;
    let query = { role: 'freelancer' };

    if (skill) query.skills = { $in: skill.split(',') };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (featured === 'true') query.rating = { $gte: 4.5 };
    if (verified === 'true') query.rating = { $gte: 4.2 };

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    let users = User.find(query).select('-password').lean();

    if (sort === 'rating') users = users.sort({ rating: -1 });
    else if (sort === 'gigs') users = users.sort({ completedGigs: -1 });
    else users = users.sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(query);
    const result = await users.skip(skip).limit(parsedLimit);

    res.json({
      freelancers: result,
      totalPages: Math.ceil(totalUsers / parsedLimit),
      currentPage: parsedPage,
      totalFreelancers: totalUsers
    });
  } catch (err) { next(err); }
};

// GET /api/users/:id
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// PUT /api/users/:id
exports.updateUser = async (req, res, next) => {
  try {
    // Authorization: users can only update their own profile
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    const updates = {};
    let role = req.user.role;

    if (req.body.name !== undefined) updates.name = req.body.name;
    
    if (req.body.role && ['client', 'freelancer'].includes(req.body.role)) {
       // Allow updating role if it's currently missing or invalid, or if explicitly requested.
       // Note: in a strict production environment, this might be restricted to once-only.
       updates.role = req.body.role;
       role = req.body.role;
    }

    if (role === 'client') {
      // Reject freelancer-specific fields
      const invalidFields = ['bio', 'skills', 'portfolio', 'guild'].filter(field => req.body[field] !== undefined);
      if (invalidFields.length > 0) {
        return res.status(400).json({ message: `Fields not allowed for client role: ${invalidFields.join(', ')}` });
      }
      
      if (req.body.clientProfile) {
        updates.clientProfile = req.body.clientProfile;
      }
    } else if (role === 'freelancer') {
      // Reject client-specific fields
      if (req.body.clientProfile !== undefined) {
        return res.status(400).json({ message: 'Fields not allowed for freelancer role: clientProfile' });
      }

      if (req.body.bio !== undefined) updates.bio = req.body.bio;
      if (req.body.skills !== undefined) updates.skills = req.body.skills;
      if (req.body.portfolio !== undefined) updates.portfolio = req.body.portfolio;
      if (req.body.guild !== undefined) updates.guild = req.body.guild;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) { next(err); }
};

// GET /api/users/guilds/stats — Aggregated Leaderboard
exports.getGuildStats = async (req, res, next) => {
  try {
    const stats = await User.aggregate([
      { $match: { guild: { $ne: "", $exists: true } } },
      {
        $group: {
          _id: "$guild",
          totalEarnings: { $sum: "$totalEarnings" },
          memberCount: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 }
    ]);

    res.json(stats);
  } catch (err) { next(err); }
};

// GET /api/users/client/stats/:clientId
exports.getClientStats = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    
    // Aggregation for read-only stats
    const stats = await Job.aggregate([
      { $match: { poster: new mongoose.Types.ObjectId(clientId) } },
      {
        $group: {
          _id: null,
          totalJobsPosted: { $sum: 1 },
          activePostings: {
            $sum: {
              $cond: [{ $in: ['$status', ['OPEN', 'APPLICATION_RECEIVED']] }, 1, 0]
            }
          },
          jobsFilled: {
            $sum: {
              $cond: [{ $ne: ['$assignedTo', null] }, 1, 0]
            }
          }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : { totalJobsPosted: 0, activePostings: 0, jobsFilled: 0 };
    const hireRate = result.totalJobsPosted > 0 ? Math.round((result.jobsFilled / result.totalJobsPosted) * 100) : 0;

    res.json({
      totalJobsPosted: result.totalJobsPosted,
      activePostings: result.activePostings,
      jobsFilled: result.jobsFilled,
      hireRate
    });
  } catch (err) { next(err); }
};

// GET /api/users/me/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'client') {
      const myJobs = await Job.find({ poster: { $in: [user._id, user._id.toString()] } })
        .populate('applicants.user', 'name avatar rating skills')
        .sort({ createdAt: -1 });

      let peopleHired = 0;
      let openOpenings = 0;
      const postedJobs = [];

      myJobs.forEach(job => {
        const statusUpper = (job.status || '').toUpperCase();
        if (statusUpper === 'OPEN' || statusUpper === 'APPLICATION_RECEIVED') openOpenings++;
        if (['HIRED', 'IN_PROGRESS', 'WORK_SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'COMPLETED'].includes(statusUpper) && job.assignedTo) {
          peopleHired++;
        }

        const safeApplicants = Array.isArray(job.applicants) ? job.applicants : [];

        postedJobs.push({
          _id: job._id,
          title: job.title || 'Untitled Gig',
          status: job.status || 'OPEN',
          createdAt: job.createdAt,
          budget: job.budget,
          assignedTo: job.assignedTo,
          applicants: safeApplicants.map(a => ({
            id: a.user?._id || a.user,
            name: a.user?.name || 'Applicant',
            avatar: a.user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.user?._id || 'user'}`,
            rating: a.user?.rating || 5,
            skills: a.user?.skills || [],
            message: a.message || '',
            experience: a.experience || '',
            contactInfo: a.contactInfo || '',
            attachmentUrl: a.attachmentUrl || '',
            attachmentName: a.attachmentName || '',
            appliedAt: a.appliedAt || job.createdAt,
            vibeMatch: a.vibeMatch || 0
          }))
        });
      });

      return res.json({
        profile: user,
        clientStats: {
          peopleHired,
          openOpenings
        },
        postedJobs
      });
    }

    // Freelancer Dashboard Logic
    const appliedJobs = await Job.find({ 'applicants.user': user._id }).populate('poster', 'name avatar');
    const assignedJobs = await Job.find({ assignedTo: user._id }).populate('poster', 'name avatar');

    const Review = require('../models/Review');
    const userReviews = await Review.find({ reviewer: user._id }).select('job');
    const reviewedJobIds = userReviews.map(r => r.job?.toString());

    const history = [];
    appliedJobs.forEach(job => {
       const app = job.applicants.find(a => a.user.toString() === user._id.toString());
        history.push({
          _id: job._id,
          title: job.title,
          status: job.status,
          poster: job.poster?.name || 'Unknown Client',
          posterId: job.poster?._id,
          date: app ? app.appliedAt : job.createdAt,
          role: 'Applicant',
          budget: job.budget.max,
          submission: job.submission || null,
          hasReviewed: reviewedJobIds.includes(job._id.toString())
        });
    });

    assignedJobs.forEach(job => {
       if (!history.find(h => h._id.toString() === job._id.toString())) {
          history.push({
            _id: job._id,
            title: job.title,
            status: job.status,
            poster: job.poster?.name || 'Unknown Client',
            posterId: job.poster?._id,
            date: job.createdAt,
            role: 'Assigned Worker',
            budget: job.budget.max,
            submission: job.submission || null,
            hasReviewed: reviewedJobIds.includes(job._id.toString())
          });
       } else {
         const existing = history.find(h => h._id.toString() === job._id.toString());
         existing.role = 'Assigned Worker';
         existing.hasReviewed = reviewedJobIds.includes(job._id.toString());
       }
    });

    // Sort descending by date
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      profile: user,
      recruitmentHistory: history,
      earnings: user.totalEarnings,
      rating: user.rating,
      completedGigs: user.completedGigs
    });
  } catch (err) { next(err); }
};
