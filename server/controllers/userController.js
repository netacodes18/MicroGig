const User = require('../models/User');
const Job = require('../models/Job');

// GET /api/users — list freelancers
exports.getUsers = async (req, res, next) => {
  try {
    const { skill, sort, search } = req.query;
    let query = {};

    if (skill) query.skills = { $in: skill.split(',') };
    if (search) query.name = { $regex: search, $options: 'i' };

    let users = User.find(query).select('-password');

    if (sort === 'rating') users = users.sort({ rating: -1 });
    else if (sort === 'gigs') users = users.sort({ completedGigs: -1 });
    else users = users.sort({ createdAt: -1 });

    const result = await users;
    res.json(result);
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
    const { name, bio, skills, portfolio } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, bio, skills, portfolio },
      { new: true, runValidators: true }
    ).select('-password');
    res.json(user);
  } catch (err) { next(err); }
};

// GET /api/users/me/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.role === 'client') {
      const myJobs = await Job.find({ poster: user._id }).populate('applicants.user', 'name avatar rating skills').sort({ createdAt: -1 });

      let peopleHired = 0;
      let openOpenings = 0;
      const postedJobs = [];

      myJobs.forEach(job => {
        if (job.status === 'open') openOpenings++;
        if ((job.status === 'in-progress' || job.status === 'completed') && job.assignedTo) {
          peopleHired++;
        }

        postedJobs.push({
          _id: job._id,
          title: job.title,
          status: job.status,
          createdAt: job.createdAt,
          budget: job.budget,
          applicants: job.applicants.map(a => ({
            id: a.user?._id,
            name: a.user?.name,
            avatar: a.user?.avatar,
            rating: a.user?.rating,
            skills: a.user?.skills || [],
            message: a.message,
            appliedAt: a.appliedAt
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

    const history = [];
    appliedJobs.forEach(job => {
       const app = job.applicants.find(a => a.user.toString() === user._id.toString());
       history.push({
         _id: job._id,
         title: job.title,
         status: job.status,
         poster: job.poster?.name || 'Unknown Client',
         date: app ? app.appliedAt : job.createdAt,
         role: 'Applicant',
         budget: job.budget.max
       });
    });

    assignedJobs.forEach(job => {
       if (!history.find(h => h._id.toString() === job._id.toString())) {
         history.push({
           _id: job._id,
           title: job.title,
           status: job.status,
           poster: job.poster?.name || 'Unknown Client',
           date: job.createdAt,
           role: 'Assigned Worker',
           budget: job.budget.max
         });
       } else {
         const existing = history.find(h => h._id.toString() === job._id.toString());
         existing.role = 'Assigned Worker';
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
