import {
  TechnicianListResponse,
  SingleTechnicianResponse,
  ApplicationListResponse,
  TechnicianStatsResponse,
  ApplicationStatsResponse,
  UpdateStatusRequest,
  RejectApplicationRequest,
  TechnicianFilters,
  ApplicationFilters,
} from "../../admin/ITechnicianManagement";

export interface ITechnicianManagementService {
  // Technician methods
  getAllTechnicians(filters: TechnicianFilters): Promise<TechnicianListResponse>;
  getTechnicianById(id: string): Promise<SingleTechnicianResponse>;
  updateTechnicianStatus(id: string, statusData: UpdateStatusRequest): Promise<SingleTechnicianResponse>;
  getTechnicianStats(): Promise<TechnicianStatsResponse>;
  getTechnicianByApplicationId(applicationId: string): Promise<TechnicianListResponse>;
  
  // Application methods
  getPendingApplications(filters: ApplicationFilters): Promise<ApplicationListResponse>;
  approveApplication(id: string): Promise<ApplicationListResponse>;
  rejectApplication(id: string, rejectData: RejectApplicationRequest): Promise<ApplicationListResponse>;
  getApplicationById(id: string): Promise<ApplicationListResponse>;
  getApplicationStats(): Promise<ApplicationStatsResponse>;
}