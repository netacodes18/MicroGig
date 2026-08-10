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
    job.statusHistory.push({
      status: 'COMPLETED',
      changedBy: req.user._id,
      timestamp: new Date()
    });
    
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

// Helper to refund client payment via Razorpay (called by admin controller)
exports.refundClientPayment = async (jobId, amount) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  // If there are payment details (the client paid)
  if (job.paymentDetails && job.paymentDetails.paymentId) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Payment gateway configuration missing.');
    }
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    // Refund order
    await razorpay.payments.refund(job.paymentDetails.paymentId, {
      amount: amount * 100 // in paise
    });
  }
  
  // Update Job Status
  job.status = 'REFUNDED';
  job.paymentStatus = 'REFUNDED';
  job.statusHistory.push({
    status: 'REFUNDED',
    timestamp: new Date()
  });
  
  job.workspace.push({
    sender: null,
    text: `[DISPUTE RESOLVED] Refund of ₹${amount} initiated to the client. Job marked REFUNDED.`,
    createdAt: new Date()
  });

  await job.save();
};

// Helper to release milestone payment via Razorpay (called by admin controller)
exports.releaseMilestonePayment = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  // Update Job Status to COMPLETED & Payment released
  job.status = 'COMPLETED';
  job.paymentStatus = 'RELEASED';
  job.isFunded = true;
  job.statusHistory.push({
    status: 'COMPLETED',
    timestamp: new Date()
  });

  job.workspace.push({
    sender: null,
    text: `[DISPUTE RESOLVED] Platform Admin released the payment of ₹${job.budget.max} to the freelancer. Job marked COMPLETED.`,
    createdAt: new Date()
  });

  await job.save();

  // Update Freelancer earnings
  const targetFreelancerId = job.assignedTo;
  if (targetFreelancerId) {
    const freelancer = await User.findById(targetFreelancerId);
    if (freelancer) {
      freelancer.totalEarnings = (freelancer.totalEarnings || 0) + (job.budget.max || 0);
      freelancer.completedGigs = (freelancer.completedGigs || 0) + 1;
      await freelancer.save();
    }
  }
};

const PDFDocument = require('pdfkit');

// @desc    Get Client Invoices
// @route   GET /api/payments/invoices
// @access  Private (Employer)
exports.getInvoices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;

    // We only want jobs where the current user is the poster and the payment was released successfully
    const query = {
      poster: req.user._id,
      paymentStatus: 'RELEASED',
      'paymentDetails.paymentId': { $exists: true, $ne: null }
    };

    const jobs = await Job.find(query)
      .sort({ 'paymentDetails.paidAt': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Job.countDocuments(query);

    const invoices = jobs.map(job => ({
      jobId: job._id,
      jobTitle: job.title,
      amount: job.budget.max,
      currency: 'INR', // Currently platform defaults to INR
      paymentId: job.paymentDetails.paymentId,
      paidAt: job.paymentDetails.paidAt
    }));

    res.json({
      invoices,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download PDF Invoice
// @route   GET /api/payments/invoices/:jobId/download
// @access  Private (Employer)
exports.downloadInvoice = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    // Step 1: Authorization
    const job = await Job.findById(jobId).populate('poster', 'name email clientProfile').populate('assignedTo', 'name');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (job.poster._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this invoice' });
    }

    if (job.paymentStatus !== 'RELEASED' || !job.paymentDetails?.paymentId) {
      return res.status(400).json({ message: 'No completed payment exists for this job' });
    }

    // Validate required fields
    if (!job.title || !job.budget?.max || !job.paymentDetails.paidAt) {
      return res.status(500).json({ message: 'Incomplete payment data for PDF generation' });
    }

    // Step 2: Filename sanitization
    const sanitizedTitle = job.title.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 30);
    const filename = `Invoice_${sanitizedTitle}_${jobId}.pdf`;

    // Step 3: Generate PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 50 });
    
    // Error handling during stream
    doc.on('error', (err) => {
      console.error('PDFKit error:', err);
      res.end(); // terminate stream cleanly
    });

    doc.pipe(res);

    // --- PDF Content ---

    // Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('MicroGig', { align: 'right' })
      .fontSize(10)
      .font('Helvetica')
      .text('Platform Receipt', { align: 'right' })
      .moveDown(2);

    // Title
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('Payment Receipt', { align: 'left' })
      .moveDown();

    // Details Grid
    const leftCol = 50;
    const rightCol = 300;
    let yPos = doc.y;

    doc.fontSize(10).font('Helvetica-Bold').text('Receipt For:', leftCol, yPos);
    doc.font('Helvetica').text(job.poster.name, leftCol, yPos + 15);
    if (job.poster.clientProfile?.companyName) {
      doc.text(job.poster.clientProfile.companyName, leftCol, yPos + 30);
    }
    doc.text(job.poster.email, leftCol, yPos + 45);

    doc.font('Helvetica-Bold').text('Payment Details:', rightCol, yPos);
    doc.font('Helvetica').text(`Payment ID: ${job.paymentDetails.paymentId}`, rightCol, yPos + 15);
    doc.text(`Date: ${new Date(job.paymentDetails.paidAt).toLocaleDateString()}`, rightCol, yPos + 30);
    doc.text(`Order ID: ${job.paymentDetails.orderId || 'N/A'}`, rightCol, yPos + 45);

    doc.moveDown(5);
    yPos = doc.y + 20;

    // Line items header
    doc.rect(leftCol, yPos, 500, 20).fill('#f0f0f0');
    doc.fillColor('#000000').font('Helvetica-Bold');
    doc.text('Description', leftCol + 10, yPos + 5);
    doc.text('Amount (INR)', rightCol + 150, yPos + 5, { width: 90, align: 'right' });

    // Line item
    yPos += 30;
    doc.font('Helvetica');
    doc.text(`Job: ${job.title}`, leftCol + 10, yPos);
    doc.text(`Freelancer: ${job.assignedTo?.name || 'N/A'}`, leftCol + 10, yPos + 15);
    
    // Amount
    const amountStr = `Rs. ${job.budget.max.toFixed(2)}`;
    doc.text(amountStr, rightCol + 150, yPos, { width: 90, align: 'right' });

    // Total
    yPos += 50;
    doc.moveTo(leftCol, yPos).lineTo(leftCol + 500, yPos).stroke();
    yPos += 15;
    
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total Paid:', rightCol + 50, yPos);
    doc.text(amountStr, rightCol + 150, yPos, { width: 90, align: 'right' });

    // Footer
    doc.moveDown(10);
    doc.fontSize(10).font('Helvetica').fillColor('#888888').text(
      'This is a computer-generated receipt for services rendered on the MicroGig platform.',
      leftCol,
      doc.page.height - 100,
      { align: 'center', width: 500 }
    );

    // Finalize PDF
    doc.end();

  } catch (err) {
    if (!res.headersSent) {
      next(err);
    } else {
      console.error('Error streaming PDF invoice:', err);
      res.end();
    }
  }
};
