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
import { ApplicationFiltersDto, ApplicationListDto, ApplicationListResponseDto, RejectApplicationRequestDto, SingleTechnicianResponseDto, TechnicianFiltersDto, TechnicianListDto, TechnicianListResponseDto, UpdateStatusRequestDto } from "@/interfaces/dtos/technicianDtos";
import { TechnicianMapper } from "../mappers/technicianMappers";
import { ApplicationMapper } from "../mappers/applicationMapper";

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

export class TechnicianManagementService
  implements ITechnicianManagementService
{
  private technicianRepository: ITechnicianManagementRepository;

  constructor(technicianRepository: ITechnicianManagementRepository) {
    this.technicianRepository = technicianRepository;
  }

  // Helper function to format documents from TechnicianApplication.documents
  private formatApplicationDocuments(documents: unknown): FormattedDocuments {
    if (!documents || typeof documents !== 'object') return {};

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
      const ratingFilter = RATING_FILTER_MAPPING[rating as keyof typeof RATING_FILTER_MAPPING];
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

    // ✅ FIX: Map to DTOs instead of domain objects
    const technicianDtos: TechnicianListDto[] = await Promise.all(
      technicians.map(async (tech: ITechnician) => {
        const adminTechnician = await this.convertToAdminTechnician(tech);
        return this.mapAdminTechnicianToListDto(adminTechnician);
      })
    );

    return ResponseHelper.success(
      TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIANS_RETRIEVED,
      { 
        technicians: technicianDtos, // ✅ Now this is TechnicianListDto[]
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return ResponseHelper.error(
      TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_TECHNICIANS
    );
  }
}

private mapAdminTechnicianToListDto(adminTechnician: IAdminTechnician): TechnicianListDto {
  return {
    _id: adminTechnician._id.toString(),
    userId: adminTechnician.userId?.toString() || '',
    displayName: adminTechnician.displayName || '',
    email: adminTechnician.email || '',
    phone: adminTechnician.phone || '',
    services: adminTechnician.services || [],
    status: adminTechnician.status || '',
    averageRating: adminTechnician.averageRating || 0,
    totalJobs: adminTechnician.totalJobs || 0,
    completedJobs: adminTechnician.completedJobs || 0,
    createdAt: adminTechnician.createdAt || new Date(),
    profilePictureUrl: adminTechnician.profilePictureUrl,
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

    // ✅ FIX: Use TechnicianMapper to convert to DTO
    const technicianDto = TechnicianMapper.toDetailDto(adminTechnician);

    return ResponseHelper.success(
      TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_RETRIEVED,
      {
        technician: technicianDto, // ✅ Now this is TechnicianDetailDto
      }
    );
  } catch (error: unknown) {
    console.error("Get technician error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
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
          gender: technician.personalInfo?.gender || PERSONAL_INFO_DEFAULTS.GENDER,
          phoneNumber: technician.personalInfo?.phoneNumber || technician.phone || PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
          dateOfBirth: technician.personalInfo?.dateOfBirth || PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
          languages: Array.isArray(technician.personalInfo?.languages) 
            ? technician.personalInfo.languages 
            : PERSONAL_INFO_DEFAULTS.LANGUAGES,
          address: undefined,
        };
      } else if (application?.personal) {
        const appPersonal = application.personal;
        personalInfo = {
          fullName: appPersonal.fullName || technician.displayName,
          gender: appPersonal.gender || PERSONAL_INFO_DEFAULTS.GENDER,
          phoneNumber: appPersonal.phoneNumber || technician.phone || PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
          dateOfBirth: appPersonal.dateOfBirth || PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
          languages: Array.isArray(appPersonal.languages) ? appPersonal.languages : PERSONAL_INFO_DEFAULTS.LANGUAGES,
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
          pincode: userAddress.pincode || PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
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

    const personalInfo = getPersonalInfo(technician, application || undefined, userAddress);

    const getDocuments = (technician: ITechnician, application?: ITechnicianApplication): FormattedDocuments => {
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

     if (!status || !VALID_STATUS_VALUES.includes(status as "approved" | "rejected" | "suspended")) {
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
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
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
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
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

    // ✅ FIX: Map domain objects to DTOs
    const applicationDtos: ApplicationListDto[] = applications.map(app => 
      ApplicationMapper.toListDto(app)
    );

    return ResponseHelper.success(
      TECHNICIAN_MANAGEMENT_MESSAGES.PENDING_APPLICATIONS_RETRIEVED,
      {
        applications: applicationDtos, // ✅ Now this is ApplicationListDto[]
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
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

    if (application.personal?.languages && technician) {
      const languages = application.personal.languages;
      const languagesArray = Array.isArray(languages)
        ? languages
        : typeof languages === "string"
        ? [languages]
        : [];

      await this.technicianRepository.updateTechnicianPersonalInfo(
        technician._id.toString(),
        {
          ...technician.personalInfo,
          languages: languagesArray,
        }
      );
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

    // Update technician payment details
    if (application.bank && technician) {
      const bankData = application.bank;
      await this.technicianRepository.updateTechnicianPaymentDetails(
        technician._id.toString(),
        {
          bankAccount: {
            holderName: bankData.accountHolderName || "",
            accountNumber: bankData.accountNumber || "",
            ifscCode: bankData.ifscCode || "",
            bankName: bankData.bankName || "",
          },
          upiId: bankData.upiId || "",
          withdrawalPreference:
            bankData.withdrawalPreference ||
            BANK_DETAILS_DEFAULTS.WITHDRAWAL_PREFERENCE,
        }
      );
    }

    // ✅ FIX: Map domain object to DTO
    const applicationDto = ApplicationMapper.toListDto(updatedApplication);

    return ResponseHelper.success(
      `${TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_APPROVED}${emailMessage}`,
      {
        applications: [applicationDto], // ✅ Now this is ApplicationListDto[]
        pagination: PAGINATION_DEFAULTS.SINGLE_RESULT,
      }
    );
  } catch (error: unknown) {
    console.error("Approve application error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
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

    const application = await this.technicianRepository.findApplicationById(id);
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
        console.log("Technician not found by technicianId, trying by userId...");

        const technicianByUser = await this.technicianRepository.findTechnicianByUserId(
          application.technicianId.toString()
        );
        if (technicianByUser) {
          await this.technicianRepository.updateTechnicianStatus(
            technicianByUser._id.toString(),
            TECHNICIAN_STATUS.REJECTED
          );
        } else {
          console.log("Technician not found by userId either");
        }
      }
    } else {
      console.log("No technicianId found in application");
    }

    const updatedApplication = await this.technicianRepository.updateApplicationStatus(
      id,
      APPLICATION_STATUS.REJECTED,
      {
        rejectionReason,
        rejectedAt: new Date(),
      }
    );

    // ✅ FIX: Check if updatedApplication is null
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

    // ✅ FIX: Now updatedApplication is guaranteed to be non-null
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
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

    // ✅ FIX: Create application data with formatted documents
    const applicationData: ITechnicianApplication = {
      ...application.toObject(),
      _id: application._id as Types.ObjectId,
      technicianId: application.technicianId as Types.ObjectId,
      user,
      documents: formattedDocuments,
    } as ITechnicianApplication;

    // ✅ FIX: Map to DTO
    const applicationDto = ApplicationMapper.toDetailDto(applicationData);

    return ResponseHelper.success(
      TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_RETRIEVED,
      {
        applications: [applicationDto], // ✅ Now this is ApplicationDetailDto[]
        pagination: PAGINATION_DEFAULTS.SINGLE_RESULT,
      }
    );
  } catch (error: unknown) {
    console.error("Get application error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
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
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
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

    // ✅ FIX: Map to DTO
    const technicianDto = TechnicianMapper.toDetailDto(adminTechnician);

    return ResponseHelper.success(
      TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_BY_APPLICATION_RETRIEVED,
      {
        technicians: [technicianDto], // ✅ Now this is TechnicianDetailDto[]
        pagination: PAGINATION_DEFAULTS.SINGLE_RESULT,
      }
    );
  } catch (error: unknown) {
    console.error("Get technician by application error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return ResponseHelper.error(
      TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_TECHNICIAN_BY_APP
    );
  }
}
}