import { Types } from "mongoose";
import {
  DashboardOverviewDto,
  TechnicianProfileDto,
  PersonalInfoDto,
  AddressDto,
} from "../interfaces/dtos/technicianDashboardDtos";
import { ITechnician } from "../interfaces/technician/ITechnician";
import { IUser } from "../interfaces/user/IUser";
import { IAddress } from "../interfaces/user/IAddress";
import {
  DASHBOARD_DEFAULTS,
  PERSONAL_INFO_DEFAULTS,
  LANGUAGE_FORMAT_OPTIONS,
  TECHNICIAN_STATUS,
} from "../constants";

export class TechnicianDashboardMapper {
  // Map to dashboard overview DTO
  static toDashboardOverviewDto(technician: ITechnician): DashboardOverviewDto {
    return {
      averageRating: technician.averageRating || DASHBOARD_DEFAULTS.AVERAGE_RATING,
      upcomingBookings: DASHBOARD_DEFAULTS.UPCOMING_BOOKINGS,
      monthlyEarnings: DASHBOARD_DEFAULTS.MONTHLY_EARNINGS,
      totalJobs: DASHBOARD_DEFAULTS.TOTAL_JOBS,
    };
  }

  // Map to technician profile DTO
  static toTechnicianProfileDto(
    technician: ITechnician,
    user: IUser,
    userAddress?: IAddress
  ): TechnicianProfileDto {
    const personalInfo = this.mapPersonalInfo(technician, userAddress);

    return {
      _id: technician._id?.toString() || "",
      userId: technician.userId?.toString() || "",
      displayName: technician.displayName || "",
      email: user.email || "",
      phone: user.phone || technician.phone || "",
      services: technician.services || [],
      experienceYears: technician.experienceYears || DASHBOARD_DEFAULTS.EXPERIENCE_YEARS,
      workAreas: technician.workAreas || [],
      averageRating: technician.averageRating || DASHBOARD_DEFAULTS.AVERAGE_RATING,
      ratingCount: technician.ratingCount || DASHBOARD_DEFAULTS.RATING_COUNT,
      profilePictureUrl: technician.profilePictureUrl || "",
      isVerified: technician.status === TECHNICIAN_STATUS.APPROVED,
      bio: technician.bio || PERSONAL_INFO_DEFAULTS.BIO,
      status: technician.status || "",
      suspensionReason: technician.suspensionReason,
      suspendedAt: technician.suspendedAt,
      personalInfo,
      createdAt: technician.createdAt || new Date(),
      updatedAt: technician.updatedAt || new Date(),
    };
  }

  private static mapPersonalInfo(
    technician: ITechnician,
    userAddress?: IAddress
  ): PersonalInfoDto {
    const personalInfo: PersonalInfoDto = {
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
      languages: this.formatLanguages(technician.personalInfo?.languages),
      address: {
        street: PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
        city: PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
        state: PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
        pincode: PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
      },
    };

    // Handle address data
    if (userAddress) {
      personalInfo.address = this.mapAddress(userAddress);
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
  }

  private static mapAddress(address: IAddress): AddressDto {
    return {
      street: address.street || PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
      city: address.city || PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
      state: address.state || PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
      pincode: address.pincode || PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
    };
  }

  private static formatLanguages(languages: unknown): string[] {
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
        
        if (parsed && typeof parsed === "string") {
          return [parsed.trim()];
        }
      } catch (e) {
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
  }
}