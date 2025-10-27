import {
  StartApplicationRequestDto,
  SaveStepRequestDto,
  ApplicationResponseDto,
  ApplicationListResponseDto,
  FilesCollectionDto,
} from "../../dtos/technicianApplicationDtos";

export interface ITechnicianApplicationService {
  startApplication(
    data: StartApplicationRequestDto
  ): Promise<ApplicationResponseDto>;
  saveStep(
    data: SaveStepRequestDto,
    files?: FilesCollectionDto
  ): Promise<ApplicationResponseDto>;
  getApplication(applicationId: string): Promise<ApplicationResponseDto>;
  submitApplication(
    applicationId: string,
    userId: string
  ): Promise<ApplicationResponseDto>;
  getApplicationStatus(applicationId: string): Promise<ApplicationResponseDto>;
  getUserApplications(userId: string): Promise<ApplicationListResponseDto>;
  resubmitApplication(
    applicationId: string,
    userId: string
  ): Promise<ApplicationResponseDto>;
  startNewApplicationAfterRejection(
    userId: string,
    email: string
  ): Promise<ApplicationResponseDto>;
  getApplicationForEdit(
    applicationId: string,
    userId: string
  ): Promise<ApplicationResponseDto>;
}
