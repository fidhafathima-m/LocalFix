import { Types } from "mongoose";
import { TechnicianRepository } from "../repositories/technician/TechnicianRepository";
import { UserRepository } from "../repositories/user/UserRepository";
import { UserAddressRepository } from "../repositories/user/UserAddressRepository";

interface DashboardOverview {
  upcomingBookings?: number;
  monthlyEarnings?: number;
  totalJobs?: number;
  averageRating: number;
}

export class TechnicianDashboardService {
  private technicianRepository: TechnicianRepository;
  private userRepository: UserRepository;
  private userAddressRepository: UserAddressRepository;

  constructor() {
    this.technicianRepository = new TechnicianRepository();
    this.userRepository = new UserRepository();
    this.userAddressRepository = new UserAddressRepository();
  }

  async getDashboardOverview(technicianId: string): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );

      if (!technician) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      const overview: DashboardOverview = {
        averageRating: technician.averageRating || 0,
      };

      return {
        success: true,
        message: "Dashboard overview retrieved successfully",
        data: { overview },
      };
    } catch (error) {
      console.error("Get dashboard overview error:", error);
      return {
        success: false,
        message: "Failed to fetch dashboard overview",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getTechnicianProfile(technicianId: string): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return {
          success: false,
          message: "Technician profile not found",
        };
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
          return result;
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
              return result;
            }
            // If it's a JSON string of a single value
            if (parsed && typeof parsed === "string") {
              return [parsed.trim()];
            }
          } catch (e) {
            // If not JSON, split by comma or use as single language
            if (languages.includes(",")) {
              const result = languages
                .split(",")
                .map((lang: string) => lang.trim())
                .filter((lang) => lang !== "");
              return result;
            }
            return [languages.trim()];
          }
        }

        return [];
      };

      const getPersonalInfo = (technician: any, userAddress?: any) => {
        const personalInfo: any = {
          fullName: technician.personalInfo?.fullName || technician.displayName,
          gender: technician.personalInfo?.gender || "Not specified",
          phoneNumber:
            technician.personalInfo?.phoneNumber ||
            technician.phone ||
            "Not provided",
          dateOfBirth: technician.personalInfo?.dateOfBirth || "Not specified",
          languages: formatLanguages(technician.skills?.languages),
        };

        // Handle address
        if (userAddress) {
          personalInfo.address = {
            street: userAddress.street || "Not specified",
            city: userAddress.city || "Not specified",
            state: userAddress.state || "Not specified",
            pincode: userAddress.pincode || "Not specified",
          };
        } else if (technician.personalInfo?.address) {
          personalInfo.address = {
            street: technician.personalInfo.address.street || "Not specified",
            city: technician.personalInfo.address.city || "Not specified",
            state: technician.personalInfo.address.state || "Not specified",
            pincode: technician.personalInfo.address.pincode || "Not specified",
          };
        } else {
          personalInfo.address = {
            street: "Not specified",
            city: "Not specified",
            state: "Not specified",
            pincode: "Not specified",
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
        experienceYears: technician.experienceYears || 0,
        workAreas: technician.workAreas || [],
        averageRating: technician.averageRating || 0,
        ratingCount: technician.ratingCount || 0,
        profilePictureUrl: technician.profilePictureUrl || "",
        isVerified: technician.status === "approved",
        bio: technician.bio || "",
        status: technician.status,
        suspensionReason: technician.suspensionReason,
        suspendedAt: technician.suspendedAt,
        personalInfo,
        createdAt: technician.createdAt,
        updatedAt: technician.updatedAt,
      };

      return {
        success: true,
        message: "Technician profile retrieved successfully",
        data: { profile },
      };
    } catch (error) {
      console.error("Get technician profile error:", error);
      return {
        success: false,
        message: "Failed to fetch technician profile",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
