import { Types } from "mongoose";
import { ITechnicianDashboardService } from "../interfaces/services/technician/ITechnicianDashboardService";
import { ITechnicianRepository } from "../interfaces/repository/technician/ITechnicianRepository";
import { IUserRepository } from "../interfaces/repository/user/IUserRepository";
import { IUserAddressRepository } from "../interfaces/repository/user/IUserAddressRepository";
import { ResponseHelper } from "../utils/responseHelper";
import {
  DASHBOARD_MESSAGES,
  TECHNICIAN_STATUS,
  DASHBOARD_DEFAULTS,
  PERSONAL_INFO_DEFAULTS,
  LANGUAGE_FORMAT_OPTIONS,
} from "../constants";

interface DashboardOverview {
  upcomingBookings?: number;
  monthlyEarnings?: number;
  totalJobs?: number;
  averageRating: number;
}

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

  async getDashboardOverview(technicianId: string): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );

      if (!technician) {
        return ResponseHelper.notFound(DASHBOARD_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      const overview: DashboardOverview = {
        averageRating: technician.averageRating || DASHBOARD_DEFAULTS.AVERAGE_RATING,
        upcomingBookings: DASHBOARD_DEFAULTS.UPCOMING_BOOKINGS,
        monthlyEarnings: DASHBOARD_DEFAULTS.MONTHLY_EARNINGS,
        totalJobs: DASHBOARD_DEFAULTS.TOTAL_JOBS,
      };

      return ResponseHelper.success(DASHBOARD_MESSAGES.DASHBOARD_OVERVIEW_RETRIEVED, {
        data: { overview },
      });
    } catch (error) {
      console.error("Get dashboard overview error:", error);
      return ResponseHelper.error(DASHBOARD_MESSAGES.FAILED_FETCH_OVERVIEW);
    }
  }

  async getTechnicianProfile(technicianId: string): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(DASHBOARD_MESSAGES.TECHNICIAN_PROFILE_NOT_FOUND);
      }

      const userAddress = await this.userAddressRepository.findByUserId(
        technician.userId as Types.ObjectId
      );

      const formatLanguages = (languages: any): string[] => {
        if (!languages) {
          return [];
        }

        if (Array.isArray(languages)) {
          const result = languages.filter(
            (lang) => lang && String(lang).trim() !== ""
          );
          return result.slice(0, LANGUAGE_FORMAT_OPTIONS.MAX_LANGUAGES);
        }

        if (typeof languages === "string") {
          if (languages.trim() === "") {
            return [];
          }

          try {
            const parsed = JSON.parse(languages);

            if (Array.isArray(parsed)) {
              const result = parsed.filter(
                (lang) => lang && String(lang).trim() !== ""
              );
              return result.slice(0, LANGUAGE_FORMAT_OPTIONS.MAX_LANGUAGES);
            }
            // If it's a JSON string of a single value
            if (parsed && typeof parsed === "string") {
              return [parsed.trim()];
            }
          } catch (e) {
            // If not JSON, split by comma or use as single language
            if (languages.includes(LANGUAGE_FORMAT_OPTIONS.DELIMITERS.COMMA)) {
              const result = languages
                .split(LANGUAGE_FORMAT_OPTIONS.DELIMITERS.COMMA)
                .map((lang: string) => lang.trim())
                .filter((lang) => lang !== "");
              return result.slice(0, LANGUAGE_FORMAT_OPTIONS.MAX_LANGUAGES);
            }
            return [languages.trim()];
          }
        }

        return [];
      };

      const getPersonalInfo = (technician: any, userAddress?: any) => {
        const personalInfo: any = {
          fullName: technician.personalInfo?.fullName || technician.displayName || PERSONAL_INFO_DEFAULTS.FULL_NAME,
          gender: technician.personalInfo?.gender || PERSONAL_INFO_DEFAULTS.GENDER,
          phoneNumber: technician.personalInfo?.phoneNumber || technician.phone || PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
          dateOfBirth: technician.personalInfo?.dateOfBirth || PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
          languages: formatLanguages(technician.personalInfo?.languages),
        };

        // Handle address
        if (userAddress) {
          personalInfo.address = {
            street: userAddress.street || PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
            city: userAddress.city || PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
            state: userAddress.state || PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
            pincode: userAddress.pincode || PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
          };
        } else if (technician.personalInfo?.address) {
          personalInfo.address = {
            street: technician.personalInfo.address.street || PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
            city: technician.personalInfo.address.city || PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
            state: technician.personalInfo.address.state || PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
            pincode: technician.personalInfo.address.pincode || PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
          };
        } else {
          personalInfo.address = {
            street: PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
            city: PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
            state: PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
            pincode: PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
          };
        }

        return personalInfo;
      };

      const personalInfo = getPersonalInfo(technician, userAddress);

      const profile = {
        _id: technician._id?.toString(),
        userId: technician.userId?.toString(),
        displayName: technician.displayName,
        email: user.email,
        phone: user.phone || technician.phone,
        services: technician.services || [],
        experienceYears: technician.experienceYears || DASHBOARD_DEFAULTS.EXPERIENCE_YEARS,
        workAreas: technician.workAreas || [],
        averageRating: technician.averageRating || DASHBOARD_DEFAULTS.AVERAGE_RATING,
        ratingCount: technician.ratingCount || DASHBOARD_DEFAULTS.RATING_COUNT,
        profilePictureUrl: technician.profilePictureUrl || "",
        isVerified: technician.status === TECHNICIAN_STATUS.APPROVED,
        bio: technician.bio || PERSONAL_INFO_DEFAULTS.BIO,
        status: technician.status,
        suspensionReason: technician.suspensionReason,
        suspendedAt: technician.suspendedAt,
        personalInfo,
        createdAt: technician.createdAt,
        updatedAt: technician.updatedAt,
      };

      return ResponseHelper.success(DASHBOARD_MESSAGES.TECHNICIAN_PROFILE_RETRIEVED, {
        data: { profile },
      });
    } catch (error) {
      console.error("Get technician profile error:", error);
      return ResponseHelper.error(DASHBOARD_MESSAGES.FAILED_FETCH_PROFILE);
    }
  }
}