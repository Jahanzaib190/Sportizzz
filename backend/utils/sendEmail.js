const nodemailer = require('nodemailer');
const axios = require('axios');

const sendEmail = async (options) => {
  // Try Brevo API first (works better on cloud hosting like Render)
  if (process.env.BREVO_API_KEY) {
    try {
      const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
        to: [{ email: options.email }],
        sender: { email: process.env.EMAIL_USER, name: 'SPORTIZZZ' },
        subject: options.subject,
        htmlContent: options.html || options.message,
        textContent: options.message,
      }, {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log(`✅ Email sent via Brevo API to ${options.email}`);
      return;
    } catch (error) {
      console.error(`❌ Brevo API error:`, error.message);
      if (options.otp) {
        console.log(`🔑 FALLBACK OTP for ${options.email}: ${options.otp}`);
      }
      return;
    }
  }

  // Fallback to SMTP (for local dev)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // 10 seconds max
    greetingTimeout: 5000,
    socketTimeout: 15000,
  });

  let htmlContent = options.html || '';

  // OTP template
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

  // Order template
  if (!htmlContent && options.type === 'order') {
    const orderItems = options.order?.orderItems?.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Qty: ${item.qty}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${item.price}</td>
      </tr>
    `).join('') || '';

    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #002147; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">SPORTIZZZ</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px;">Order Confirmation</p>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #002147;">Order Confirmed!</h2>
          <p style="color: #666; font-size: 16px;">Hi ${options.name || 'Customer'},</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">Thank you for your order!</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #333; margin: 5px 0;"><strong>Order ID:</strong> ${options.order?._id || 'N/A'}</p>
            <p style="color: #333; margin: 5px 0;"><strong>Total Amount:</strong> Rs. ${options.order?.totalPrice || 'N/A'}</p>
            <p style="color: #333; margin: 5px 0;"><strong>Status:</strong> Pending</p>
          </div>
          <h3 style="color: #002147; margin-top: 25px; margin-bottom: 15px;">Order Items:</h3>
          <table style="width: 100%; border-collapse: collapse;">${orderItems}</table>
        </div>
      </div>
    `;
  }

  const message = {
    from: `SPORTIZZZ <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: htmlContent || options.html || options.message,
  };

  try {
    await transporter.sendMail(message);
    console.log(`✅ Email sent to ${options.email}`);
  } catch (error) {
    console.error(`❌ Email error to ${options.email}:`, error.message);
    console.error(`SMTP Config: ${process.env.EMAIL_HOST}:${process.env.EMAIL_PORT}, User: ${process.env.EMAIL_USER?.substring(0, 3)}***`);
    
    // ⚠️ DEBUG ONLY - Log OTP when email fails (REMOVE IN PRODUCTION)
    if (options.otp) {
      console.log(`🔑 FALLBACK OTP for ${options.email}: ${options.otp}`);
    }
    // Don't block flow on email errors
  }
};

module.exports = sendEmail;
