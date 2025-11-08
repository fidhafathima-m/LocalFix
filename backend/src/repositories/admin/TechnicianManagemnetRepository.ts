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
  IdentityInfo,
  WeeklyPattern,
} from "../../interfaces/technician/ITechnician";
import { IUser } from "@/interfaces/admin/IUserManagements";
import { IUserAddress } from "@/models/UserAddressSchema";
import SlotRuleSchema from "../../models/technician/SlotRuleSchema";
import TechnicianAvailabilitySchema from "../../models/technician/TechnicianAvailabilitySchema";

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
  search?: string;
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
const convertToAdminApplication = (
  app: ModelITechnicianApplication
): AdminITechnicianApplication => {
  const skillsData = app.skills || {};

  // Process availability data to use new structure
  const availabilityData = app.availability as AvailabilityInfo | any || {};
  let weeklyPattern: WeeklyPattern = {};

  // Convert old structure to new structure if needed
  if (availabilityData && typeof availabilityData === 'object') {
    // Check for nested availability structure (old format)
    if ('availability' in availabilityData && availabilityData.availability && typeof availabilityData.availability === 'object' && 'weeklyPattern' in availabilityData.availability) {
      weeklyPattern = availabilityData.availability.weeklyPattern as WeeklyPattern;
    } 
    // Check for direct weeklyPattern (new format)
    else if ('weeklyPattern' in availabilityData) {
      weeklyPattern = availabilityData.weeklyPattern as WeeklyPattern;
    }
    // Check for old weeklyAvailability structure and convert
    else if ('weeklyAvailability' in availabilityData) {
      const oldWeeklyAvailability = availabilityData.weeklyAvailability as any;
      weeklyPattern = {};
      
      // Convert from old structure { enabled, startTime, endTime } to new structure { available, startTime, endTime }
      Object.keys(oldWeeklyAvailability).forEach(day => {
        const dayData = oldWeeklyAvailability[day];
        if (dayData && typeof dayData === 'object') {
          weeklyPattern[day as keyof WeeklyPattern] = {
            available: dayData.enabled || false,
            startTime: dayData.startTime || "09:00",
            endTime: dayData.endTime || "18:00"
          };
        }
      });
    }
  }

  // If no weeklyPattern was found, create default
  if (Object.keys(weeklyPattern).length === 0) {
    weeklyPattern = {
      monday: { available: false, startTime: "09:00", endTime: "18:00" },
      tuesday: { available: false, startTime: "09:00", endTime: "18:00" },
      wednesday: { available: false, startTime: "09:00", endTime: "18:00" },
      thursday: { available: false, startTime: "09:00", endTime: "18:00" },
      friday: { available: false, startTime: "09:00", endTime: "18:00" },
      saturday: { available: false, startTime: "09:00", endTime: "18:00" },
      sunday: { available: false, startTime: "09:00", endTime: "18:00" },
    };
  }

  const baseApplication = {
    _id: app._id as Types.ObjectId,
    technicianId: app.technicianId as Types.ObjectId,
    email: app.email || "",
    status: app.status || "draft",
    stepsCompleted: app.stepsCompleted || [],
    personal: app.personal
      ? {
          fullName: app.personal.fullName || "",
          phoneNumber: app.personal.phoneNumber || "",
          email: app.personal.email || "",
          gender: app.personal.gender || "",
          dateOfBirth: app.personal.dateOfBirth || "",
          address: app.personal.address
            ? {
                street: app.personal.address.street || "",
                city: app.personal.address.city || "",
                state: app.personal.address.state || "",
                pincode: app.personal.address.pincode || "",
              }
            : undefined,
        }
      : {
          fullName: "",
          phoneNumber: "",
          email: "",
          gender: "",
          dateOfBirth: "",
        },
    identity: app.identity || {
      governmentIdType: "",
      governmentIdNumber: "",
      idDocument: "",
      verified: false,
      verificationStatus: "pending" as const,
    },
    skills: {
      services: (skillsData as any).services || [],
      yearsOfExperience: (skillsData as any).yearsOfExperience || "",
      languages: getLanguagesFromSkills(skillsData),
      bio: (skillsData as any).bio || "",
      serviceAreas: (skillsData as any).serviceAreas || [],
      workRadius: (skillsData as any).workRadius || "",
    },
    availability: {
      serviceAreas: availabilityData.serviceAreas || [],
      workRadius: availabilityData.workRadius || "",
      weeklyPattern: weeklyPattern, // Use the processed weeklyPattern
    },
    bank: app.bank || {
      accountHolderName: "",
      accountNumber: "",
      ifscCode: "",
      upiId: "",
      bankName: "",
      withdrawalPreference: "",
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
    user: undefined,
  };

  const result = {
    ...baseApplication,
    toObject: () => baseApplication,
  };

  return result as unknown as AdminITechnicianApplication;
};

// Helper function to safely extract languages from skills
const getLanguagesFromSkills = (skillsData: any): string[] => {
  if (!skillsData) return [];

  const languages = (skillsData as any).languages;

  if (!languages) return [];

  if (Array.isArray(languages)) {
    return languages;
  }

  if (typeof languages === "string") {
    try {
      // Try to parse as JSON array
      const parsed = JSON.parse(languages);
      return Array.isArray(parsed) ? parsed : [languages];
    } catch {
      // If not JSON, try comma-separated or return as single item array
      if (languages.includes(",")) {
        return languages
          .split(",")
          .map((lang: string) => lang.trim())
          .filter(Boolean);
      }
      return [languages];
    }
  }

  return [];
};

// Helper function to convert AdminITechnicianApplication to ModelITechnicianApplication for repository operations
// Helper function to convert AdminITechnicianApplication to ModelITechnicianApplication for repository operations
const convertToModelApplication = (app: AdminITechnicianApplication): any => {
  // Process availability data for backward compatibility
  let availabilityData = app.availability;
  
  // Ensure availability has the correct structure
  if (availabilityData && !availabilityData.weeklyPattern) {
    availabilityData = {
      ...availabilityData,
      weeklyPattern: {
        monday: { available: false, startTime: "09:00", endTime: "18:00" },
        tuesday: { available: false, startTime: "09:00", endTime: "18:00" },
        wednesday: { available: false, startTime: "09:00", endTime: "18:00" },
        thursday: { available: false, startTime: "09:00", endTime: "18:00" },
        friday: { available: false, startTime: "09:00", endTime: "18:00" },
        saturday: { available: false, startTime: "09:00", endTime: "18:00" },
        sunday: { available: false, startTime: "09:00", endTime: "18:00" },
      },
    };
  }

  return {
    _id: app._id,
    technicianId: app.technicianId,
    email: app.email,
    status: app.status,
    stepsCompleted: app.stepsCompleted,
    personal: app.personal,
    identity: app.identity,
    skills: app.skills,
    availability: availabilityData, // Use processed availability data
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
    updatedAt: app.updatedAt,
  };
};

export class TechnicianManagementRepository
  implements ITechnicianManagementRepository
{
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

    return applications.map((app) => convertToAdminApplication(app));
  }

  async countApplications(filter: Record<string, unknown>): Promise<number> {
    return await TechnicianApplication.countDocuments(filter);
  }

  async findApplicationById(
    id: string
  ): Promise<AdminITechnicianApplication | null> {
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

  async findOrCreateTechnician(
  application: AdminITechnicianApplication,
  availabilityData?: any
): Promise<ITechnician> {
  try {
    // Convert AdminITechnicianApplication to a format compatible with the model
    const modelApplication = convertToModelApplication(application);

    let technician = await Technician.findOne({
      userId: application.technicianId,
    });

    const languages = application.skills?.languages || [];
    const languagesArray = Array.isArray(languages)
      ? languages
      : typeof languages === "string"
      ? [languages]
      : [];

    // Prepare personal info
    const personalInfo: PersonalInfo = {
      fullName:
        application.personal?.fullName ||
        technician?.personalInfo?.fullName ||
        "Technician",
      email: application.personal?.email || technician?.personalInfo?.email,
      phoneNumber:
        application.personal?.phoneNumber ||
        technician?.personalInfo?.phoneNumber,
      dateOfBirth:
        application.personal?.dateOfBirth ||
        technician?.personalInfo?.dateOfBirth,
      gender:
        application.personal?.gender || technician?.personalInfo?.gender,
      languages: languagesArray,
      bio: application.skills?.bio || technician?.personalInfo?.bio,
      address:
        application.personal?.address || technician?.personalInfo?.address,
    };

    // Extract service areas and work radius from application.availability (not from availabilityInfo)
    const serviceAreas = application.availability?.serviceAreas || [];
    const workRadius = application.availability?.workRadius 
      ? parseInt(application.availability.workRadius as string)
      : 10;

    // Process availability data for the new structure
    const availabilityInfo = availabilityData || {
      isAvailable: true,
      weeklyPattern: application.availability?.weeklyPattern || {
        monday: { available: false, startTime: "09:00", endTime: "18:00" },
        tuesday: { available: false, startTime: "09:00", endTime: "18:00" },
        wednesday: { available: false, startTime: "09:00", endTime: "18:00" },
        thursday: { available: false, startTime: "09:00", endTime: "18:00" },
        friday: { available: false, startTime: "09:00", endTime: "18:00" },
        saturday: { available: false, startTime: "09:00", endTime: "18:00" },
        sunday: { available: false, startTime: "09:00", endTime: "18:00" },
      },
      availableWeeks: [1, 2, 3, 4],
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
            workAreas: serviceAreas, // Use extracted serviceAreas
            serviceRadiusKm: workRadius, // Use extracted workRadius
            status: "approved",
            profilePictureUrl:
              application.documents?.passportPhoto?.url ||
              application.documents?.profilePhoto?.url ||
              technician.profilePictureUrl,
            phone: personalInfo.phoneNumber || technician.phone,
            personalInfo: personalInfo,
            availability: availabilityInfo, // Use new availability structure
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
        workAreas: serviceAreas, // Use extracted serviceAreas
        serviceRadiusKm: workRadius, // Use extracted workRadius
        status: "approved",
        profilePictureUrl:
          application.documents?.passportPhoto?.url ||
          application.documents?.profilePhoto?.url,
        phone: personalInfo.phoneNumber,
        personalInfo: personalInfo,
        availability: availabilityInfo, // Use new availability structure
        averageRating: 0,
        ratingCount: 0,
        totalJobs: 0,
        completedJobs: 0,
        ongoingJobs: 0,
        totalEarnings: 0,
        resubmittedCount: 0,
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

  async findApplicationByTechnicianId(
    technicianId: string
  ): Promise<AdminITechnicianApplication | null> {
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

          return appByUserId
            ? convertToAdminApplication(
                appByUserId as ModelITechnicianApplication
              )
            : null;
        }
      }

      return application
        ? convertToAdminApplication(application as ModelITechnicianApplication)
        : null;
    } catch (error) {
      console.error("Error finding application by technician ID:", error);
      return null;
    }
  }

  async updateTechnicianPaymentDetails(
    technicianId: string,
    paymentDetails: {
      bankAccount: {
        holderName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
      };
      upiId: string;
      withdrawalPreference: string;
    }
  ): Promise<boolean> {
    try {
      const result = await Technician.findByIdAndUpdate(
        technicianId,
        {
          $set: {
            "paymentDetails.bankAccount.holderName":
              paymentDetails.bankAccount.holderName,
            "paymentDetails.bankAccount.accountNumber":
              paymentDetails.bankAccount.accountNumber,
            "paymentDetails.bankAccount.ifscCode":
              paymentDetails.bankAccount.ifscCode,
            "paymentDetails.bankAccount.bankName":
              paymentDetails.bankAccount.bankName,
            "paymentDetails.upiId": paymentDetails.upiId,
            "paymentDetails.withdrawalPreference":
              paymentDetails.withdrawalPreference,
          },
        },
        { new: true, runValidators: true }
      );

      return !!result;
    } catch (error) {
      console.error("Repository - Error updating payment details:", error);
      return false;
    }
  }

  async updateTechnicianIdentityVerification(
    technicianId: string,
    identityData: {
      idType: string;
      idNumber: string;
      idDocument: string;
      verificationStatus: string;
      verified: boolean;
      verifiedAt: Date;
    }
  ): Promise<boolean> {
    try {
      const result = await Technician.findByIdAndUpdate(
        technicianId,
        {
          $set: {
            "identityVerification.idType": identityData.idType,
            "identityVerification.idNumber": identityData.idNumber,
            "identityVerification.idDocument": identityData.idDocument,
            "identityVerification.verificationStatus":
              identityData.verificationStatus,
            "identityVerification.verified": identityData.verified,
            "identityVerification.verifiedAt": identityData.verifiedAt,
          },
        },
        { new: true, runValidators: true }
      );

      return !!result;
    } catch (error) {
      console.error(
        "Repository - Error updating identity verification:",
        error
      );
      return false;
    }
  }
  async save(
    application: AdminITechnicianApplication
  ): Promise<AdminITechnicianApplication> {
    try {
      // Convert admin application to model format
      const modelData = convertToModelApplication(application);

      // Update the application in database
      const updatedApplication = await TechnicianApplication.findByIdAndUpdate(
        application._id,
        { $set: modelData },
        { new: true, runValidators: true }
      );

      if (!updatedApplication) {
        throw new Error("Application not found");
      }

      return convertToAdminApplication(updatedApplication);
    } catch (error) {
      console.error("Error saving application:", error);
      throw error;
    }
  }

  async updateTechnicianDocuments(
    technicianId: string,
    documents: any[]
  ): Promise<ITechnician | null> {
    try {
      return await Technician.findByIdAndUpdate(
        technicianId,
        {
          $set: { documents: documents },
          $currentDate: { updatedAt: true },
        },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating technician documents:", error);
      throw error;
    }
  }
  async findTechnicians(filters: TechnicianFilter): Promise<ITechnician[]> {
    try {
      // Build the MongoDB query
      const query: any = {};

      // Status filter
      if (filters.status) {
        if (typeof filters.status === "string") {
          query.status = filters.status;
        } else if (filters.status.$in) {
          query.status = { $in: filters.status.$in };
        }
      }

      // Service filter
      if (filters.services) {
        if (typeof filters.services === "string") {
          query.services = { $in: [filters.services] };
        } else if (filters.services.$in) {
          query.services = { $in: filters.services.$in };
        }
      }

      // Rating filter
      if (filters.averageRating) {
        query.averageRating = filters.averageRating;
      }

      // Work areas filter
      if (filters.workAreas) {
        query.workAreas = filters.workAreas;
      }

      // Search filter (name, email, etc.)
      if (filters.$or) {
        query.$or = filters.$or;
      }

      // Date range filter
      if (filters.createdAt) {
        query.createdAt = filters.createdAt;
      }
      const technicians = await Technician.find(query)
        .populate("userId", "email phone fullName")
        .sort({ createdAt: -1 })
        .lean();

      return technicians as ITechnician[];
    } catch (error) {
      console.error("Repository: Error finding technicians:", error);
      throw error;
    }
  }

  async findPublicTechnicians(
  filters: TechnicianFilter,
  skip: number = 0,
  limit: number = 10,
  sortOptions: any = { createdAt: -1 }  // Ensure this parameter is accepted
): Promise<ITechnician[]> {
  try {
    // Force only approved technicians for public access
    const publicFilters = {
      ...filters,
      status: "approved",
    };

    // Remove any sensitive filter fields that shouldn't be exposed publicly
    delete publicFilters.$or;

    // Build the MongoDB query
    const query: any = { status: "approved" };

    // Service filter
    if (filters.services) {
      if (typeof filters.services === "string") {
        query.services = { $in: [filters.services] };
      } else if (filters.services.$in) {
        query.services = { $in: filters.services.$in };
      }
    }

    // Rating filter
    if (filters.averageRating) {
      query.averageRating = filters.averageRating;
    }

    // Work areas filter
    if (filters.workAreas) {
      query.workAreas = filters.workAreas;
    }

    // Search filter (name, email, etc.)
    if (filters.$or) {
      // For public access, only allow search on safe fields
      const safeSearchFields = ["displayName", "services", "workAreas"];
      query.$or = filters.$or.filter((condition) => {
        const field = Object.keys(condition)[0];
        return safeSearchFields.includes(field);
      });
    }

    // Date range filter
    if (filters.createdAt) {
      query.createdAt = filters.createdAt;
    }

    // FIXED: Use the provided sortOptions parameter
    const technicians = await Technician.find(query)
      .populate("userId", "email phone fullName")
      .sort(sortOptions)  // Use the sortOptions passed from service
      .skip(skip)
      .limit(limit)
      .lean();

    // Remove sensitive data before returning
    const publicTechnicians = technicians.map((tech) => ({
      ...tech,
      identityVerification: undefined,
      paymentDetails: undefined,
      suspensionReason: undefined,
      rejectionReason: undefined,
      personalInfo: tech.personalInfo
        ? {
            ...tech.personalInfo,
            // Keep only non-sensitive personal info
            fullName: tech.personalInfo.fullName,
            languages: tech.personalInfo.languages,
            bio: tech.personalInfo.bio,
            address: tech.personalInfo.address
              ? {
                  city: tech.personalInfo.address.city,
                  state: tech.personalInfo.address.state,
                  pincode: tech.personalInfo.address.pincode,
                }
              : undefined,
          }
        : undefined,
    }));

    return publicTechnicians as ITechnician[];
  } catch (error) {
    console.error("Repository: Error finding public technicians:", error);
    throw error;
  }
}

  async countPublicTechnicians(filters: TechnicianFilter): Promise<number> {
    try {
      // Build the same query as findPublicTechnicians but for counting
      const query: any = { status: "approved" };

      // Service filter
      if (filters.services) {
        if (typeof filters.services === "string") {
          query.services = { $in: [filters.services] };
        } else if (filters.services.$in) {
          query.services = { $in: filters.services.$in };
        }
      }

      // Rating filter
      if (filters.averageRating) {
        query.averageRating = filters.averageRating;
      }

      // Work areas filter
      if (filters.workAreas) {
        query.workAreas = filters.workAreas;
      }

      // Search filter
      if (filters.$or) {
        const safeSearchFields = ["displayName", "services", "workAreas"];
        query.$or = filters.$or.filter((condition) => {
          const field = Object.keys(condition)[0];
          return safeSearchFields.includes(field);
        });
      }

      // Date range filter
      if (filters.createdAt) {
        query.createdAt = filters.createdAt;
      }

      const count = await Technician.countDocuments(query);

      return count;
    } catch (error) {
      console.error("Repository: Error counting public technicians:", error);
      throw error;
    }
  }
  async findById(id: string): Promise<ITechnician | null> {
    try {
      const technician = await Technician.findById(id)
        .populate("userId", "email phone fullName")
        .lean();

      return technician as ITechnician | null;
    } catch (error) {
      console.error("Repository: Error finding technician by ID:", error);
      throw error;
    }
  }
  async updateTechnicianLocation(
    technicianId: string,
    coordinates: [number, number]
  ): Promise<ITechnician | null> {
    try {
      return await Technician.findByIdAndUpdate(
        technicianId,
        {
          $set: {
            "currentLocation.coordinates": coordinates,
            "currentLocation.type": "Point",
          },
        },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating technician location:", error);
      return null;
    }
  }
  async getTechnicianAvailability(technicianId: string): Promise<any> {
    try {
      // Get active slot rules
      const slotRules = await SlotRuleSchema.find({
        technicianId: new Types.ObjectId(technicianId),
        isActive: true,
      });

      // Get upcoming availability
      const upcomingAvailability = await TechnicianAvailabilitySchema.find({
        technicianId: new Types.ObjectId(technicianId),
        date: { $gte: new Date() },
      })
        .sort({ date: 1 })
        .limit(7); // Get next 7 days

      return {
        slotRules,
        upcomingAvailability,
        hasAvailability: slotRules.length > 0,
      };
    } catch (error) {
      console.error("Error getting technician availability:", error);
      return null;
    }
  }

  async getUpcomingAvailability(
    technicianId: string,
    days: number = 7
  ): Promise<any[]> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      return await TechnicianAvailabilitySchema.find({
        technicianId: new Types.ObjectId(technicianId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ date: 1 });
    } catch (error) {
      console.error("Error getting upcoming availability:", error);
      return [];
    }
  }
  async getActiveSlotRules(technicianId: string): Promise<any[]> {
    try {
      return await SlotRuleSchema.find({
        technicianId: new Types.ObjectId(technicianId),
        isActive: true,
        $or: [
          { effectiveTo: { $exists: false } },
          { effectiveTo: { $gte: new Date() } },
        ],
      }).sort({ effectiveFrom: 1 });
    } catch (error) {
      console.error("Error fetching active slot rules:", error);
      throw error;
    }
  }

  async getUpcomingAvailabilityProfile(
    technicianId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      return await TechnicianAvailabilitySchema.find({
        technicianId: new Types.ObjectId(technicianId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ date: 1 });
    } catch (error) {
      console.error("Error fetching upcoming availability:", error);
      throw error;
    }
  }

  async findAvailabilityByTechnicianAndDate(
    technicianId: string,
    date: Date
  ): Promise<any> {
    try {
      return await TechnicianAvailabilitySchema.findOne({
        technicianId: new Types.ObjectId(technicianId),
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lte: new Date(date.setHours(23, 59, 59, 999)),
        },
      });
    } catch (error) {
      console.error("Error finding availability by date:", error);
      throw error;
    }
  }

  async findAvailabilityInRange(
    technicianId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    try {
      return await TechnicianAvailabilitySchema.find({
        technicianId: new Types.ObjectId(technicianId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ date: 1 });
    } catch (error) {
      console.error("Error finding availability in range:", error);
      throw error;
    }
  }
}
