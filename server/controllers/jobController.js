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
      .populate('applicants.user', 'name avatar rating')
      .populate('statusHistory.changedBy', 'name');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) { next(err); }
};

// POST /api/jobs
exports.createJob = async (req, res, next) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ message: 'Only client accounts can post gigs' });
    }
    const job = await Job.create({
      ...req.body,
      poster: req.user._id,
      statusHistory: [{
        status: 'OPEN',
        changedBy: req.user._id,
        timestamp: new Date()
      }]
    });
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

    const { message, experience, contactInfo, bidAmount, deliveryTime, portfolioUrl } = req.body;
    
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
      vibeMatch,
      bidAmount: Number(bidAmount) || 0,
      deliveryTime: deliveryTime || '',
      portfolioUrl: portfolioUrl || '',
      status: 'PENDING'
    });

    if (job.status === 'OPEN' || job.status === 'open') {
      job.status = 'APPLICATION_RECEIVED';
      job.statusHistory.push({
        status: 'APPLICATION_RECEIVED',
        changedBy: req.user._id,
        timestamp: new Date()
      });
    }
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
// Hire functionality moved to paymentController via Escrow Deposit

// POST /api/jobs/:id/submit
exports.submitWork = async (req, res, next) => {
  try {
    const { content } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit for this job' });
    }

    let aiVerificationScore = null;
    let aiVerificationNotes = '';

    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = `
          Act as an AI Escrow Verifier for a micro-gig marketplace.
          Your task is to review the freelancer's submission and compare it against the original job scope.

          JOB DATA:
          Title: ${job.title}
          Description: ${job.description}
          Required Skills: ${job.skills.join(', ')}

          FREELANCER SUBMISSION:
          ${content}

          Return ONLY a JSON object in this exact format:
          {
            "score": <number 0-100 representing how well the submission meets the job data>,
            "notes": "<1-2 sentence summary of what was achieved and what might be missing>"
          }
        `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          const jsonStr = text.substring(start, end + 1).replace(/[\u0000-\u001F\u007F-\u009F]/g, "").trim();
          const aiResult = JSON.parse(jsonStr);
          aiVerificationScore = aiResult.score != null ? Number(aiResult.score) : null;
          aiVerificationNotes = aiResult.notes || '';
        }
      } catch (aiErr) {
        console.error('[AI ESCROW] Verification Error (non-fatal):', aiErr.message);
      }
    }

    job.status = 'WORK_SUBMITTED';
    job.submission = { 
      content, 
      submittedAt: Date.now(),
      aiVerificationScore,
      aiVerificationNotes
    };
    job.statusHistory.push({
      status: 'WORK_SUBMITTED',
      changedBy: req.user._id,
      timestamp: new Date()
    });

    // Log the submission in the workspace
    job.workspace.push({
      sender: req.user._id,
      text: `[WORK SUBMITTED] Deliverable details: ${content}`,
      createdAt: new Date()
    });

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

    job.status = 'APPROVED';
    job.paymentStatus = 'READY_FOR_RELEASE';
    job.statusHistory.push({
      status: 'APPROVED',
      changedBy: req.user._id,
      timestamp: new Date()
    });
    
    // Log the approval in workspace
    job.workspace.push({
      sender: req.user._id,
      text: `[WORK APPROVED] Project deliverables approved. Ready for payment release.`,
      createdAt: new Date()
    });

    await job.save();

    // Notify Freelancer
    await Notification.create({
      recipient: job.assignedTo,
      sender: req.user._id,
      type: 'other',
      job: job._id,
      message: `Your work for "${job.title}" has been approved! The client can now release payment.`
    });

    res.json({ message: 'Work approved successfully. Payment is ready for release.', job });
  } catch (err) { next(err); }
};

// POST /api/jobs/:id/approve (Same as acceptWork for route safety)
exports.approveWork = exports.acceptWork;

// POST /api/jobs/:id/revision
exports.requestRevisions = async (req, res, next) => {
  try {
    const { feedback } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    job.status = 'REVISION_REQUESTED';
    job.revisionFeedback = feedback || '';
    job.statusHistory.push({
      status: 'REVISION_REQUESTED',
      changedBy: req.user._id,
      timestamp: new Date()
    });

    // Append revision feedback as a message to the workspace
    job.workspace.push({
      sender: req.user._id,
      text: `[REVISION REQUESTED] Feedback: ${feedback || 'Please review and make adjustments.'}`,
      createdAt: new Date()
    });

    await job.save();

    // Notify freelancer
    await Notification.create({
      recipient: job.assignedTo,
      sender: req.user._id,
      type: 'other',
      job: job._id,
      message: `Revision requested for "${job.title}". Feedback: ${feedback || 'No comments left.'}`
    });

    res.json({ message: 'Revision requested successfully', job });
  } catch (err) { next(err); }
};

// POST /api/jobs/:id/workspace/message
exports.postWorkspaceMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const isPoster = job.poster.toString() === req.user._id.toString();
    const isAssigned = job.assignedTo && job.assignedTo.toString() === req.user._id.toString();

    if (!isPoster && !isAssigned) {
      return res.status(403).json({ message: 'Not authorized to post to this workspace' });
    }

    let attachments = [];
    if (req.file) {
      attachments.push({
        url: req.file.path,
        name: req.file.originalname
      });
    }

    job.workspace.push({
      sender: req.user._id,
      text: text || 'Uploaded a file',
      attachments,
      createdAt: new Date()
    });

    await job.save();
    
    // Notify other party
    const recipient = isPoster ? job.assignedTo : job.poster;
    if (recipient) {
      await Notification.create({
        recipient,
        sender: req.user._id,
        type: 'other',
        job: job._id,
        message: `${req.user.name} posted an update in the project workspace: ${job.title}`
      });
    }

    res.json({ message: 'Workspace message posted successfully', workspace: job.workspace });
  } catch (err) { next(err); }
};

// POST /api/jobs/:id/hire
exports.hireFreelancer = async (req, res, next) => {
  try {
    const { freelancerId } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Assign worker & change status to IN_PROGRESS
    job.assignedTo = freelancerId;
    job.status = 'IN_PROGRESS';
    job.statusHistory.push({
      status: 'IN_PROGRESS',
      changedBy: req.user._id,
      timestamp: new Date()
    });

    // Update applicant statuses
    job.applicants.forEach(a => {
      if (a.user.toString() === freelancerId.toString()) {
        a.status = 'HIRED';
      } else {
        a.status = 'REJECTED';
      }
    });

    // Initialize workspace with a default welcome message
    job.workspace = [{
      sender: req.user._id,
      text: `Project Workspace initiated. Welcome aboard! Let's get started on: "${job.title}"`,
      createdAt: new Date()
    }];

    await job.save();

    // Notify Hired Freelancer
    await Notification.create({
      recipient: freelancerId,
      sender: req.user._id,
      type: 'hire',
      job: job._id,
      message: `Congratulations! You have been hired for "${job.title}".`
    });

    // Notify Rejected Freelancers
    const rejectedApplicants = job.applicants.filter(a => a.user.toString() !== freelancerId.toString());
    for (const applicant of rejectedApplicants) {
      if (applicant.user) {
        await Notification.create({
          recipient: applicant.user,
          sender: req.user._id,
          type: 'other',
          job: job._id,
          message: `Your application for "${job.title}" was not selected.`
        });
      }
    }

    res.json({ message: 'Freelancer hired successfully', job });
  } catch (err) { next(err); }
};

// POST /api/jobs/generate
exports.generateJobData = async (req, res, next) => {
  try {
    const { title, notes } = req.body;
    if (!title && !notes) return res.status(400).json({ message: 'Missing input for AI generation' });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ message: 'AI Service currently unavailable (API Key missing)' });
    }

    const prompt = `
      Act as a high-end Recruitment Architect for a high-velocity micro-gig marketplace. 
      Your goal is to take ${notes ? 'raw, messy notes' : 'a short title'} and produce a professional, "High-Signal" job posting.
      
      INPUT:
      ${notes ? `RAW NOTES: "${notes}"` : `TITLE: "${title}"`}
      
      Requirements for response:
      - Title: Refine it to be catchy and professional (max 50 chars).
      - Description: 2-3 detailed paragraphs focusing on scope, precision, and final deliverables. Make it sound high-stakes.
      - Category: One of ['Technology & IT', 'Creative & Design', 'Writing & Translation', 'Marketing & Sales', 'Business & Operations', 'Lifestyle & Health', 'Photography & Media', 'Events & Hospitality', 'Other Services'].
      - Skills: 5 relevant technical/soft skills.
      - Duration: A realistic micro-gig timeline (e.g., '2 Days', '5 Hours', '1 Week').
      - Budget Suggestions: A realistic Min and Max budget in USD (numeric values only).
      
      Return ONLY a JSON object with these exact keys: "title", "description", "category", "skills" (array), "duration", "budgetMin", "budgetMax".
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
      error: err.message,
      suggestion: 'Please check if your GEMINI_API_KEY is correctly set.'
    });
  }
};

// POST /api/jobs/:id/reject
exports.rejectApplicant = async (req, res, next) => {
  try {
    const { applicantId } = req.body;
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    if (job.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applicant = job.applicants.find(a => a.user.toString() === applicantId.toString());
    if (applicant) {
      applicant.status = 'REJECTED';

      // Notify freelancer
      await Notification.create({
        recipient: applicantId,
        sender: req.user._id,
        type: 'other',
        job: job._id,
        message: `Your application for "${job.title}" was not selected.`
      });
    }

    await job.save();
    res.json({ message: 'Applicant rejected successfully', job });
  } catch (err) { next(err); }
};
