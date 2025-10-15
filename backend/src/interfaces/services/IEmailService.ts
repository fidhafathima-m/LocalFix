import { IEmailOptions } from "../IEmailOptions";

export interface IEmailService {
  sendEmail(options: IEmailOptions): Promise<boolean>;
  sendApplicationApprovalEmail(
    technicianEmail: string,
    technicianName: string
  ): Promise<boolean>;
  sendApplicationRejectionEmail(
    technicianEmail: string,
    technicianName: string,
    rejectionReason: string
  ): Promise<boolean>;
  sendStatusUpdateEmail(
    technicianEmail: string,
    technicianName: string,
    newStatus: string,
    reason?: string
  ): Promise<boolean>;
}
