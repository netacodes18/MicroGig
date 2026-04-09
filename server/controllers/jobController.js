const Job = require('../models/Job');

// GET /api/jobs
exports.getJobs = async (req, res, next) => {
  try {
    const { category, skill, status, search, sort } = req.query;
    let query = {};

    if (category) query.category = category;
    if (skill) query.skills = { $in: skill.split(',') };
    if (status) query.status = status;
    else query.status = 'open';
    if (search) query.title = { $regex: search, $options: 'i' };

    let jobs = Job.find(query).populate('poster', 'name avatar rating');

    if (sort === 'budget') jobs = jobs.sort({ 'budget.max': -1 });
    else if (sort === 'urgent') jobs = jobs.sort({ isUrgent: -1, createdAt: -1 });
    else jobs = jobs.sort({ createdAt: -1 });

    const result = await jobs;
    res.json(result);
  } catch (err) { next(err); }
};

// GET /api/jobs/:id
exports.getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('poster', 'name avatar rating reviewCount bio skills')
      .populate('applicants.user', 'name avatar rating');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) { next(err); }
};

// POST /api/jobs
exports.createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ ...req.body, poster: req.user._id });
    res.status(201).json(job);
  } catch (err) { next(err); }
};

// PUT /api/jobs/:id
exports.updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.poster.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (err) { next(err); }
};

// POST /api/jobs/:id/apply
exports.applyToJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const alreadyApplied = job.applicants.some(a => a.user.toString() === req.user._id.toString());
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied' });

    job.applicants.push({ user: req.user._id, message: req.body.message || '' });
    await job.save();
    res.json({ message: 'Applied successfully' });
  } catch (err) { next(err); }
};

// DELETE /api/jobs/:id
exports.deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.poster.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });
    await job.deleteOne();
    res.json({ message: 'Job deleted' });
  } catch (err) { next(err); }
};
