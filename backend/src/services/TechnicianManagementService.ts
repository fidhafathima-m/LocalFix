import { TechnicianManagementRepository } from "../repositories/admin/TechnicianManagemnetRepository";
import {
  IAdminTechnician,
  ITechnician,
  ITechnicianApplication,
  TechnicianListResponse,
  SingleTechnicianResponse,
  ApplicationListResponse,
  TechnicianStatsResponse,
  ApplicationStatsResponse,
  UpdateStatusRequest,
  ApproveApplicationRequest,
  RejectApplicationRequest,
  TechnicianFilters,
  ApplicationFilters,
} from "../interfaces/admin/ITechnicianManagement";
import { Types } from "mongoose";
import { emailService } from "./EmailService";
import { ITechnicianManagementService } from "../interfaces/services/admin/ITechnicianManagementService";
import { ITechnicianManagementRepository } from "../interfaces/repository/admin/ITechnicianManagementRepository";
import { ResponseHelper } from "../utils/responseHelper";
import {
  TECHNICIAN_MANAGEMENT_MESSAGES,
  STATUS_MAPPING,
  FILTER_DEFAULTS,
  RATING_FILTER_MAPPING,
  STATUS_FILTER_MAPPING,
  VALID_STATUS_VALUES,
  PERSONAL_INFO_DEFAULTS,
  DOCUMENT_FIELDS,
  SEARCH_FIELDS,
  PAGINATION_DEFAULTS,
  EMAIL_CONFIG,
  BANK_DETAILS_DEFAULTS,
  TECHNICIAN_STATUS,
  APPLICATION_STATUS,
} from "../constants";
import { IUser } from "@/interfaces/user/IUser";
import { IAddress } from "@/interfaces/user/IAddress";
import { IUserAddress } from "@/models/UserAddressSchema";
import {
  ApplicationFiltersDto,
  ApplicationListDto,
  ApplicationListResponseDto,
  RejectApplicationRequestDto,
  SingleTechnicianResponseDto,
  TechnicianFiltersDto,
  TechnicianListDto,
  TechnicianListResponseDto,
  UpdateStatusRequestDto,
} from "@/interfaces/dtos/technicianDtos";
import { TechnicianMapper } from "../mappers/technicianMappers";
import { ApplicationMapper } from "../mappers/applicationMapper";
import { TechnicianAvailabilityService } from "./AvailabilityService";

interface DocumentInfo {
  url: string;
  verified: boolean;
  uploadedAt: Date;
  type: string;
}

interface FormattedDocuments {
  [key: string]: DocumentInfo;
}

interface PersonalInfo {
  fullName: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: string | Date | undefined;
  languages: string[];
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

// Update the FilterQuery interface in your service to match the repository
interface FilterQuery {
  status?: string | { $in: string[] };
  services?: string;
  averageRating?: { $gte?: number; $lte?: number };
  workAreas?: { $in: RegExp[] };
  $or?: Array<{ [key: string]: RegExp }>;
  "skills.services"?: string;
  [key: string]: unknown; // Add index signature to match repository FilterQuery
}

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

export class TechnicianManagementService
  implements ITechnicianManagementService
{
  private technicianRepository: ITechnicianManagementRepository;

  constructor(technicianRepository: ITechnicianManagementRepository) {
    this.technicianRepository = technicianRepository;
  }

  // Helper function to format documents from TechnicianApplication.documents
  private formatApplicationDocuments(documents: unknown): FormattedDocuments {
    if (!documents || typeof documents !== "object") return {};

    const formatted: FormattedDocuments = {};

    DOCUMENT_FIELDS.forEach((key) => {
      const doc = (documents as Record<string, any>)[key];
      if (doc && doc.url) {
        formatted[key] = {
          url: doc.url,
          verified: doc.verified || false,
          uploadedAt: doc.uploadedAt || new Date(),
          type: key,
        };
      }
    });

    return formatted;
  }

  async getAllTechnicians(
    filters: TechnicianFiltersDto
  ): Promise<TechnicianListResponseDto> {
    try {
      const {
        status = FILTER_DEFAULTS.STATUS,
        service = FILTER_DEFAULTS.SERVICE,
        rating = FILTER_DEFAULTS.RATING,
        location = FILTER_DEFAULTS.LOCATION,
        search,
        page = FILTER_DEFAULTS.PAGE,
        limit = FILTER_DEFAULTS.LIMIT,
      } = filters;

      // Build filter object
      const filter: FilterQuery = {};

      // Status filter
      if (status && status !== "all") {
        const dbStatus = STATUS_FILTER_MAPPING[status] || status;
        filter.status = dbStatus;
      } else {
        filter.status = {
          $in: [
            TECHNICIAN_STATUS.APPROVED,
            TECHNICIAN_STATUS.SUSPENDED,
            TECHNICIAN_STATUS.REJECTED,
          ],
        };
      }

      // Service filter
      if (service && service !== FILTER_DEFAULTS.SERVICE) {
        filter.services = service;
      }

      // Rating filter
      if (rating && rating !== FILTER_DEFAULTS.RATING) {
        const ratingFilter =
          RATING_FILTER_MAPPING[rating as keyof typeof RATING_FILTER_MAPPING];
        if (ratingFilter) {
          filter.averageRating = ratingFilter;
        }
      }

      // Search filter
      if (search) {
        const searchRegex = new RegExp(search as string, "i");
        filter.$or = SEARCH_FIELDS.TECHNICIAN.map((field) => ({
          [field]: searchRegex,
        }));
      }

      // Location filter
      if (location && location !== FILTER_DEFAULTS.LOCATION) {
        filter.workAreas = { $in: [new RegExp(location as string, "i")] };
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      // Get technicians with user data populated
      const technicians = await this.technicianRepository.findAllTechnicians(
        filter,
        skip,
        limitNum
      );
      const total = await this.technicianRepository.countTechnicians(filter);

      const technicianDtos: TechnicianListDto[] = await Promise.all(
        technicians.map(async (tech: ITechnician) => {
          const adminTechnician = await this.convertToAdminTechnician(tech);
          return this.mapAdminTechnicianToListDto(adminTechnician);
        })
      );

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIANS_RETRIEVED,
        {
          technicians: technicianDtos,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        }
      );
    } catch (error: unknown) {
      console.error("Get technicians error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_TECHNICIANS
      );
    }
  }

  private mapAdminTechnicianToListDto(
    adminTechnician: IAdminTechnician
  ): TechnicianListDto {
    return {
      _id: adminTechnician._id.toString(),
      userId: adminTechnician.userId?.toString() || "",
      displayName: adminTechnician.displayName || "",
      email: adminTechnician.email || "",
      phone: adminTechnician.phone || "",
      services: adminTechnician.services || [],
      status: adminTechnician.status || "",
      experienceYears: adminTechnician.experienceYears || 0,
      ratingCount: adminTechnician.ratingCount || 0,
      averageRating: adminTechnician.averageRating || 0,
      totalJobs: adminTechnician.totalJobs || 0,
      completedJobs: adminTechnician.completedJobs || 0,
      createdAt: adminTechnician.createdAt || new Date(),
      profilePictureUrl: adminTechnician.profilePictureUrl,

      address: adminTechnician.personalInfo?.address,
      workAreas: adminTechnician.workAreas,
      serviceRadiusKm: adminTechnician.serviceRadiusKm,
    };
  }
  async getTechnicianById(id: string): Promise<SingleTechnicianResponseDto> {
    try {
      const technician = await this.technicianRepository.findTechnicianById(id);

      if (!technician) {
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      const adminTechnician = await this.convertToAdminTechnician(technician);

      const technicianDto = TechnicianMapper.toDetailDto(adminTechnician);

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_RETRIEVED,
        {
          technician: technicianDto,
        }
      );
    } catch (error: unknown) {
      console.error("Get technician error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_TECHNICIAN
      );
    }
  }

  private async convertToAdminTechnician(
    technician: ITechnician
  ): Promise<IAdminTechnician> {
    // Get user data
    const user = await this.technicianRepository.findUserById(
      technician.userId as Types.ObjectId
    );

    // Get technician's application data for personal info
    const application =
      await this.technicianRepository.findApplicationByTechnicianId(
        technician._id.toString()
      );

    const userAddress = await this.technicianRepository.findUserAddress(
      technician.userId as Types.ObjectId
    );

    const mapStatus = (
      status: string,
      application?: ITechnicianApplication
    ): "pending" | "approved" | "rejected" | "suspended" => {
      if (
        application &&
        [
          APPLICATION_STATUS.SUBMITTED,
          APPLICATION_STATUS.UNDER_REVIEW,
          TECHNICIAN_STATUS.PENDING,
        ].includes(application.status as any)
      ) {
        return TECHNICIAN_STATUS.PENDING as "pending";
      }

      const mappedStatus =
        STATUS_MAPPING[status as keyof typeof STATUS_MAPPING];
      return (
        mappedStatus ||
        (status as "pending" | "approved" | "rejected" | "suspended")
      );
    };

    const status = mapStatus(technician.status, application || undefined);

    const getPersonalInfo = (
      technician: ITechnician,
      application?: ITechnicianApplication,
      userAddress?: IAddress | null | IUserAddress
    ): PersonalInfo => {
      const hasRealTechnicianData =
        technician.personalInfo &&
        (technician.personalInfo.gender !== PERSONAL_INFO_DEFAULTS.GENDER ||
          technician.personalInfo.phoneNumber !==
            PERSONAL_INFO_DEFAULTS.PHONE_NUMBER ||
          technician.personalInfo.dateOfBirth !==
            PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH);

      let personalInfo: PersonalInfo;

      if (hasRealTechnicianData) {
        personalInfo = {
          fullName: technician.personalInfo?.fullName || technician.displayName,
          gender:
            technician.personalInfo?.gender || PERSONAL_INFO_DEFAULTS.GENDER,
          phoneNumber:
            technician.personalInfo?.phoneNumber ||
            technician.phone ||
            PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
          dateOfBirth:
            technician.personalInfo?.dateOfBirth ||
            PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
          languages: Array.isArray(technician.personalInfo?.languages)
            ? technician.personalInfo.languages
            : PERSONAL_INFO_DEFAULTS.LANGUAGES,
          address: undefined,
        };
      } else if (application?.personal) {
        const appPersonal = application.personal;
        const appSkills = application.skills;
        personalInfo = {
          fullName: appPersonal.fullName || technician.displayName,
          gender: appPersonal.gender || PERSONAL_INFO_DEFAULTS.GENDER,
          phoneNumber:
            appPersonal.phoneNumber ||
            technician.phone ||
            PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
          dateOfBirth:
            appPersonal.dateOfBirth || PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
          languages: Array.isArray(appSkills.languages)
            ? appSkills.languages
            : PERSONAL_INFO_DEFAULTS.LANGUAGES,
          address: undefined,
        };
      } else {
        personalInfo = {
          fullName: technician.displayName,
          gender: PERSONAL_INFO_DEFAULTS.GENDER,
          phoneNumber: technician.phone || PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
          dateOfBirth: PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
          languages: PERSONAL_INFO_DEFAULTS.LANGUAGES,
          address: undefined,
        };
      }

      if (userAddress) {
        personalInfo.address = {
          street: userAddress.street || PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
          city: userAddress.city || PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
          state: userAddress.state || PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
          pincode:
            userAddress.pincode || PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
        };
      } else if (technician.personalInfo?.address) {
        const address = technician.personalInfo.address;
        personalInfo.address = {
          street: address.street || PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
          city: address.city || PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
          state: address.state || PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
          pincode: address.pincode || PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
        };
      } else if (application?.personal?.address) {
        const address = application.personal.address;
        personalInfo.address = {
          street: address.street || PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
          city: address.city || PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
          state: address.state || PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
          pincode: address.pincode || PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
        };
      }

      return personalInfo;
    };

    const personalInfo = getPersonalInfo(
      technician,
      application || undefined,
      userAddress
    );

    const getDocuments = (
      technician: ITechnician,
      application?: ITechnicianApplication
    ): FormattedDocuments => {
      if (application?.documents) {
        const formattedDocs = this.formatApplicationDocuments(
          application.documents
        );
        return formattedDocs;
      }

      // Fallback for profile picture
      const fallbackDocs: FormattedDocuments = {};
      if (technician.profilePictureUrl) {
        fallbackDocs.profilePhoto = {
          url: technician.profilePictureUrl,
          verified: true,
          uploadedAt: new Date(),
          type: "profilePhoto",
        };
      }

      return fallbackDocs;
    };

    // Format documents
    const documents = getDocuments(technician, application || undefined);

    // Create the admin technician view
    const adminTechnician: IAdminTechnician = {
      _id: technician._id,
      userId: technician.userId,
      displayName: technician.displayName,
      email: user?.email || "",
      phone: user?.phone || technician.phone || "",
      bio: technician.bio || "",
      services: technician.services || [],
      experienceYears: technician.experienceYears || 0,
      workAreas: technician.workAreas || [],
      serviceRadiusKm: technician.serviceRadiusKm || 0,
      status: status,
      averageRating: technician.averageRating || 0,
      ratingCount: technician.ratingCount || 0,
      totalJobs: technician.totalJobs || 0,
      completedJobs: technician.completedJobs || 0,
      ongoingJobs: technician.ongoingJobs || 0,
      totalEarnings: technician.totalEarnings || 0,
      profilePictureUrl: technician.profilePictureUrl || "",
      createdAt: technician.createdAt,
      updatedAt: technician.updatedAt,
      user: user
        ? {
            email: user.email || "",
            phone: user.phone || "",
            fullName: user.fullName || technician.displayName,
            createdAt: user.createdAt,
          }
        : undefined,
      personalInfo: personalInfo,
      identityVerification: technician.identityVerification,
      documents: documents,
      availability: undefined,
      suspensionReason: technician.suspensionReason,
      suspendedAt: technician.suspendedAt,
    };

    return adminTechnician;
  }

  async updateTechnicianStatus(
    id: string,
    statusData: UpdateStatusRequestDto
  ): Promise<SingleTechnicianResponseDto> {
    try {
      const {
        status,
        emailNotification = EMAIL_CONFIG.DEFAULT_NOTIFICATION,
        reason,
      } = statusData;

      if (
        !status ||
        !VALID_STATUS_VALUES.includes(
          status as "approved" | "rejected" | "suspended"
        )
      ) {
        return ResponseHelper.badRequest(
          TECHNICIAN_MANAGEMENT_MESSAGES.VALID_STATUS_REQUIRED
        );
      }
      // Prepare update data
      const updateData: Record<string, unknown> = {};

      // Store suspension/rejection reason and timestamp
      if (
        status === TECHNICIAN_STATUS.SUSPENDED ||
        status === TECHNICIAN_STATUS.REJECTED
      ) {
        updateData.suspensionReason = reason;
        updateData.suspendedAt = new Date();
      } else if (status === TECHNICIAN_STATUS.APPROVED) {
        // Clear suspension data when approving/reactivating
        updateData.suspensionReason = undefined;
        updateData.suspendedAt = undefined;
      }

      // Update technician status - pass status separately and updateData for additional fields
      const technician = await this.technicianRepository.updateTechnicianStatus(
        id,
        status,
        updateData
      );

      if (!technician) {
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      // Get user data for email
      const user = await this.technicianRepository.findUserById(
        technician.userId as Types.ObjectId
      );

      let emailSent = false;
      let emailMessage = "";

      // Send email notification if requested and user email exists
      if (emailNotification && user?.email) {
        if (status === TECHNICIAN_STATUS.APPROVED) {
          emailSent = await emailService.sendApplicationApprovalEmail(
            user.email,
            technician.displayName
          );
          emailMessage = emailSent
            ? TECHNICIAN_MANAGEMENT_MESSAGES.APPROVAL_EMAIL_SENT
            : TECHNICIAN_MANAGEMENT_MESSAGES.EMAIL_SEND_FAILED;

          await this.technicianRepository.updateApplicationStatus(
            id,
            APPLICATION_STATUS.APPROVED
          );
        } else {
          emailSent = await emailService.sendStatusUpdateEmail(
            user.email,
            technician.displayName,
            status,
            reason
          );
          emailMessage = emailSent
            ? TECHNICIAN_MANAGEMENT_MESSAGES.STATUS_EMAIL_SENT.replace(
                "${status}",
                status
              )
            : TECHNICIAN_MANAGEMENT_MESSAGES.EMAIL_SEND_FAILED;
        }
      }

      const adminTechnician = await this.convertToAdminTechnician(technician);
      const technicianDto = TechnicianMapper.toDetailDto(adminTechnician);

      return ResponseHelper.success(
        `${TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_STATUS_UPDATED.replace(
          "${status}",
          status
        )}${emailMessage}`,
        {
          technician: technicianDto,
        }
      );
    } catch (error: unknown) {
      console.error("Update technician status error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_UPDATE_STATUS
      );
    }
  }

  async getTechnicianStats(): Promise<TechnicianStatsResponse> {
    try {
      const stats = await this.technicianRepository.getTechnicianStats();

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_STATS_RETRIEVED,
        stats
      );
    } catch (error: unknown) {
      console.error("Get technician stats error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_STATS
      );
    }
  }

  async getPendingApplications(
    filters: ApplicationFiltersDto
  ): Promise<ApplicationListResponseDto> {
    try {
      const {
        status = FILTER_DEFAULTS.APPLICATION_STATUS,
        search,
        service = FILTER_DEFAULTS.SERVICE,
        page = FILTER_DEFAULTS.PAGE,
        limit = FILTER_DEFAULTS.LIMIT,
      } = filters;

      // Build filter object
      const filter: FilterQuery = {
        status: { $in: (status as string).split(",") },
      };

      // Search filter
      if (search) {
        const searchRegex = new RegExp(search as string, "i");
        filter.$or = SEARCH_FIELDS.APPLICATION.map((field) => ({
          [field]: searchRegex,
        }));
      }

      // Service filter
      if (service && service !== FILTER_DEFAULTS.SERVICE) {
        filter["skills.services"] = service;
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      const applications = await this.technicianRepository.findAllApplications(
        filter,
        skip,
        limitNum
      );
      const total = await this.technicianRepository.countApplications(filter);

      const applicationDtos: ApplicationListDto[] = applications.map((app) =>
        ApplicationMapper.toListDto(app)
      );

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.PENDING_APPLICATIONS_RETRIEVED,
        {
          applications: applicationDtos,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
        }
      );
    } catch (error: unknown) {
      console.error("Get pending applications error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_APPLICATIONS
      );
    }
  }

  async approveApplication(id: string): Promise<ApplicationListResponseDto> {
    try {
      const application = await this.technicianRepository.findApplicationById(
        id
      );
      if (!application) {
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_NOT_FOUND
        );
      }

      const availabilityService = new TechnicianAvailabilityService();

      // Update application status
      const updatedApplication =
        await this.technicianRepository.updateApplicationStatus(
          id,
          APPLICATION_STATUS.APPROVED
        );

      if (!updatedApplication) {
        return ResponseHelper.badRequest(
          TECHNICIAN_MANAGEMENT_MESSAGES.UPDATE_APPLICATION_FAILED
        );
      }

      // Update user's application status
      await this.technicianRepository.updateUserApplicationStatus(
        application.technicianId as Types.ObjectId,
        APPLICATION_STATUS.APPROVED
      );

      // Update or create technician record
      const technician = await this.technicianRepository.findOrCreateTechnician(
        application
      );

      if (technician && application.availability) {
        await availabilityService.createTechnicianAvailabilityFromApplication(
          technician._id.toString(),
          application.availability
        );
      }

      if (application.documents && technician) {
        const technicianDocuments: any[] = [];

        // Convert application documents to technician documents format
        Object.entries(application.documents).forEach(
          ([type, doc]: [string, any]) => {
            if (doc && doc.url) {
              technicianDocuments.push({
                type: type,
                fileName: doc.filename || `${type}_document`,
                url: doc.url,
                uploadedAt: doc.uploadedAt || new Date(),
                verified: true, // Auto-verify upon approval
                status: "approved" as const,
                verifiedAt: new Date(),
              });
            }
          }
        );

        // Update technician with documents
        await this.technicianRepository.updateTechnicianDocuments(
          technician._id.toString(),
          technicianDocuments
        );
      }

      let languagesArray: string[] = [];

      if (application.skills?.languages) {
        const rawLanguages: any = application.skills.languages;

        if (Array.isArray(rawLanguages)) {
          languagesArray = rawLanguages;
        } else if (typeof rawLanguages === "string") {
          try {
            const parsed = JSON.parse(rawLanguages);
            languagesArray = Array.isArray(parsed) ? parsed : [rawLanguages];
          } catch {
            if ((rawLanguages as string).includes(",")) {
              languagesArray = (rawLanguages as string)
                .split(",")
                .map((lang: string) => lang.trim());
            } else {
              languagesArray = [rawLanguages as string];
            }
          }
        }
      }

      let addressData: Record<string, unknown> = {};
      if (application.identity?.address) {
        if (typeof application.identity.address === "string") {
          try {
            addressData = JSON.parse(application.identity.address);
          } catch (e) {
            console.error("Error parsing address JSON:", e);
            addressData = {};
          }
        } else {
          addressData = application.identity.address as Record<string, unknown>;
        }
      }

      const identityVerificationData = {
        idType: this.mapIdType(application.identity?.idType || ""),
        idNumber: application.identity?.idNumber || "",
        idDocument: application.documents?.idProof?.url || "",
        verificationStatus: "approved" as const,
        verified: true,
        verifiedAt: new Date(),
      };

      // Update technician with all data including identity verification
      if (technician) {
        await this.technicianRepository.updateTechnicianPersonalInfo(
          technician._id.toString(),
          {
            ...technician.personalInfo,
            languages: languagesArray,
            address: addressData,
          }
        );

        await this.technicianRepository.updateTechnicianIdentityVerification(
          technician._id.toString(),
          identityVerificationData
        );

        if (application.documents) {
          const technicianDocuments = Object.entries(application.documents).map(
            ([type, doc]: [string, any]) => ({
              _id: new Types.ObjectId().toString(),
              type: type,
              fileName: doc.filename || `${type}_document`,
              url: doc.url,
              uploadedAt: doc.uploadedAt || new Date(),
              verified: true,
              status: "approved" as const,
              verifiedAt: new Date(),
            })
          );

          await this.technicianRepository.updateTechnicianDocuments(
            technician._id.toString(),
            technicianDocuments
          );
        }
      }

      if (application.bank && technician) {
        const bankData = application.bank;

        // Create proper payment details structure
        const paymentDetails = {
          bankAccount: {
            holderName: bankData.accountHolderName?.trim() || "",
            accountNumber: bankData.accountNumber || "",
            ifscCode: bankData.ifscCode || "",
            bankName: bankData.bankName || "",
          },
          upiId: bankData.upiId || "",
          withdrawalPreference: "auto" as const, // Default to auto withdrawal
        };

        // Update payment details
        const updateResult =
          await this.technicianRepository.updateTechnicianPaymentDetails(
            technician._id.toString(),
            paymentDetails
          );
      } else {
      }

      // Send approval email
      let emailSent = false;
      let emailMessage = "";

      if (application.email) {
        emailSent = await emailService.sendApplicationApprovalEmail(
          application.email,
          application.personal?.fullName || "Technician"
        );
        emailMessage = emailSent
          ? TECHNICIAN_MANAGEMENT_MESSAGES.APPROVAL_EMAIL_SENT
          : TECHNICIAN_MANAGEMENT_MESSAGES.EMAIL_SEND_FAILED;
      }

      const applicationDto = ApplicationMapper.toListDto(updatedApplication);

      return ResponseHelper.success(
        `${TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_APPROVED}${emailMessage}`,
        {
          applications: [applicationDto],
          pagination: PAGINATION_DEFAULTS.SINGLE_RESULT,
        }
      );
    } catch (error: unknown) {
      console.error("Approve application error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_APPROVE_APPLICATION
      );
    }
  }
  async rejectApplication(
    id: string,
    rejectData: RejectApplicationRequestDto
  ): Promise<ApplicationListResponseDto> {
    try {
      const {
        rejectionReason,
        emailNotification = EMAIL_CONFIG.DEFAULT_NOTIFICATION,
      } = rejectData;

      const application = await this.technicianRepository.findApplicationById(
        id
      );
      if (!application) {
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_NOT_FOUND
        );
      }

      if (application.technicianId) {
        const technician = await this.technicianRepository.findTechnicianById(
          application.technicianId.toString()
        );

        if (technician) {
          await this.technicianRepository.updateTechnicianStatus(
            application.technicianId.toString(),
            TECHNICIAN_STATUS.REJECTED
          );
        } else {
          const technicianByUser =
            await this.technicianRepository.findTechnicianByUserId(
              application.technicianId.toString()
            );
          if (technicianByUser) {
            await this.technicianRepository.updateTechnicianStatus(
              technicianByUser._id.toString(),
              TECHNICIAN_STATUS.REJECTED
            );
          } else {
          }
        }
      } else {
      }

      const updatedApplication =
        await this.technicianRepository.updateApplicationStatus(
          id,
          APPLICATION_STATUS.REJECTED,
          {
            rejectionReason,
            rejectedAt: new Date(),
          }
        );

      if (!updatedApplication) {
        return ResponseHelper.badRequest(
          TECHNICIAN_MANAGEMENT_MESSAGES.UPDATE_APPLICATION_FAILED
        );
      }

      await this.technicianRepository.updateUserApplicationStatus(
        application.technicianId as Types.ObjectId,
        APPLICATION_STATUS.REJECTED
      );

      // Send rejection email
      let emailSent = false;
      let emailMessage = "";

      if (emailNotification && application.email) {
        emailSent = await emailService.sendApplicationRejectionEmail(
          application.email,
          application.personal?.fullName || "Applicant",
          rejectionReason
        );
        emailMessage = emailSent
          ? TECHNICIAN_MANAGEMENT_MESSAGES.REJECTION_EMAIL_SENT
          : TECHNICIAN_MANAGEMENT_MESSAGES.EMAIL_SEND_FAILED;
      }

      const applicationDto = ApplicationMapper.toListDto(updatedApplication);

      return ResponseHelper.success(
        `${TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_REJECTED}${emailMessage}`,
        {
          applications: [applicationDto],
          pagination: PAGINATION_DEFAULTS.SINGLE_RESULT,
        }
      );
    } catch (error: unknown) {
      console.error("Reject application error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_REJECT_APPLICATION
      );
    }
  }
  async getApplicationById(id: string): Promise<ApplicationListResponseDto> {
    try {
      const application = await this.technicianRepository.findApplicationById(
        id
      );
      if (!application) {
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_NOT_FOUND
        );
      }

      // Get user data
      const user = await this.technicianRepository.updateUserApplicationStatus(
        application.technicianId as Types.ObjectId,
        application.status
      );

      // Format documents from TechnicianApplication.documents for frontend
      const formattedDocuments = this.formatApplicationDocuments(
        application.documents || {}
      );

      const applicationData: ITechnicianApplication = {
        ...application.toObject(),
        _id: application._id as Types.ObjectId,
        technicianId: application.technicianId as Types.ObjectId,
        user,
        documents: formattedDocuments,
      } as ITechnicianApplication;

      const applicationDto = ApplicationMapper.toDetailDto(applicationData);

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_RETRIEVED,
        {
          applications: [applicationDto],
          pagination: PAGINATION_DEFAULTS.SINGLE_RESULT,
        }
      );
    } catch (error: unknown) {
      console.error("Get application error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_APPLICATION
      );
    }
  }

  async getApplicationStats(): Promise<ApplicationStatsResponse> {
    try {
      const stats = await this.technicianRepository.getApplicationStats();

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_STATS_RETRIEVED,
        stats
      );
    } catch (error: unknown) {
      console.error("Get application stats error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_APPLICATION_STATS
      );
    }
  }

  async getTechnicianByApplicationId(
    applicationId: string
  ): Promise<TechnicianListResponseDto> {
    try {
      const technician =
        await this.technicianRepository.findTechnicianByApplicationId(
          applicationId
        );

      if (!technician) {
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_NOT_FOUND_FOR_APPLICATION
        );
      }

      const adminTechnician = await this.convertToAdminTechnician(technician);

      const technicianDto = TechnicianMapper.toDetailDto(adminTechnician);

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_BY_APPLICATION_RETRIEVED,
        {
          technicians: [technicianDto],
          pagination: PAGINATION_DEFAULTS.SINGLE_RESULT,
        }
      );
    } catch (error: unknown) {
      console.error("Get technician by application error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_TECHNICIAN_BY_APP
      );
    }
  }
  async getPublicTechnicians(
    filters: TechnicianFiltersDto
  ): Promise<TechnicianListResponseDto> {
    try {
      const repoFilters: TechnicianFilter = {
        status: "approved",
      };

      if (filters.service) {
        repoFilters.services = { $in: [filters.service] };
      }

      const technicians = await this.technicianRepository.findPublicTechnicians(
        repoFilters
      );
      // Map to DTOs with proper address mapping
      const technicianDtos: TechnicianListDto[] = await Promise.all(
        technicians.map(async (tech: ITechnician) => {
          const adminTechnician = await this.convertToAdminTechnician(tech);

          // Create public technician with address data
          const publicTechnician = {
            ...this.mapAdminTechnicianToListDto(adminTechnician),
            address: adminTechnician.personalInfo?.address,
            workAreas: adminTechnician.workAreas,
            serviceRadiusKm: adminTechnician.serviceRadiusKm,
          };

          return publicTechnician;
        })
      );

      return ResponseHelper.success("Technicians retrieved successfully", {
        technicians: technicianDtos,
        pagination: {
          page: 1,
          limit: technicians.length,
          total: technicians.length,
          pages: 1,
        },
      });
    } catch (error) {
      console.error(
        "Backend Service: Error getting public technicians:",
        error
      );
      return ResponseHelper.error("Failed to retrieve technicians");
    }
  }

  async getPublicTechnicianById(
    id: string
  ): Promise<SingleTechnicianResponseDto> {
    try {
      const technician = await this.technicianRepository.findTechnicianById(id);

      if (!technician) {
        return ResponseHelper.notFound("Technician not found");
      }

      // Only return approved technicians to public
      if (technician.status !== "approved") {
        return ResponseHelper.notFound("Technician not found");
      }

      const adminTechnician = await this.convertToAdminTechnician(technician);

      // Remove sensitive data for public access
      const publicTechnician = {
        ...adminTechnician,
        identityVerification: undefined,
        paymentDetails: undefined,
        suspensionReason: undefined,
        rejectionReason: undefined,
      };

      const technicianDto = TechnicianMapper.toDetailDto(publicTechnician);

      return ResponseHelper.success("Technician retrieved successfully", {
        technician: technicianDto,
      });
    } catch (error) {
      console.error("Get public technician service error:", error);
      return ResponseHelper.error("Failed to retrieve technician");
    }
  }

  private processAvailabilityData(availability: any): any {
    if (!availability) return {};

    // Extract availability preferences from application
    const daysAvailable: string[] = [];
    const serviceAreas: string[] = [];
    let workRadius = 10;
    let startTime = "09:00";
    let endTime = "18:00";

    // Process days availability
    if (availability.days) {
      Object.entries(availability.days).forEach(
        ([day, dayData]: [string, any]) => {
          if (dayData.available === true) {
            daysAvailable.push(day.toLowerCase());

            // Use the first available day's timing as default
            if (
              daysAvailable.length === 1 &&
              dayData.startTime &&
              dayData.endTime
            ) {
              startTime = dayData.startTime;
              endTime = dayData.endTime;
            }
          }
        }
      );
    }

    // Process work radius
    if (availability.workRadius) {
      workRadius = parseInt(availability.workRadius) || 10;
    }

    // Process service areas
    if (availability.serviceAreas) {
      if (Array.isArray(availability.serviceAreas)) {
        serviceAreas.push(...availability.serviceAreas);
      } else if (typeof availability.serviceAreas === "string") {
        serviceAreas.push(availability.serviceAreas);
      }
    }

    return {
      daysAvailable,
      startTime,
      endTime,
      workRadius,
      serviceAreas,
      emergencyService: availability.emergencyService || false,
      afterHoursService: availability.afterHoursService || false,
    };
  }

  private processAvailabilityPreferences(availability: any): any {
    const processed = this.processAvailabilityData(availability);

    return {
      availabilityPreferences: processed,
    };
  }
  private mapIdType(governmentIdType: string): string {
    const idTypeMap: { [key: string]: string } = {
      drivingLicense: "driving_license",
      passport: "passport",
      aadhaar: "aadhaar",
      voterId: "national_id",
      panCard: "national_id",
    };

    return idTypeMap[governmentIdType] || "national_id";
  }
}
