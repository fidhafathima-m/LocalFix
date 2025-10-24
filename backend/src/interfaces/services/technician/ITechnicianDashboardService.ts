import {
  DashboardOverviewResponseDto,
  TechnicianProfileResponseDto,
} from "../../dtos/technicianDashboardDtos";

export interface ITechnicianDashboardService {
  getDashboardOverview(technicianId: string): Promise<DashboardOverviewResponseDto>;
  getTechnicianProfile(technicianId: string): Promise<TechnicianProfileResponseDto>;
}