const Job = require('../models/Job');
const Notification = require('../models/Notification');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// GET /api/jobs
exports.getJobs = async (req, res, next) => {
  try {
    const { category, skill, status, search, sort, minBudget, maxBudget, duration, page = 1, limit = 12 } = req.query;
    let query = {};

    if (category) query.category = category;
    if (skill) query.skills = { $in: skill.split(',') };
    if (status) query.status = status;
    else query.status = 'open';
    if (search) query.title = { $regex: search, $options: 'i' };
    
    // Advanced Filters
    if (minBudget) query['budget.max'] = { ...query['budget.max'], $gte: Number(minBudget) };
    if (maxBudget) query['budget.max'] = { ...query['budget.max'], $lte: Number(maxBudget) };
    if (duration) query.duration = { $regex: duration, $options: 'i' };

    const parsedLimit = parseInt(limit, 10);
    const parsedPage = parseInt(page, 10);
    const skip = (parsedPage - 1) * parsedLimit;

    let jobs = Job.find(query).populate('poster', 'name avatar rating').lean();

    if (sort === 'budget') jobs = jobs.sort({ 'budget.max': -1 });
    else if (sort === 'urgent') jobs = jobs.sort({ isUrgent: -1, createdAt: -1 });
    else jobs = jobs.sort({ createdAt: -1 });

    const totalJobs = await Job.countDocuments(query);
    const result = await jobs.skip(skip).limit(parsedLimit);
    
    res.json({
       jobs: result,
       totalPages: Math.ceil(totalJobs / parsedLimit),
       currentPage: parsedPage,
       totalJobs
    });
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
    const mongoose = require('mongoose');
    
    // 0. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid job ID format' });
    }

    console.log('[APPLY] User:', req.user?._id, '| Job:', req.params.id);
    console.log('[APPLY] Body fields:', Object.keys(req.body));
    console.log('[APPLY] File:', req.file ? req.file.originalname : 'none');

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // 1. Ownership check: Poster cannot apply for their own job
    if (job.poster.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot apply for your own job listing' });
    }

    // 2. Role check: Only freelancers can apply
    if (req.user.role !== 'freelancer') {
      return res.status(403).json({ message: 'Only freelancer accounts can apply for gigs' });
    }

    const alreadyApplied = job.applicants.some(a => a.user.toString() === req.user._id.toString());
    if (alreadyApplied) return res.status(400).json({ message: 'Already applied' });

    const { message, experience, contactInfo } = req.body;
    
    let attachmentUrl = '';
    let attachmentName = '';
    if (req.file) {
      attachmentUrl = req.file.path; // Cloudinary URL
      attachmentName = req.file.originalname;
    }

    // 3. AI Vibe Match Calculation
    let vibeMatch = 75; // Default fallback
    if (process.env.GEMINI_API_KEY) {
       try {
          const prompt = `
            Act as a talent acquisition expert for a micro-gig marketplace. 
            Analyze the following Job and Applicant data to provide a 'Vibe Match' score from 0 to 100.
            The score represents both technical fit and potential personal synergy.

            JOB DATA:
            Title: ${job.title}
            Description: ${job.description}
            Required Skills: ${job.skills.join(', ')}

            APPLICANT DATA:
            Skills: ${req.user.skills?.join(', ') || 'None listed'}
            Bio: ${req.user.bio || 'None listed'}
            Cover Letter: ${message || 'No message provided'}

            Return ONLY a JSON object in this exact format: { "score": number }
          `;
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          
          // Hardened extraction
          const start = text.indexOf('{');
          const end = text.lastIndexOf('}');
          if (start !== -1 && end !== -1) {
            const jsonStr = text.substring(start, end + 1).replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
            const aiResult = JSON.parse(jsonStr);
            vibeMatch = aiResult.score || 75;
          }
       } catch (aiErr) {
          console.error('[APPLY] Gemini AI Error (non-fatal):', aiErr.message);
          // Vibe match stays at default 75
       }
    }

    job.applicants.push({ 
      user: req.user._id, 
      message: message || '',
      experience: experience || '',
      contactInfo: contactInfo || '',
      attachmentUrl,
      attachmentName,
      vibeMatch
    });
    await job.save();

    // Trigger Notification for Client
    await Notification.create({
      recipient: job.poster,
      sender: req.user._id,
      type: 'apply',
      job: job._id,
      message: `${req.user.name} applied for your gig: ${job.title}`
    });

    console.log('[APPLY] Success! User', req.user._id, 'applied to job', job._id);
    res.json({ message: 'Applied successfully' });
  } catch (err) {
    console.error('[APPLY] CRITICAL ERROR:', err.message, err.stack);
    next(err);
  }
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
// POST /api/jobs/:id/hire
exports.hireFreelancer = async (req, res, next) => {
  try {
    const { freelancerId } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Auth check: only the poster can hire
    if (job.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to hire for this job' });
    }

    if (job.status !== 'open') {
      return res.status(400).json({ message: 'Job is not open for hiring' });
    }

    const application = job.applicants.find(a => a.user.toString() === freelancerId);
    if (!application) {
      return res.status(400).json({ message: 'Freelancer has not applied to this job' });
    }

    job.assignedTo = freelancerId;
    job.status = 'in-progress';
    await job.save();

    // Trigger Notification for Freelancer
    await Notification.create({
      recipient: freelancerId,
      sender: req.user._id,
      type: 'hire',
      job: job._id,
      message: `Congratulations! You have been hired for: ${job.title}`
    });

    res.json({ message: 'Freelancer hired successfully', job });
  } catch (err) { next(err); }
};

// POST /api/jobs/:id/submit
exports.submitWork = async (req, res, next) => {
  try {
    const { content } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit for this job' });
    }

    job.status = 'needs-review';
    job.submission = { content, submittedAt: Date.now() };
    await job.save();

    // Notify Client
    await Notification.create({
      recipient: job.poster,
      sender: req.user._id,
      type: 'submission',
      job: job._id,
      message: `${req.user.name} submitted work for: ${job.title}`
    });

    res.json({ message: 'Work submitted successfully', job });
  } catch (err) { next(err); }
};

// POST /api/jobs/:id/accept
exports.acceptWork = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (job.status !== 'needs-review') {
      return res.status(400).json({ message: 'Job is not in review status' });
    }

    job.status = 'accepted';
    await job.save();

    // Notify Freelancer
    await Notification.create({
      recipient: job.assignedTo,
      sender: req.user._id,
      type: 'acceptance',
      job: job._id,
      message: `Your submission for "${job.title}" has been accepted! Proceeding to payment phase.`
    });

    res.json({ message: 'Work accepted', job });
  } catch (err) { next(err); }
};

// POST /api/jobs/:id/pay
exports.payFreelancer = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Allow paying from either needs-review or accepted
    if (job.status !== 'needs-review' && job.status !== 'accepted') {
      return res.status(400).json({ message: 'Job status invalid for payment' });
    }

    job.status = 'completed';
    await job.save();

    // Update Freelancer Stats
    const User = require('../models/User'); // Ensure User model is available
    const freelancer = await User.findById(job.assignedTo);
    if (freelancer) {
      freelancer.completedGigs += 1;
      freelancer.totalEarnings += (job.budget.max || job.budget.min || 0);
      await freelancer.save();
    }

    // Notify Freelancer
    await Notification.create({
      recipient: job.assignedTo,
      sender: req.user._id,
      type: 'other',
      job: job._id,
      message: `Payment authorized! Funds for "${job.title}" have been released to your account.`
    });

    res.json({ message: 'Payment complete', job });
  } catch (err) { next(err); }
};

// POST /api/jobs/generate
exports.generateJobData = async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required for AI generation' });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ message: 'AI Service currently unavailable (API Key missing)' });
    }

    const prompt = `
      Act as a high-end recruitment consultant for a micro-gig marketplace. 
      Generate professional job post details for the title: "${title}".
      
      Requirements for response:
      - Description: 2-3 detailed paragraphs focusing on scope, precision, and final deliverables.
      - Skills: 5 relevant technical/soft skills.
      - Duration: A realistic micro-gig timeline (e.g., '2 Days', '5 Hours', '1 Week').
      
      Return ONLY a JSON object with these keys: "description", "skills" (array of strings), and "duration".
      Do not include any markdown fences or extra talk.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Hardened JSON extraction
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    
    if (start === -1 || end === -1) {
      console.error('[AI RAW RESPONSE]:', text);
      throw new Error('AI returned malformed data');
    }
    
    const jsonStr = text.substring(start, end + 1)
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove hidden control characters
      .trim();
      
    const data = JSON.parse(jsonStr);
    res.json(data);
  } catch (err) {
    console.error('[AI GENERATE ERROR]:', err.message);
    res.status(500).json({ 
      message: 'AI failed to generate content.',
      error: err.message, // Expose for debugging
      suggestion: 'Please check if your GEMINI_API_KEY is correctly set in Vercel environment variables.'
    });
  }
};
