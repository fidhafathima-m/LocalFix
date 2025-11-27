import nodemailer from 'nodemailer';

export const sendEmailOTP = async (email: string, otp: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000,
    socketTimeout: 10000,
  });

  const mailOptions = {
    from: `"LocalFix" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP Code is ${otp}. It will expire in 5 minutes`,
  };

  try {
    const sendPromise = transporter.sendMail(mailOptions);

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout')), 15000);
    });

    await Promise.race([sendPromise, timeoutPromise]);
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error; // Re-throw to be handled by the caller
  }
};
