import {
  ApplicationFiltersDto,
  ApplicationListResponseDto,
  ApplicationStatsResponseDto,
  RejectApplicationRequestDto,
  SingleTechnicianResponseDto,
  TechnicianFiltersDto,
  TechnicianListResponseDto,
  TechnicianStatsResponseDto,
  UpdateStatusRequestDto,
} from "@/interfaces/dtos/technicianDtos";

export interface ITechnicianManagementService {
  // Technician methods
  getAllTechnicians(
    filters: TechnicianFiltersDto
  ): Promise<TechnicianListResponseDto>;
  getTechnicianById(id: string): Promise<SingleTechnicianResponseDto>;
  updateTechnicianStatus(
    id: string,
    statusData: UpdateStatusRequestDto
  ): Promise<SingleTechnicianResponseDto>;
  getTechnicianStats(): Promise<TechnicianStatsResponseDto>;
  getTechnicianByApplicationId(
    applicationId: string
  ): Promise<TechnicianListResponseDto>;

  // Application methods
  getPendingApplications(
    filters: ApplicationFiltersDto
  ): Promise<ApplicationListResponseDto>;
  approveApplication(id: string): Promise<ApplicationListResponseDto>;
  rejectApplication(
    id: string,
    rejectData: RejectApplicationRequestDto
  ): Promise<ApplicationListResponseDto>;
  getApplicationById(id: string): Promise<ApplicationListResponseDto>;
  getApplicationStats(): Promise<ApplicationStatsResponseDto>;

  // Public technciian
  getPublicTechnicians(
    filters: TechnicianFiltersDto
  ): Promise<TechnicianListResponseDto>;
  getPublicTechnicianById(id: string): Promise<SingleTechnicianResponseDto>;
  getTechnicianSlotRules(technicianId: string): Promise<any>;
  getTechnicianAvailability(
    technicianId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any>;
  getTechnicianPublicAvailability(
    technicianId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any>;
}
