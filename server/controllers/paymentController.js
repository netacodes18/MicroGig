const Razorpay = require('razorpay');
const crypto = require('crypto');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Initialize Razorpay
// Note: These will be placeholders until user provides real keys in .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

// @desc    Create a Razorpay Order
// @route   POST /api/payments/order
// @access  Private (Employer)
exports.createOrder = async (req, res, next) => {
  try {
    const { jobId } = req.body;
    const job = await Job.findById(jobId);

    if (!job) return res.status(404).json({ message: 'Job not found' });
    
    // Authorization check
    if (job.poster.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to pay for this job' });
    }

    // Amount in Razorpay is in smallest currency unit (paise for INR)
    // We'll use job.budget.max for simplicity
    const amount = job.budget.max * 100; 
    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_job_${jobId}`,
      notes: {
        jobId: jobId.toString(),
        posterId: req.user._id.toString(),
        workerId: job.assignedTo?.toString()
      }
    };

    const order = await razorpay.orders.create(options);
    res.json({
      ...order,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_id'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify Razorpay Payment Signature
// @route   POST /api/payments/verify
// @access  Private (Employer)
exports.verifyPayment = async (req, res, next) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      jobId 
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // -----------------------------------------------------------------
    // PAYMENT SUCCESSFUL -> UPDATE JOB & EARNINGS
    // -----------------------------------------------------------------
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job record not found after payment' });

    // 1. Update Job Status
    job.status = 'completed';
    job.paymentDetails = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      paidAt: new Date()
    };
    await job.save();

    // 2. Update Freelancer Earnings
    if (job.assignedTo) {
      const freelancer = await User.findById(job.assignedTo);
      if (freelancer) {
        freelancer.totalEarnings = (freelancer.totalEarnings || 0) + job.budget.max;
        freelancer.completedGigs = (freelancer.completedGigs || 0) + 1;
        await freelancer.save();

        // 3. Notify Freelancer
        await Notification.create({
          recipient: job.assignedTo,
          sender: job.poster,
          type: 'other',
          job: job._id,
          message: `Payment authorized! ₹${job.budget.max} has been added to your profile for "${job.title}".`
        });
      }
    }

    res.json({ message: 'Payment verified and funds released successfully', jobId });
  } catch (err) {
    next(err);
  }
};
