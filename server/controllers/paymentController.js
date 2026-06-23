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

    // Work must be APPROVED and paymentStatus READY_FOR_RELEASE
    if (job.status !== 'APPROVED' || job.paymentStatus !== 'READY_FOR_RELEASE') {
      return res.status(400).json({ message: 'Job is not approved and ready for payment release yet' });
    }

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
    // PAYMENT SUCCESSFUL -> RELEASE PAYMENT & COMPLETE PROJECT
    // -----------------------------------------------------------------
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job record not found after payment' });

    // Update Job Status to COMPLETED & Payment released
    job.status = 'COMPLETED';
    job.paymentStatus = 'RELEASED';
    job.isFunded = true;
    
    job.paymentDetails = {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      paidAt: new Date()
    };

    // Log payment in workspace
    job.workspace.push({
      sender: req.user._id,
      text: `[PAYMENT RELEASED] Payment of ₹${job.budget.max} successfully released. Project marked COMPLETED.`,
      createdAt: new Date()
    });

    await job.save();

    // Update Freelancer earnings
    const targetFreelancerId = freelancerId || job.assignedTo;
    if (targetFreelancerId) {
      const freelancer = await User.findById(targetFreelancerId);
      if (freelancer) {
        freelancer.totalEarnings = (freelancer.totalEarnings || 0) + (job.budget.max || 0);
        freelancer.completedGigs = (freelancer.completedGigs || 0) + 1;
        await freelancer.save();
      }
    }

    // Notify Freelancer
    if (targetFreelancerId) {
      await Notification.create({
        recipient: targetFreelancerId,
        sender: job.poster,
        type: 'payment',
        job: job._id,
        message: `Congratulations! Payment of ₹${job.budget.max} has been released for "${job.title}".`
      });
    }

    res.json({ message: 'Payment released and project marked completed successfully', jobId });
  } catch (err) {
    next(err);
  }
};
