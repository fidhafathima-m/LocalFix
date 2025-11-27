import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailOTP = async (email: string, otp: string) => {
  console.log(`🔧 Attempting to send OTP to: ${email}, OTP: ${otp}`);
  console.log(`🔧 Resend API Key present: ${!!process.env.RESEND_API_KEY}`);

  try {
    console.log(`📧 Sending email via Resend to: ${email}`);

    const result = await resend.emails.send({
      from: 'LocalFix <onboarding@resend.dev>',
      to: email,
      subject: 'Your OTP Code - LocalFix',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #333; text-align: center;">Your LocalFix OTP Code</h2>
            <p style="font-size: 16px; color: #555;">Use the following OTP code to verify your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="font-size: 14px; color: #888;">This OTP will expire in 5 minutes.</p>
            <p style="font-size: 12px; color: #999; text-align: center;">If you didn't request this, please ignore this email.</p>
          </div>
        </div>
      `,
      text: `Your OTP Code is ${otp}. It will expire in 5 minutes.`,
    });

    console.log(`✅ Resend API Response:`, JSON.stringify(result, null, 2));

    if (result.error) {
      console.log(`❌ Resend Error:`, result.error);
      throw new Error(`Resend error: ${JSON.stringify(result.error)}`);
    }

    console.log(`✅ Email sent successfully to: ${email}`);
    return result;
  } catch (error) {
    console.error(`❌ Resend email failed for ${email}:`, error);
    // Log the specific error details
    if (error instanceof Error) {
      console.error(`❌ Error details:`, {
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
};
