import { ApiResponse } from "../../../utils/responseHelper";
import {
  ApplicationResponse,
  SaveStepRequest,
  StartApplicationRequest,
} from "../../../interfaces/technician/ITechnicianApplication";

export interface ITechnicianApplicationService {
  startApplication(
    data: StartApplicationRequest
  ): Promise<ApiResponse<ApplicationResponse>>;
  saveStep(
    data: SaveStepRequest,
    files?: any
  ): Promise<ApiResponse<ApplicationResponse>>;
  getApplication(
    applicationId: string
  ): Promise<ApiResponse<ApplicationResponse>>;
  submitApplication(
    applicationId: string,
    userId: string
  ): Promise<ApiResponse<ApplicationResponse>>;
  getApplicationStatus(
    applicationId: string
  ): Promise<ApiResponse<ApplicationResponse>>;
  getUserApplications(
    userId: string
  ): Promise<ApiResponse<ApplicationResponse>>;
  resubmitApplication(
    applicationId: string,
    userId: string
  ): Promise<ApiResponse<ApplicationResponse>>;
  startNewApplicationAfterRejection(
    userId: string,
    email: string
  ): Promise<ApiResponse<ApplicationResponse>>;
}
