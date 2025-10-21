import { Technician } from "../../models/technician/TechnicianSchema";
import {
  TechnicianApplication,
  ITechnicianApplication,
} from "../../models/technician/TechnicianApplicationSchema";
import User from "../../models/UserSchema";
import UserAddressSchema from "../../models/UserAddressSchema";
import { Types } from "mongoose";
import {
  ITechnician,
  IAdminTechnician,
} from "../../interfaces/admin/ITechnicianManagement";
import { ITechnicianManagementRepository } from "../../interfaces/repository/admin/ITechnicianManagementRepository";

// Define interfaces for filter and data objects
interface TechnicianFilter {
  status?: string;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  services?: string | { $in: string[] };
  [key: string]: unknown;
}

interface ApplicationFilter {
  status?: string | { $in: string[] };
  submittedAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  [key: string]: unknown;
}

interface PersonalInfo {
  fullName?: string;
  gender?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  languages?: string[];
}

interface SkillsInfo {
  services?: string[];
  yearsOfExperience?: number;
}

interface AvailabilityInfo {
  serviceAreas?: string[];
  workRadius?: string | number;
}

interface DocumentsInfo {
  passportPhoto?: { url?: string };
  profilePhoto?: { url?: string };
  [key: string]: unknown;
}

interface ApplicationData {
  technicianId: Types.ObjectId;
  personal?: PersonalInfo;
  skills?: SkillsInfo;
  availability?: AvailabilityInfo;
  documents?: DocumentsInfo;
}

interface PaymentDetails {
  bankAccount?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  upiId?: string;
  [key: string]: unknown;
}

interface StatusUpdateData {
  rejectionReason?: string;
  rejectedAt?: Date;
  reviewNotes?: string;
  [key: string]: unknown;
}

export class TechnicianManagementRepository
  implements ITechnicianManagementRepository
{
  async findAllTechnicians(
    filter: TechnicianFilter,
    skip: number,
    limit: number
  ): Promise<ITechnician[]> {
    const technicians = await Technician.find(filter)
      .populate("userId", "email phone fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return technicians as unknown as ITechnician[];
  }

  async countTechnicians(filter: TechnicianFilter): Promise<number> {
    return await Technician.countDocuments(filter);
  }

  async findTechnicianById(id: string): Promise<ITechnician | null> {
    const technician = await Technician.findById(id)
      .populate("userId", "email phone fullName createdAt")
      .lean();

    return technician as unknown as ITechnician | null;
  }

  async updateTechnicianStatus(
    id: string,
    status: string,
    additionalData?: StatusUpdateData
  ): Promise<ITechnician | null> {
    try {
      const updateData: { status: string } & StatusUpdateData = { status };

      if (additionalData) {
        Object.assign(updateData, additionalData);
      }

      const technician = await Technician.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );

      if (!technician) {
        return null;
      }

      return technician as unknown as ITechnician;
    } catch (error) {
      console.error("Repository: Error updating technician status:", error);
      throw error;
    }
  }

  async updateTechnicianPersonalInfo(
    technicianId: string,
    personalInfo: PersonalInfo
  ): Promise<ITechnician | null> {
    const technician = await Technician.findByIdAndUpdate(
      technicianId,
      {
        $set: {
          personalInfo,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    return technician as unknown as ITechnician | null;
  }

  async findTechnicianByUserId(userId: string): Promise<ITechnician | null> {
    try {
      const technician = await Technician.findOne({
        userId: new Types.ObjectId(userId),
      });
      return technician as unknown as ITechnician | null;
    } catch (error) {
      console.error("Error finding technician by userId:", error);
      return null;
    }
  }

  async getTechnicianStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    recent: number;
  }> {
    const total = await Technician.countDocuments();
    const active = await Technician.countDocuments({ status: "approved" });
    const pending = await Technician.countDocuments({ status: "pending" });
    const suspended = await Technician.countDocuments({ status: "suspended" });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recent = await Technician.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    return { total, active, pending, suspended, recent };
  }

  async findAllApplications(
    filter: ApplicationFilter,
    skip: number,
    limit: number
  ): Promise<ITechnicianApplication[]> {
    return await TechnicianApplication.find(filter)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countApplications(filter: ApplicationFilter): Promise<number> {
    return await TechnicianApplication.countDocuments(filter);
  }

  async findApplicationById(
    id: string
  ): Promise<ITechnicianApplication | null> {
    return await TechnicianApplication.findById(id);
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string,
    additionalData?: StatusUpdateData
  ): Promise<ITechnicianApplication | null> {
    try {
      const updateData: {
        status: string;
        updatedAt: Date;
        rejectionReason?: string;
        rejectedAt?: Date;
        reviewNotes?: string;
      } = {
        status,
        updatedAt: new Date(),
      };

      if (additionalData) {
        if (additionalData.rejectionReason) {
          updateData.rejectionReason = additionalData.rejectionReason;
        }
        if (additionalData.rejectedAt) {
          updateData.rejectedAt = additionalData.rejectedAt;
        } else if (status === "rejected") {
          updateData.rejectedAt = new Date();
        }
        if (additionalData.reviewNotes) {
          updateData.reviewNotes = additionalData.reviewNotes;
        }
      }

      const result = await TechnicianApplication.findByIdAndUpdate(
        applicationId,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return result;
    } catch (error) {
      console.error("Error in updateApplicationStatus:", error);
      throw error;
    }
  }

  async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: number;
  }> {
    const total = await TechnicianApplication.countDocuments();
    const pending = await TechnicianApplication.countDocuments({
      status: { $in: ["submitted", "under_review"] },
    });
    const approved = await TechnicianApplication.countDocuments({
      status: "approved",
    });
    const rejected = await TechnicianApplication.countDocuments({
      status: "rejected",
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const recent = await TechnicianApplication.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    return { total, pending, approved, rejected, recent };
  }

  async updateUserApplicationStatus(
    userId: Types.ObjectId,
    applicationStatus: string
  ): Promise<{ _id: Types.ObjectId; applicationStatus: string } | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { applicationStatus } },
      { new: true }
    );
  }

  async findUserAddress(userId: Types.ObjectId): Promise<{
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  } | null> {
    try {
      const address = await UserAddressSchema.findOne({
        userId,
        isDefault: true,
      })
        .select("street city state pincode landmark")
        .lean();

      return address;
    } catch (error) {
      console.error("Error finding user address:", error);
      return null;
    }
  }

  async findOrCreateTechnician(application: ApplicationData): Promise<ITechnician> {
    try {
      let technician = await Technician.findOne({
        userId: application.technicianId,
      });

      const languages = application.personal?.languages || [];
      const languagesArray = Array.isArray(languages)
        ? languages
        : typeof languages === "string"
        ? [languages]
        : [];

      if (technician) {
        technician = await Technician.findOneAndUpdate(
          { userId: application.technicianId },
          {
            $set: {
              displayName:
                application.personal?.fullName || technician.displayName,
              services: application.skills?.services || technician.services,
              experienceYears:
                application.skills?.yearsOfExperience ||
                technician.experienceYears,
              workAreas:
                application.availability?.serviceAreas || technician.workAreas,
              serviceRadiusKm: application.availability?.workRadius
                ? parseInt(application.availability.workRadius as string)
                : technician.serviceRadiusKm,
              status: "approved",
              profilePictureUrl:
                application.documents?.passportPhoto?.url ||
                application.documents?.profilePhoto?.url ||
                technician.profilePictureUrl,
              phone: application.personal?.phoneNumber || technician.phone,
              personalInfo: {
                fullName:
                  application.personal?.fullName ||
                  technician.personalInfo?.fullName,
                gender:
                  application.personal?.gender ||
                  technician.personalInfo?.gender,
                phoneNumber:
                  application.personal?.phoneNumber ||
                  technician.personalInfo?.phoneNumber,
                dateOfBirth:
                  application.personal?.dateOfBirth ||
                  technician.personalInfo?.dateOfBirth,
                address:
                  application.personal?.address ||
                  technician.personalInfo?.address,
                languages: languagesArray,
              },
            },
          },
          { new: true }
        );
      } else {
        technician = await Technician.create({
          userId: application.technicianId,
          displayName: application.personal?.fullName || "Technician",
          services: application.skills?.services || [],
          experienceYears: application.skills?.yearsOfExperience || 0,
          workAreas: application.availability?.serviceAreas || [],
          serviceRadiusKm: application.availability?.workRadius
            ? parseInt(application.availability.workRadius as string)
            : 10,
          status: "approved",
          profilePictureUrl:
            application.documents?.passportPhoto?.url ||
            application.documents?.profilePhoto?.url,
          phone: application.personal?.phoneNumber,
          personalInfo: {
            fullName: application.personal?.fullName,
            gender: application.personal?.gender,
            phoneNumber: application.personal?.phoneNumber,
            dateOfBirth: application.personal?.dateOfBirth,
            address: application.personal?.address,
            languages: languagesArray,
          },
        });
      }

      if (!technician) {
        throw new Error("Technician could not be found or created");
      }

      return technician as unknown as ITechnician;
    } catch (error) {
      console.error("Find or create technician error:", error);
      throw error;
    }
  }

  async findTechnicianByApplicationId(
    applicationId: string
  ): Promise<ITechnician | null> {
    const application = await TechnicianApplication.findById(applicationId);
    if (!application) return null;

    const technician = await Technician.findOne({
      userId: application.technicianId,
    }).populate("userId", "email phone fullName");

    return technician as unknown as ITechnician | null;
  }

  async findUserById(userId: Types.ObjectId): Promise<{
    email?: string;
    phone?: string;
    fullName?: string;
    createdAt?: Date;
    _id: Types.ObjectId;
  } | null> {
    try {
      const user = await User.findById(userId)
        .select("email phone fullName createdAt")
        .lean();

      return user;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }

  async findApplicationByTechnicianId(technicianId: string): Promise<{
    personal?: PersonalInfo;
    skills?: SkillsInfo;
    documents?: DocumentsInfo;
    status?: string;
  } | null> {
    try {
      const application = await TechnicianApplication.findOne({
        technicianId: new Types.ObjectId(technicianId),
      })
        .select("personal skills documents status")
        .lean();

      if (!application) {
        const technician = await Technician.findById(technicianId);
        if (technician) {
          const appByUserId = await TechnicianApplication.findOne({
            technicianId: technician.userId,
          })
            .select("personal skills documents status")
            .lean();

          return appByUserId;
        }
      }

      return application;
    } catch (error) {
      console.error("Error finding application by technician ID:", error);
      return null;
    }
  }

  async updateTechnicianPaymentDetails(
    technicianId: string,
    paymentDetails: PaymentDetails
  ): Promise<ITechnician | null> {
    return await Technician.findByIdAndUpdate(
      technicianId,
      {
        $set: {
          paymentDetails: paymentDetails,
        },
      },
      { new: true }
    );
  }
}