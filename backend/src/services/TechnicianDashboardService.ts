import { Types } from "mongoose";
import { ITechnicianDashboardService } from "../interfaces/services/technician/ITechnicianDashboardService";
import { ITechnicianRepository } from "../interfaces/repository/technician/ITechnicianRepository";
import { IUserRepository } from "../interfaces/repository/user/IUserRepository";
import { IUserAddressRepository } from "../interfaces/repository/user/IUserAddressRepository";
import { ResponseHelper } from "../utils/responseHelper";
import { DASHBOARD_MESSAGES } from "../constants";
import { ITechnician } from "@/interfaces/technician/ITechnician";
import { IUser } from "@/interfaces/user/IUser";
import { IAddress } from "@/interfaces/user/IAddress";

// Import DTOs and Mapper
import {
  DashboardOverviewResponseDto,
  TechnicianProfileResponseDto,
  DashboardOverviewDto,
  TechnicianProfileDto,
} from "../interfaces/dtos/technicianDashboardDtos";
import { TechnicianDashboardMapper } from "../mappers/technicianDashboardMappers";

export class TechnicianDashboardService implements ITechnicianDashboardService {
  private technicianRepository: ITechnicianRepository;
  private userRepository: IUserRepository;
  private userAddressRepository: IUserAddressRepository;

  constructor(
    technicianRepository: ITechnicianRepository,
    userRepository: IUserRepository,
    userAddressRepository: IUserAddressRepository
  ) {
    this.technicianRepository = technicianRepository;
    this.userRepository = userRepository;
    this.userAddressRepository = userAddressRepository;
  }

  async getDashboardOverview(
    technicianId: string
  ): Promise<DashboardOverviewResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );

      if (!technician) {
        return ResponseHelper.notFound(DASHBOARD_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      const overviewDto =
        TechnicianDashboardMapper.toDashboardOverviewDto(technician);

      return ResponseHelper.success(
        DASHBOARD_MESSAGES.DASHBOARD_OVERVIEW_RETRIEVED,
        {
          overview: overviewDto,
        }
      );
    } catch (error: unknown) {
      console.error("Get dashboard overview error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(DASHBOARD_MESSAGES.FAILED_FETCH_OVERVIEW);
    }
  }

  async getTechnicianProfile(
    technicianId: string
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(
          DASHBOARD_MESSAGES.TECHNICIAN_PROFILE_NOT_FOUND
        );
      }

      const userAddress = await this.userAddressRepository.findByUserId(
        technician.userId as Types.ObjectId
      );

      const profileDto = TechnicianDashboardMapper.toTechnicianProfileDto(
        technician,
        user,
        userAddress as IAddress | undefined
      );

      return ResponseHelper.success(
        DASHBOARD_MESSAGES.TECHNICIAN_PROFILE_RETRIEVED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Get technician profile error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(DASHBOARD_MESSAGES.FAILED_FETCH_PROFILE);
    }
  }
}
