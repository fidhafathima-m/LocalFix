import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailOTP = async (email: string, otp: string) => {
  try {
    await resend.emails.send({
      from: 'LocalFix <onboarding@resend.dev>',
      to: email,
      subject: 'Your OTP Code',
      html: `<p>Your OTP Code is <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
    });
  } catch (error) {
    console.error('Resend email failed:', error);
    throw error;
  }
};
