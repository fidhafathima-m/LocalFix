import { ApiResponse } from "../../../utils/responseHelper";
import {
  ApplicationResponse,
  SaveStepRequest,
  StartApplicationRequest,
} from "../../../interfaces/technician/ITechnicianApplication";

// Update the UploadedFile interface to match File type
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  stream?: NodeJS.ReadableStream; // Change from ReadableStream to NodeJS.ReadableStream
  destination?: string;
  filename?: string;
  path?: string;
  buffer?: Buffer;
  [key: string]: unknown;
}
export interface FilesCollection {
  [key: string]: UploadedFile | UploadedFile[];
}

export interface ITechnicianApplicationService {
  startApplication(
    data: StartApplicationRequest
  ): Promise<ApiResponse<ApplicationResponse>>;
  saveStep(
    data: SaveStepRequest,
    files?: FilesCollection
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
