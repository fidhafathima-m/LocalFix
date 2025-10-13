// services/emailService.ts
import nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: `"LocalFix Admin" <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      });
      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendApplicationApprovalEmail(technicianEmail: string, technicianName: string): Promise<boolean> {
    const subject = "🎉 Your Technician Application Has Been Approved!";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to LocalFix! 🛠️</h1>
            <p>Your technician application has been approved</p>
          </div>
          <div class="content">
            <h2>Congratulations, ${technicianName}! 🎉</h2>
            <p>We're excited to inform you that your technician application has been reviewed and approved by our admin team.</p>
            
            <h3>What's Next?</h3>
            <ul>
              <li>✅ Your profile is now active on LocalFix</li>
              <li>📱 Start receiving service requests from customers</li>
              <li>💼 Build your reputation with reviews and ratings</li>
              <li>💰 Earn money by providing quality services</li>
            </ul>

            <p>You can now log in to your technician dashboard and start accepting jobs immediately.</p>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/technician/dashboard" class="button">Go to Dashboard</a>
            </div>

            <p><strong>Need help?</strong><br>
            Contact our support team at ${process.env.SUPPORT_EMAIL} or call ${process.env.SUPPORT_PHONE}</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 LocalFix. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to: technicianEmail, subject, html });
  }

  async sendApplicationRejectionEmail(technicianEmail: string, technicianName: string, rejectionReason: string): Promise<boolean> {
    const subject = "📋 Update on Your Technician Application";
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .reason-box { background: #fff; border-left: 4px solid #ff6b6b; padding: 15px; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Application Status Update</h1>
            <p>Important information about your technician application</p>
          </div>
          <div class="content">
            <h2>Dear ${technicianName},</h2>
            <p>Thank you for your interest in becoming a LocalFix technician. After careful review, we regret to inform you that your application has not been approved at this time.</p>
            
            <div class="reason-box">
              <h3>Reason for Rejection:</h3>
              <p><em>"${rejectionReason || 'Application does not meet our current requirements.'}"</em></p>
            </div>

            <h3>What Can You Do?</h3>
            <ul>
              <li>📝 Review the provided reason above</li>
              <li>🔄 Update your application with additional information</li>
              <li>📞 Contact support if you need clarification</li>
              <li>⏰ Reapply after addressing the concerns</li>
            </ul>

            <p>We encourage you to review our technician requirements and consider applying again in the future.</p>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/technician/application" class="button">Review Requirements</a>
            </div>

            <p><strong>Have questions?</strong><br>
            Contact our support team at ${process.env.SUPPORT_EMAIL} for more information.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 LocalFix. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to: technicianEmail, subject, html });
  }

  async sendStatusUpdateEmail(technicianEmail: string, technicianName: string, newStatus: string, reason?: string): Promise<boolean> {
    const subject = `🔄 Account Status Update: ${newStatus.toUpperCase()}`;
    
    const statusMessages: any = {
      'suspended': `Your technician account has been temporarily suspended. ${reason ? `Reason: ${reason}` : ''}`,
      'approved': 'Your technician account suspension has been lifted and is now active again.',
      'active': 'Your technician account is now active and visible to customers.'
    };

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .status-badge { display: inline-block; padding: 5px 15px; background: #${newStatus === 'suspended' ? 'ff6b6b' : '4ecdc4'}; color: white; border-radius: 20px; font-weight: bold; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Account Status Update</h1>
            <p>Important change to your technician account</p>
          </div>
          <div class="content">
            <h2>Hello ${technicianName},</h2>
            <p>Your LocalFix technician account status has been updated:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <span class="status-badge">${newStatus.toUpperCase()}</span>
            </div>

            <p>${statusMessages[newStatus] || `Your account status has been changed to: ${newStatus}`}</p>

            ${reason ? `<div style="background: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>Additional Information:</strong>
              <p>${reason}</p>
            </div>` : ''}

            <p>If you believe this is a mistake or have any questions, please contact our support team.</p>

            <p><strong>Contact Support:</strong><br>
            Email: ${process.env.SUPPORT_EMAIL}<br>
            Phone: ${process.env.SUPPORT_PHONE}</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 LocalFix. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail({ to: technicianEmail, subject, html });
  }
}

export const emailService = new EmailService();