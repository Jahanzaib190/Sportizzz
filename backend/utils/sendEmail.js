const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // ✅ Create transporter (reuse for all email types)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // ✅ Determine email type and generate HTML
  let htmlContent = options.html || '';
  
  // If no HTML provided, generate based on type
  if (!htmlContent && options.type === 'otp') {
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #002147; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">SPORTIZZZ</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color: #002147; margin-top: 0;">Email Verification</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your verification code is:
          </p>
          <div style="background-color: #FF6F00; color: white; padding: 15px 20px; border-radius: 5px; text-align: center; font-size: 28px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${options.otp || 'N/A'}
          </div>
          <p style="color: #666; font-size: 14px;">
            This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
          </p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      </div>
    `;
  } else if (!htmlContent && options.type === 'order') {
    // ✅ Order Confirmation Email Template
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
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          <h2 style="color: #002147; margin-top: 0;">Order Confirmed!</h2>
          <p style="color: #666; font-size: 16px;">Hi ${options.name || 'Customer'},</p>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            Thank you for your order! Your order has been successfully placed and will be delivered soon.
          </p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #333; margin: 5px 0;"><strong>Order ID:</strong> ${options.order?._id || 'N/A'}</p>
            <p style="color: #333; margin: 5px 0;"><strong>Total Amount:</strong> Rs. ${options.order?.totalPrice || 'N/A'}</p>
            <p style="color: #333; margin: 5px 0;"><strong>Status:</strong> <span style="color: #FF6F00; font-weight: bold;">Pending</span></p>
          </div>

          <h3 style="color: #002147; margin-top: 25px; margin-bottom: 15px;">Order Items:</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${orderItems}
          </table>

          <p style="color: #666; font-size: 14px; margin-top: 20px; line-height: 1.6;">
            You will receive a tracking number once your order is shipped. You can track your order in your account.
          </p>

          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `;
  }

  const message = {
    from: `SPORTIZZZ <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: htmlContent || options.html,
  };

  try {
    await transporter.sendMail(message);
    console.log(`✅ Email sent to ${options.email}`);
  } catch (error) {
    console.error(`❌ Error sending email to ${options.email}:`, error.message);
    throw error;
  }
};

module.exports = sendEmail;