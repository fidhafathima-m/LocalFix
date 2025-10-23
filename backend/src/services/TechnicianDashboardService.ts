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
import { ITechnician } from "@/interfaces/technician/ITechnician";
import { IUser } from "@/interfaces/user/IUser";
import { IAddress } from "@/interfaces/user/IAddress";

interface DashboardOverview {
  upcomingBookings?: number;
  monthlyEarnings?: number;
  totalJobs?: number;
  averageRating: number;
}

interface PersonalInfoData {
  fullName: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: string;
  languages: string[];
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface TechnicianProfile {
  _id: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string;
  services: string[];
  experienceYears: number;
  workAreas: string[];
  averageRating: number;
  ratingCount: number;
  profilePictureUrl: string;
  isVerified: boolean;
  bio: string;
  status: string;
  suspensionReason?: string;
  suspendedAt?: Date;
  personalInfo: PersonalInfoData;
  createdAt: Date;
  updatedAt: Date;
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
        averageRating:
          technician.averageRating || DASHBOARD_DEFAULTS.AVERAGE_RATING,
        upcomingBookings: DASHBOARD_DEFAULTS.UPCOMING_BOOKINGS,
        monthlyEarnings: DASHBOARD_DEFAULTS.MONTHLY_EARNINGS,
        totalJobs: DASHBOARD_DEFAULTS.TOTAL_JOBS,
      };

      return ResponseHelper.success(
        DASHBOARD_MESSAGES.DASHBOARD_OVERVIEW_RETRIEVED,
        {
          data: { overview },
        }
      );
    } catch (error: unknown) {
      console.error("Get dashboard overview error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
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
        return ResponseHelper.notFound(
          DASHBOARD_MESSAGES.TECHNICIAN_PROFILE_NOT_FOUND
        );
      }

      const userAddress = await this.userAddressRepository.findByUserId(
        technician.userId as Types.ObjectId
      );

      const formatLanguages = (languages: unknown): string[] => {
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
                (lang: unknown) => lang && String(lang).trim() !== ""
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

      const getPersonalInfo = (
        technician: ITechnician,
        userAddress?: IAddress
      ): PersonalInfoData => {
        const personalInfo: PersonalInfoData = {
          fullName:
            technician.personalInfo?.fullName ||
            technician.displayName ||
            PERSONAL_INFO_DEFAULTS.FULL_NAME,
          gender:
            technician.personalInfo?.gender || PERSONAL_INFO_DEFAULTS.GENDER,
          phoneNumber:
            technician.personalInfo?.phoneNumber ||
            technician.phone ||
            PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
          dateOfBirth:
            technician.personalInfo?.dateOfBirth ||
            PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
          languages: formatLanguages(technician.personalInfo?.languages),
          address: {
            street: PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
            city: PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
            state: PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
            pincode: PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
          },
        };

        // Handle address - convert null to undefined
        const addressData = userAddress || undefined;

        if (addressData) {
          personalInfo.address = {
            street: addressData.street || PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
            city: addressData.city || PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
            state: addressData.state || PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
            pincode:
              addressData.pincode || PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
          };
        } else if (technician.personalInfo?.address) {
          const address = technician.personalInfo.address;
          personalInfo.address = {
            street: address.street || PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
            city: address.city || PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
            state: address.state || PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
            pincode: address.pincode || PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
          };
        }

        return personalInfo;
      };

      // Convert null to undefined when calling the function
      const personalInfo = getPersonalInfo(
        technician,
        userAddress as IAddress | undefined
      );

      const profile: TechnicianProfile = {
        _id: technician._id?.toString() || "",
        userId: technician.userId?.toString() || "",
        displayName: technician.displayName,
        email: user.email || "",
        phone: user.phone || technician.phone || "",
        services: technician.services || [],
        experienceYears:
          technician.experienceYears || DASHBOARD_DEFAULTS.EXPERIENCE_YEARS,
        workAreas: technician.workAreas || [],
        averageRating:
          technician.averageRating || DASHBOARD_DEFAULTS.AVERAGE_RATING,
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

      return ResponseHelper.success(
        DASHBOARD_MESSAGES.TECHNICIAN_PROFILE_RETRIEVED,
        {
          data: { profile },
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
