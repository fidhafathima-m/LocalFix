import {
  ApplicationResponse,
  SaveStepRequest,
  StartApplicationRequest,
} from "../../../interfaces/technician/ITechnicianApplication";

export interface ITechnicianApplicationService {
  startApplication(data: StartApplicationRequest): Promise<ApplicationResponse>;
  saveStep(data: SaveStepRequest, files?: any): Promise<ApplicationResponse>;
  getApplication(applicationId: string): Promise<ApplicationResponse>;
  submitApplication(
    applicationId: string,
    userId: string
  ): Promise<ApplicationResponse>;
  getApplicationStatus(applicationId: string): Promise<ApplicationResponse>;
  getUserApplications(userId: string): Promise<ApplicationResponse>;
  resubmitApplication(
    applicationId: string,
    userId: string
  ): Promise<ApplicationResponse>;
  startNewApplicationAfterRejection(
    userId: string,
    email: string
  ): Promise<ApplicationResponse>;
}
