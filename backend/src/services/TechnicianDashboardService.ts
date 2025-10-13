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

    const getPersonalInfo = (technician: any, userAddress?: any) => {
      const hasRealTechnicianData =
        technician.personalInfo &&
        (technician.personalInfo.gender !== "Not specified" ||
          technician.personalInfo.phoneNumber !== "Not provided" ||
          technician.personalInfo.dateOfBirth !== "Not specified");

      let personalInfo: any;

      if (hasRealTechnicianData) {
        personalInfo = {
          fullName:
            technician.personalInfo?.fullName || technician.displayName,
          gender: technician.personalInfo?.gender || "Not specified",
          phoneNumber:
            technician.personalInfo?.phoneNumber ||
            technician.phone ||
            "Not provided",
          dateOfBirth:
            technician.personalInfo?.dateOfBirth || "Not specified",
          languages: technician.personalInfo?.languages || [],
        };
      } else {
        personalInfo = {
          fullName: technician.displayName,
          gender: "Not specified",
          phoneNumber: technician.phone || "Not provided",
          dateOfBirth: "Not specified",
          languages: [],
        };
      }

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
    
    // Include suspension information in the profile
    const profile = {
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
      // Add suspension data
      suspensionReason: technician.suspensionReason,
      suspendedAt: technician.suspendedAt,
      personalInfo,
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
