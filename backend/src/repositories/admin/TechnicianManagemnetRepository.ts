import { Technician } from "../../models/technician/TechnicianSchema";
import {
  TechnicianApplication,
  ITechnicianApplication as ModelITechnicianApplication,
} from "../../models/technician/TechnicianApplicationSchema";
import User from "../../models/UserSchema";
import UserAddressSchema from "../../models/UserAddressSchema";
import { Types } from "mongoose";
import {
  ITechnician,
  IAdminTechnician,
  ITechnicianApplication as AdminITechnicianApplication,
} from "../../interfaces/admin/ITechnicianManagement";
import { ITechnicianManagementRepository } from "../../interfaces/repository/admin/ITechnicianManagementRepository";
import {
  PersonalInfo,
  SkillsInfo,
  AvailabilityInfo,
  DocumentsInfo,
  BankInfo,
  IdentityInfo
} from "../../interfaces/technician/ITechnician"; 
import { IUser } from "@/interfaces/admin/IUserManagements";
import { IUserAddress } from "@/models/UserAddressSchema";

// Define interfaces for filter and data objects
interface TechnicianFilter {
  status?: string | { $in: string[] };
  services?: string | { $in: string[] };
  averageRating?: { $gte?: number; $lte?: number };
  workAreas?: { $in: RegExp[] };
  $or?: Array<{ [key: string]: RegExp }>;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  [key: string]: unknown;
}

interface ApplicationFilter {
  status?: string | { $in: string[] };
  "skills.services"?: string;
  $or?: Array<{ [key: string]: RegExp }>;
  submittedAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  [key: string]: unknown;
}

interface StatusUpdateData {
  rejectionReason?: string;
  rejectedAt?: Date;
  reviewNotes?: string;
  [key: string]: unknown;
}

interface PaymentDetails {
  bankAccount?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    bankName?: string;
  };
  upiId?: string;
  withdrawalPreference?: "auto" | "manual";
  [key: string]: unknown;
}

// Helper function to convert model application to admin interface
const convertToAdminApplication = (app: ModelITechnicianApplication): AdminITechnicianApplication => {
  const baseApplication = {
    _id: app._id as Types.ObjectId,
    technicianId: app.technicianId as Types.ObjectId,
    email: app.email || '',
    status: app.status || 'draft',
    stepsCompleted: app.stepsCompleted || [],
    personal: app.personal ? {
      fullName: app.personal.fullName || '',
      phoneNumber: app.personal.phoneNumber || '',
      email: app.personal.email || '',
      gender: app.personal.gender || '',
      dateOfBirth: app.personal.dateOfBirth || '',
      languages: Array.isArray(app.personal.languages) ? app.personal.languages : [],
      address: app.personal.address ? {
        street: app.personal.address.street || '',
        city: app.personal.address.city || '',
        state: app.personal.address.state || '',
        pincode: app.personal.address.pincode || ''
      } : undefined
    } : {
      fullName: '',
      phoneNumber: '',
      email: '',
      gender: '',
      dateOfBirth: '',
      languages: []
    },
    identity: app.identity || {
      governmentIdType: '',
      governmentIdNumber: '',
      idDocument: '',
      verified: false,
      verificationStatus: 'pending' as const
    },
    skills: app.skills || {
      services: [],
      yearsOfExperience: '',
      languages: [],
      bio: '',
      serviceAreas: [],
      workRadius: ''
    },
    availability: app.availability || {
      serviceAreas: [],
      workRadius: '',
      availability: {
        monday: { available: false, startTime: '', endTime: '' },
        tuesday: { available: false, startTime: '', endTime: '' },
        wednesday: { available: false, startTime: '', endTime: '' },
        thursday: { available: false, startTime: '', endTime: '' },
        friday: { available: false, startTime: '', endTime: '' },
        saturday: { available: false, startTime: '', endTime: '' },
        sunday: { available: false, startTime: '', endTime: '' }
      }
    },
    bank: app.bank || {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: '',
      bankName: '',
      withdrawalPreference: ''
    },
    documents: app.documents || {},
    agreement: app.agreement || false,
    submittedAt: app.submittedAt,
    reviewNotes: app.reviewNotes,
    rejectionReason: app.rejectionReason,
    rejectedAt: app.rejectedAt,
    resubmittedCount: app.resubmittedCount || 0,
    lastSubmittedAt: app.lastSubmittedAt,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    user: undefined
  };

  // Add toObject method for compatibility
  return {
    ...baseApplication,
    toObject: () => baseApplication
  } as AdminITechnicianApplication;
};

// Helper function to convert AdminITechnicianApplication to ModelITechnicianApplication for repository operations
const convertToModelApplication = (app: AdminITechnicianApplication): any => {
  return {
    _id: app._id,
    technicianId: app.technicianId,
    email: app.email,
    status: app.status,
    stepsCompleted: app.stepsCompleted,
    personal: app.personal,
    identity: app.identity,
    skills: app.skills,
    availability: app.availability,
    bank: app.bank,
    documents: app.documents,
    agreement: app.agreement,
    submittedAt: app.submittedAt,
    reviewNotes: app.reviewNotes,
    rejectionReason: app.rejectionReason,
    rejectedAt: app.rejectedAt,
    resubmittedCount: app.resubmittedCount,
    lastSubmittedAt: app.lastSubmittedAt,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt
  };
};

export class TechnicianManagementRepository implements ITechnicianManagementRepository {
  async findAllTechnicians(
    filter: Record<string, unknown>,
    skip: number,
    limit: number
  ): Promise<ITechnician[]> {
    const technicians = await Technician.find(filter)
      .populate("userId", "email phone fullName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return technicians as ITechnician[];
  }

  async countTechnicians(filter: Record<string, unknown>): Promise<number> {
    return await Technician.countDocuments(filter);
  }

  async findTechnicianById(id: string): Promise<ITechnician | null> {
    const technician = await Technician.findById(id)
      .populate("userId", "email phone fullName createdAt")
      .lean();

    return technician as ITechnician | null;
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

      return technician as ITechnician;
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

    return technician as ITechnician | null;
  }

  async findTechnicianByUserId(userId: string): Promise<ITechnician | null> {
    try {
      const technician = await Technician.findOne({
        userId: new Types.ObjectId(userId),
      });
      return technician as ITechnician | null;
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
    filter: Record<string, unknown>,
    skip: number,
    limit: number
  ): Promise<AdminITechnicianApplication[]> {
    const applications = await TechnicianApplication.find(filter)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return applications.map(app => convertToAdminApplication(app));
  }

  async countApplications(filter: Record<string, unknown>): Promise<number> {
    return await TechnicianApplication.countDocuments(filter);
  }

  async findApplicationById(id: string): Promise<AdminITechnicianApplication | null> {
    const application = await TechnicianApplication.findById(id);
    if (!application) return null;
    return convertToAdminApplication(application);
  }

  async updateApplicationStatus(
    applicationId: string,
    status: string,
    additionalData?: StatusUpdateData
  ): Promise<AdminITechnicianApplication | null> {
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

      if (!result) return null;
      return convertToAdminApplication(result);
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
  ): Promise<IUser | null> {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { applicationStatus } },
      { new: true }
    );

    return user as IUser | null;
  }

  async findUserAddress(userId: Types.ObjectId): Promise<IUserAddress | null> {
    try {
      const address = await UserAddressSchema.findOne({
        userId,
        isDefault: true,
      })
        .select("street city state pincode landmark")
        .lean();

      return address as IUserAddress | null;
    } catch (error) {
      console.error("Error finding user address:", error);
      return null;
    }
  }

  async findOrCreateTechnician(application: AdminITechnicianApplication): Promise<ITechnician> {
    try {
      // Convert AdminITechnicianApplication to a format compatible with the model
      const modelApplication = convertToModelApplication(application);
      
      let technician = await Technician.findOne({
        userId: application.technicianId,
      });

      const languages = application.personal?.languages || [];
      const languagesArray = Array.isArray(languages)
        ? languages
        : typeof languages === "string"
        ? [languages]
        : [];

      // Prepare personal info
      const personalInfo: PersonalInfo = {
        fullName: application.personal?.fullName || technician?.personalInfo?.fullName || 'Technician',
        email: application.personal?.email || technician?.personalInfo?.email,
        phoneNumber: application.personal?.phoneNumber || technician?.personalInfo?.phoneNumber,
        dateOfBirth: application.personal?.dateOfBirth || technician?.personalInfo?.dateOfBirth,
        gender: application.personal?.gender || technician?.personalInfo?.gender,
        languages: languagesArray,
        bio: application.skills?.bio || technician?.personalInfo?.bio,
        address: application.personal?.address || technician?.personalInfo?.address
      };

      if (technician) {
        // Update existing technician
        technician = await Technician.findOneAndUpdate(
          { userId: application.technicianId },
          {
            $set: {
              displayName: personalInfo.fullName,
              services: application.skills?.services || technician.services,
              experienceYears: application.skills?.yearsOfExperience 
                ? parseInt(String(application.skills.yearsOfExperience)) 
                : technician.experienceYears,
              workAreas: application.availability?.serviceAreas || technician.workAreas,
              serviceRadiusKm: application.availability?.workRadius
                ? parseInt(application.availability.workRadius as string)
                : technician.serviceRadiusKm,
              status: "approved",
              profilePictureUrl: application.documents?.passportPhoto?.url ||
                application.documents?.profilePhoto?.url ||
                technician.profilePictureUrl,
              phone: personalInfo.phoneNumber || technician.phone,
              personalInfo: personalInfo,
              updatedAt: new Date(),
            },
          },
          { new: true }
        );
      } else {
        // Create new technician
        technician = await Technician.create({
          userId: application.technicianId,
          displayName: personalInfo.fullName,
          services: application.skills?.services || [],
          experienceYears: application.skills?.yearsOfExperience 
            ? parseInt(String(application.skills.yearsOfExperience)) 
            : 0,
          workAreas: application.availability?.serviceAreas || [],
          serviceRadiusKm: application.availability?.workRadius
            ? parseInt(application.availability.workRadius as string)
            : 10,
          status: "approved",
          profilePictureUrl: application.documents?.passportPhoto?.url ||
            application.documents?.profilePhoto?.url,
          phone: personalInfo.phoneNumber,
          personalInfo: personalInfo,
          averageRating: 0,
          ratingCount: 0,
          totalJobs: 0,
          completedJobs: 0,
          ongoingJobs: 0,
          totalEarnings: 0,
          resubmittedCount: 0
        });
      }

      if (!technician) {
        throw new Error("Technician could not be found or created");
      }

      return technician as ITechnician;
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

    return technician as ITechnician | null;
  }

  async findUserById(userId: Types.ObjectId): Promise<IUser | null> {
    try {
      const user = await User.findById(userId)
        .select("email phone fullName createdAt")
        .lean();

      return user as IUser | null;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }

  async findApplicationByTechnicianId(technicianId: string): Promise<AdminITechnicianApplication | null> {
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

          return appByUserId ? convertToAdminApplication(appByUserId as ModelITechnicianApplication) : null;
        }
      }

      return application ? convertToAdminApplication(application as ModelITechnicianApplication) : null;
    } catch (error) {
      console.error("Error finding application by technician ID:", error);
      return null;
    }
  }

  async updateTechnicianPaymentDetails(
    technicianId: string,
    paymentDetails: Record<string, unknown>
  ): Promise<ITechnician> {
    const formattedPaymentDetails = {
      bankAccount: {
        holderName: (paymentDetails.bankAccount as any)?.accountHolderName || '',
        accountNumber: (paymentDetails.bankAccount as any)?.accountNumber || '',
        ifscCode: (paymentDetails.bankAccount as any)?.ifscCode || '',
        bankName: (paymentDetails.bankAccount as any)?.bankName || ''
      },
      upiId: (paymentDetails.upiId as string) || '',
      withdrawalPreference: (paymentDetails.withdrawalPreference as "auto" | "manual") || "auto" as const
    };

    const technician = await Technician.findByIdAndUpdate(
      technicianId,
      {
        $set: {
          paymentDetails: formattedPaymentDetails,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!technician) {
      throw new Error("Technician not found");
    }

    return technician as ITechnician;
  }
}