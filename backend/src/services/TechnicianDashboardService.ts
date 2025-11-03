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
import { LoggerService } from "../services/LoggerService";

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
  private logger: LoggerService;

  constructor(
    technicianRepository: ITechnicianRepository,
    userRepository: IUserRepository,
    userAddressRepository: IUserAddressRepository
  ) {
    this.technicianRepository = technicianRepository;
    this.userRepository = userRepository;
    this.userAddressRepository = userAddressRepository;
    this.logger = new LoggerService();
  }

  async getDashboardOverview(
    technicianId: string
  ): Promise<DashboardOverviewResponseDto> {
    const context = {
      operation: "getDashboardOverview",
      data: { technicianId },
    };

    try {
      this.logger.info("Fetching dashboard overview for technician", context);

      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );

      if (!technician) {
        this.logger.warn(
          "Technician not found for dashboard overview",
          context
        );
        return ResponseHelper.notFound(DASHBOARD_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      this.logger.debug("Technician found, generating overview data", {
        ...context,
        technicianRecordId: technician._id?.toString(),
        displayName: technician.displayName,
        status: technician.status,
      });

      const overviewDto =
        TechnicianDashboardMapper.toDashboardOverviewDto(technician);

      this.logger.info("Dashboard overview generated successfully", {
        ...context,
        // overviewData: {
        //   totalBookings: overviewDto.totalBookings,
        //   completedBookings: overviewDto.completedBookings,
        //   pendingBookings: overviewDto.pendingBookings,
        //   totalEarnings: overviewDto.totalEarnings,
        //   averageRating: overviewDto.averageRating,
        //   ratingCount: overviewDto.ratingCount
        // }
      });

      return ResponseHelper.success(
        DASHBOARD_MESSAGES.DASHBOARD_OVERVIEW_RETRIEVED,
        {
          overview: overviewDto,
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Get dashboard overview operation failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(DASHBOARD_MESSAGES.FAILED_FETCH_OVERVIEW);
    }
  }

  async getTechnicianProfile(
    technicianId: string
  ): Promise<TechnicianProfileResponseDto> {
    const context = {
      operation: "getTechnicianProfile",
      data: { technicianId },
    };

    try {
      this.logger.info("Fetching technician profile", context);

      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );

      if (!technician) {
        this.logger.warn("Technician record not found", context);
        return ResponseHelper.notFound(
          DASHBOARD_MESSAGES.TECHNICIAN_PROFILE_NOT_FOUND
        );
      }

      this.logger.debug("Technician found, fetching user data", {
        ...context,
        technicianRecordId: technician._id?.toString(),
        userId: technician.userId?.toString(),
      });

      const user = await this.userRepository.findById(technicianId);

      if (!user) {
        this.logger.warn("User record not found for technician", {
          ...context,
          technicianId,
        });
        return ResponseHelper.notFound(
          DASHBOARD_MESSAGES.TECHNICIAN_PROFILE_NOT_FOUND
        );
      }

      this.logger.debug("User found, fetching address data", {
        ...context,
        userId: user._id?.toString(),
        userEmail: user.email,
      });

      let userAddress = null;
      if (technician.userId) {
        userAddress = await this.userAddressRepository.findByUserId(
          technician.userId as Types.ObjectId
        );

        if (userAddress) {
          this.logger.debug("User address found", {
            ...context,
            addressId: userAddress._id?.toString(),
            hasLocation: !!userAddress.location,
          });
        } else {
          this.logger.debug("No user address found", context);
        }
      } else {
        this.logger.warn("No userId found in technician record", {
          ...context,
          technicianRecordId: technician._id?.toString(),
        });
      }

      this.logger.debug("Generating profile DTO from collected data", {
        ...context,
        hasTechnicianData: !!technician,
        hasUserData: !!user,
        hasAddressData: !!userAddress,
      });

      const profileDto = TechnicianDashboardMapper.toTechnicianProfileDto(
        technician,
        user,
        userAddress as IAddress | undefined
      );

      this.logger.info("Technician profile generated successfully", {
        ...context,
        profileData: {
          displayName: profileDto.displayName,
          email: profileDto.email,
          experienceYears: profileDto.experienceYears,
          servicesCount: profileDto.services?.length || 0,
          workAreasCount: profileDto.workAreas?.length || 0,
        },
      });

      return ResponseHelper.success(
        DASHBOARD_MESSAGES.TECHNICIAN_PROFILE_RETRIEVED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Get technician profile operation failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(DASHBOARD_MESSAGES.FAILED_FETCH_PROFILE);
    }
  }
}
