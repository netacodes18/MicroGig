const { sendContactEmail } = require('../services/emailService');

// POST /api/contact
exports.submitContactForm = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields (name, email, subject, message) are required.' });
    }

    const emailResult = await sendContactEmail({ name, email, subject, message });

    res.status(200).json({
      success: true,
      message: 'Your inquiry has been sent successfully. We will get back to you shortly.',
      mode: emailResult.mode
    });
  } catch (err) {
    next(err);
  }
};
