const nodemailer = require('nodemailer');

// Configure Transporter with Environment Variables or Fallback Mock
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // Return null transporter if SMTP credentials are missing (Mock Mode)
  return null;
};

// Send Contact Us Form Email
exports.sendContactEmail = async ({ name, email, subject, message }) => {
  const transporter = createTransporter();
  const fromEmail = process.env.EMAIL_FROM || 'noreply@microgig.com';
  const adminEmail = process.env.ADMIN_EMAIL || 'support@microgig.com';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #000; padding: 24px; background: #ffffff;">
      <h2 style="text-transform: uppercase; letter-spacing: 2px; color: #0a0a0a; border-bottom: 2px solid #000; padding-bottom: 12px; margin-top: 0;">
        New Contact Inquiry - MicroGig
      </h2>
      <p style="font-size: 14px; color: #333;"><strong>From:</strong> ${name} (&lt;${email}&gt;)</p>
      <p style="font-size: 14px; color: #333;"><strong>Subject:</strong> ${subject}</p>
      <hr style="border: 0; border-top: 1px solid #ccc; margin: 16px 0;" />
      <h4 style="text-transform: uppercase; font-size: 12px; letter-spacing: 1px; color: #666; margin-bottom: 8px;">Message:</h4>
      <div style="background: #f9f9f9; border-left: 4px solid #000; padding: 16px; font-size: 14px; color: #111; line-height: 1.6; white-space: pre-wrap;">
        ${message}
      </div>
      <hr style="border: 0; border-top: 1px solid #ccc; margin: 24px 0 12px 0;" />
      <p style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
        Sent automatically via MicroGig Platform API
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${name} via MicroGig" <${fromEmail}>`,
        to: adminEmail,
        replyTo: email,
        subject: `[Contact Form] ${subject}`,
        html: htmlContent,
      });
      return { success: true, mode: 'smtp' };
    } catch (err) {
      console.error('SMTP Email Error:', err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log('\n📧 [MOCK EMAIL SERVICE] Contact Form Submission Received:');
    console.log(`From: ${name} <${email}>`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}\n`);
    return { success: true, mode: 'mock' };
  }
};

// Send General Notification Email (e.g. Gig status updates, applications)
exports.sendNotificationEmail = async ({ to, subject, title, bodyContent }) => {
  const transporter = createTransporter();
  const fromEmail = process.env.EMAIL_FROM || 'notifications@microgig.com';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid #000; padding: 24px; background: #ffffff;">
      <h2 style="text-transform: uppercase; letter-spacing: 2px; color: #0a0a0a; border-bottom: 2px solid #000; padding-bottom: 12px; margin-top: 0;">
        ${title || 'MicroGig Notification'}
      </h2>
      <div style="font-size: 14px; color: #222; line-height: 1.6; margin-top: 16px;">
        ${bodyContent}
      </div>
      <hr style="border: 0; border-top: 1px solid #ccc; margin: 24px 0 12px 0;" />
      <p style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; margin: 0;">
        MicroGig Workspace System Notification
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"MicroGig" <${fromEmail}>`,
        to,
        subject,
        html: htmlContent,
      });
      return { success: true, mode: 'smtp' };
    } catch (err) {
      console.error('SMTP Notification Error:', err.message);
      return { success: false, error: err.message };
    }
  } else {
    console.log(`\n📧 [MOCK EMAIL SERVICE] Notification to ${to}: ${subject}`);
    return { success: true, mode: 'mock' };
  }
};
