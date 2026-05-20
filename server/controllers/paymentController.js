const Razorpay = require('razorpay');
const crypto = require('crypto');
const Job = require('../models/Job');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Razorpay initialization happens inside the controllers to prevent server crash on boot if keys are missing.

// @desc    Create a Razorpay Order
// @route   POST /api/payments/order
// @access  Private (Employer)
exports.createOrder = async (req, res, next) => {
  try {
    const { jobId, freelancerId } = req.body;
    const job = await Job.findById(jobId);

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Payment gateway configuration missing. Please contact support.' });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

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
        workerId: freelancerId?.toString() || job.assignedTo?.toString()
      }
    };

    const order = await razorpay.orders.create(options);
    res.json({
      ...order,
      keyId: process.env.RAZORPAY_KEY_ID
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
      jobId,
      freelancerId
    } = req.body;

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: 'Payment gateway configuration missing. Please contact support.' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid payment signature' });
    }

    // -----------------------------------------------------------------
    // PAYMENT SUCCESSFUL -> UPDATE JOB TO FUNDED & HIRE FREELANCER
    // -----------------------------------------------------------------
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job record not found after payment' });

    // 1. Update Job Status to In-Progress (Funded)
    job.status = 'in-progress';
    job.isFunded = true;
    if (freelancerId) {
      job.assignedTo = freelancerId;
    }
    
    job.paymentDetails = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      paidAt: new Date()
    };
    await job.save();

    // 2. Notify Freelancer
    if (job.assignedTo) {
      await Notification.create({
        recipient: job.assignedTo,
        sender: job.poster,
        type: 'hire',
        job: job._id,
        message: `Congratulations! You have been hired for "${job.title}". The client has deposited ₹${job.budget.max} into Escrow.`
      });
    }

    res.json({ message: 'Escrow funded and freelancer hired successfully', jobId });
  } catch (err) {
    next(err);
  }
};
