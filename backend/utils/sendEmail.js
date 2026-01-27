const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // ✅ Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  let htmlContent = options.html || '';
  
  if (!htmlContent && options.type === 'otp') {
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #002147; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">SPORTIZZZ</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #002147;">Email Verification</h2>
          <p style="color: #666; font-size: 16px;">Your verification code is:</p>
          <div style="background-color: #FF6F00; color: white; padding: 15px; border-radius: 5px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${options.otp || 'N/A'}
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
        </div>
      </div>
    `;
  }

  const message = {
    from: `SPORTIZZZ <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(message);
    console.log(`✅ Email sent to ${options.email}`);
  } catch (error) {
    console.error(`❌ Email error:`, error.message);
  }
};

module.exports = sendEmail;
