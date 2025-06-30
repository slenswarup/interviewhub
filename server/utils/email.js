import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter using Brevo SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

export const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: {
        name: 'InterviewHub IIITA',
        address: process.env.FROM_EMAIL || 'noreply@interviewhub.iiita.ac.in'
      },
      to: email,
      subject: 'Verify your email - InterviewHub IIITA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">InterviewHub IIITA</h1>
            <p style="color: #6B7280; margin: 5px 0;">Email Verification</p>
          </div>
          
          <div style="background: #F9FAFB; border-radius: 12px; padding: 30px; text-align: center;">
            <h2 style="color: #111827; margin: 0 0 20px 0;">Verify Your Email Address</h2>
            <p style="color: #6B7280; margin: 0 0 30px 0;">
              Enter this verification code in the application to complete your registration:
            </p>
            
            <div style="background: white; border: 2px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <div style="font-size: 36px; font-weight: bold; color: #3B82F6; letter-spacing: 8px; font-family: monospace;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #EF4444; font-size: 14px; margin: 20px 0 0 0;">
              ⏰ This code expires in 10 minutes
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center;">
            <p style="color: #6B7280; font-size: 14px; margin: 0;">
              If you didn't request this verification, please ignore this email.
            </p>
            <p style="color: #9CA3AF; font-size: 12px; margin: 10px 0 0 0;">
              InterviewHub IIITA • Indian Institute of Information Technology Allahabad
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send verification email');
  }
};