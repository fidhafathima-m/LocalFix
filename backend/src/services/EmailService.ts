import sgMail from '@sendgrid/mail';
import { IEmailOptions } from '../interfaces/IEmailOptions';
import { IEmailService } from '../interfaces/services/IEmailService';

export class EmailService implements IEmailService {
  private initialized = false;

  constructor() {
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.initialized = true;
      console.log('✅ SendGrid initialized successfully for EmailService');
    } else {
      console.log('❌ SendGrid API Key not found in EmailService');
    }
  }

  async sendEmail(options: IEmailOptions): Promise<boolean> {
    if (!this.initialized) {
      console.log('📧 Email would be sent (SendGrid not configured):', {
        to: options.to,
        subject: options.subject,
      });
      return true; // Return true to not block the flow
    }

    try {
      await sgMail.send({
        to: options.to,
        from: {
          email: 'localfix.business@gmail.com',
          name: 'LocalFix',
        },
        subject: options.subject,
        html: options.html,
      });
      console.log(`✅ Email sent successfully to: ${options.to}`);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);

      // Log detailed error information
      if (error instanceof Error) {
        console.error('SendGrid Error Details:', {
          message: error.message,
          code: (error as any).code,
          response: (error as any).response
            ? {
                statusCode: (error as any).response.statusCode,
                body: (error as any).response.body,
              }
            : 'No response',
        });
      }
      return false;
    }
  }

  async sendApplicationApprovalEmail(
    technicianEmail: string,
    technicianName: string
  ): Promise<boolean> {
    const subject = 'Your Technician Application Has Been Approved!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">Welcome to LocalFix!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Your technician application has been approved</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Congratulations, ${technicianName}!</h2>
          <p>We're excited to inform you that your technician application has been reviewed and approved by our admin team.</p>
          
          <h3>What's Next?</h3>
          <ul>
            <li>Your profile is now active on LocalFix</li>
            <li>Start receiving service requests from customers</li>
            <li>Build your reputation with reviews and ratings</li>
            <li>Earn money by providing quality services</li>
          </ul>

          <p>You can now log in to your technician dashboard and start accepting jobs immediately.</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/technician/login" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Go to Dashboard
            </a>
          </div>

          <p><strong>Need help?</strong><br>
          Contact our support team at ${process.env.SUPPORT_EMAIL} or call ${process.env.SUPPORT_PHONE}</p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
          <p>&copy; 2024 LocalFix. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: technicianEmail, subject, html });
  }

  async sendApplicationRejectionEmail(
    technicianEmail: string,
    technicianName: string,
    rejectionReason: string
  ): Promise<boolean> {
    const subject = 'Update on Your Technician Application';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">Application Status Update</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Important information about your technician application</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Dear ${technicianName},</h2>
          <p>Thank you for your interest in becoming a LocalFix technician. After careful review, we regret to inform you that your application has not been approved at this time.</p>
          
          <div style="background: #fff; border-left: 4px solid #ff6b6b; padding: 15px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0;">Reason for Rejection:</h3>
            <p style="margin: 0; font-style: italic;">"${rejectionReason || 'Application does not meet our current requirements.'}"</p>
          </div>

          <h3>What Can You Do?</h3>
          <ul>
            <li>Review the provided reason above</li>
            <li>Update your application with additional information</li>
            <li>Contact support if you need clarification</li>
            <li>Reapply after addressing the concerns</li>
          </ul>

          <p>We encourage you to review our technician requirements and consider applying again in the future.</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/technician/login" style="display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
              Review Requirements
            </a>
          </div>

          <p><strong>Have questions?</strong><br>
          Contact our support team at ${process.env.SUPPORT_EMAIL} for more information.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
          <p>&copy; 2024 LocalFix. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: technicianEmail, subject, html });
  }

  async sendStatusUpdateEmail(
    technicianEmail: string,
    technicianName: string,
    newStatus: string,
    reason?: string
  ): Promise<boolean> {
    const subject = `🔄 Account Status Update: ${newStatus.toUpperCase()}`;

    const statusMessages: any = {
      suspended: `Your technician account has been temporarily suspended. ${reason ? `Reason: ${reason}` : ''}`,
      approved:
        'Your technician account suspension has been lifted and is now active again.',
      active: 'Your technician account is now active and visible to customers.',
    };

    const statusColor = newStatus === 'suspended' ? '#ff6b6b' : '#4ecdc4';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">Account Status Update</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Important change to your technician account</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Hello ${technicianName},</h2>
          <p>Your LocalFix technician account status has been updated:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 5px 15px; background: ${statusColor}; color: white; border-radius: 20px; font-weight: bold;">
              ${newStatus.toUpperCase()}
            </span>
          </div>

          <p>${statusMessages[newStatus] || `Your account status has been changed to: ${newStatus}`}</p>

          ${
            reason
              ? `
            <div style="background: #fff; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <strong>Additional Information:</strong>
              <p>${reason}</p>
            </div>
          `
              : ''
          }

          <p>If you believe this is a mistake or have any questions, please contact our support team.</p>

          <p><strong>Contact Support:</strong><br>
          Email: ${process.env.SUPPORT_EMAIL}<br>
          Phone: ${process.env.SUPPORT_PHONE}</p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
          <p>&copy; 2024 LocalFix. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: technicianEmail, subject, html });
  }

  async sendTechnicianUnavailableNotification(
    customerEmail: string,
    customerName: string,
    technicianName: string,
    serviceDate: string,
    serviceType: string,
    orderId: string
  ): Promise<boolean> {
    const subject = `Service Update: Your ${serviceType} appointment needs rescheduling`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">Service Appointment Update</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Important information about your scheduled service</p>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Dear ${customerName},</h2>
          <p>We regret to inform you that your technician <strong>${technicianName}</strong> is unexpectedly unavailable for your scheduled service.</p>
          
          <div style="background: #fff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea;">
            <p><strong>Service Details:</strong></p>
            <p>Service Type: ${serviceType}</p>
            <p>Scheduled Date: ${serviceDate}</p>
            <p>Order ID: ${orderId}</p>
          </div>

          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Your order has been cancelled</li>
            <li>If you paid online, a full refund will be processed within 3-5 business days</li>
            <li>Our team will contact you shortly to help reschedule with another available technician</li>
            <li>You can also book a new appointment through our app/website</li>
          </ul>

          <p>We sincerely apologize for this inconvenience and appreciate your understanding.</p>

          <p><strong>Need immediate assistance?</strong><br>
          Contact our support team at ${process.env.SUPPORT_EMAIL} or call ${process.env.SUPPORT_PHONE}</p>
        </div>
        <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
          <p>&copy; 2024 LocalFix. All rights reserved.</p>
          <p>This is an automated message, please do not reply to this email.</p>
        </div>
      </div>
    `;

    return await this.sendEmail({ to: customerEmail, subject, html });
  }
}

export const emailService = new EmailService();
