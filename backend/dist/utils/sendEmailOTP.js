"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailOTP = void 0;
const mail_1 = __importDefault(require("@sendgrid/mail"));
// Initialize SendGrid with your API key
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
const sendEmailOTP = async (email, otp) => {
    console.log(`🔧 Attempting to send OTP to: ${email}, OTP: ${otp}`);
    console.log(`🔧 SendGrid API Key present: ${!!process.env.SENDGRID_API_KEY}`);
    const msg = {
        to: email,
        from: {
            email: 'localfix.business@gmail.com',
            name: 'LocalFix',
        },
        subject: 'Your OTP Code - LocalFix',
        text: `Your OTP Code is ${otp}. It will expire in 5 minutes.`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; color: white;">
          <h1 style="margin: 0; font-size: 28px;">LocalFix</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Verification Code</p>
        </div>
        <div style="padding: 30px; text-align: center;">
          <h2 style="color: #333; margin-bottom: 20px;">Email Verification</h2>
          <p style="color: #666; font-size: 16px; margin-bottom: 30px;">Use the following OTP code to verify your email address:</p>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; display: inline-block; margin: 20px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${otp}
            </div>
          </div>
          <p style="color: #888; font-size: 14px; margin-top: 30px;">
            This code will expire in 5 minutes.<br>
            If you didn't request this code, please ignore this email.
          </p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e0e0e0;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © 2024 LocalFix. All rights reserved.<br>
            Al Safa, Kannur, 00000 IND
          </p>
        </div>
      </div>
    `,
    };
    try {
        console.log(`📧 Sending email via SendGrid to: ${email}`);
        const result = await mail_1.default.send(msg);
        console.log(`✅ SendGrid email sent successfully to: ${email}`);
        console.log(`✅ SendGrid Response:`, JSON.stringify(result, null, 2));
        return result;
    }
    catch (error) {
        console.error(`❌ SendGrid email failed for ${email}:`, error);
        // Log detailed error information
        if (error instanceof Error) {
            console.error(`❌ SendGrid Error Details:`, {
                message: error.message,
                code: error.code,
                response: error.response
                    ? {
                        body: error.response.body,
                        headers: error.response.headers,
                        statusCode: error.response.statusCode,
                    }
                    : 'No response',
            });
        }
        // Don't throw error - let signup process continue
        return null;
    }
};
exports.sendEmailOTP = sendEmailOTP;
