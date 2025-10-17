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

export class TechnicianManagementService implements ITechnicianManagementService {
  private technicianRepository: ITechnicianManagementRepository;

  constructor(technicianRepository: ITechnicianManagementRepository) {
    this.technicianRepository = technicianRepository;
  }

  // Helper function to format documents from TechnicianApplication.documents
  private formatApplicationDocuments(documents: any) {
    if (!documents) return {};

    const formatted: any = {};

    // Map the actual document structure
    Object.keys(documents).forEach((key) => {
      const doc = documents[key];
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
    filters: TechnicianFilters
  ): Promise<TechnicianListResponse> {
    try {
      const {
        status,
        service,
        rating,
        location,
        search,
        page = 1,
        limit = 10,
      } = filters;

      // Build filter object
      const filter: any = {};

      // Status filter
      if (status && status !== "all") {
        // Map frontend status to database status
        const statusMap: Record<string, string> = {
          active: "approved",
          pending: "pending",
          suspended: "suspended",
          rejected: "rejected",
        };

        const dbStatus = statusMap[status] || status;
        filter.status = dbStatus;
      } else {
        filter.status = { $in: ["approved", "suspended", "rejected"] };
      }

      // Service filter
      if (service && service !== "All Services") {
        filter.services = service;
      }

      // Rating filter
      if (rating && rating !== "All Ratings") {
        const ratingMap: any = {
          "5 Star": { $gte: 4.8 },
          "4+ Star": { $gte: 4.0 },
          "3+ Star": { $gte: 3.0 },
        };
        filter.averageRating = ratingMap[rating as string];
      }

      // Search filter
      if (search) {
        const searchRegex = new RegExp(search as string, "i");
        filter.$or = [
          { displayName: searchRegex },
          { "user.email": searchRegex },
          { "user.phone": searchRegex },
          { workAreas: { $in: [searchRegex] } },
        ];
      }

      // Location filter
      if (location && location !== "All Locations") {
        filter.workAreas = { $in: [new RegExp(location as string, "i")] };
      }

      const pageNum = parseInt(page as any);
      const limitNum = parseInt(limit as any);
      const skip = (pageNum - 1) * limitNum;

      // Get technicians with user data populated
      const technicians = await this.technicianRepository.findAllTechnicians(
        filter,
        skip,
        limitNum
      );
      const total = await this.technicianRepository.countTechnicians(filter);

      // Format the response with proper typing
      const adminTechnicians: IAdminTechnician[] = await Promise.all(
        technicians.map(async (tech: ITechnician) => {
          return await this.convertToAdminTechnician(tech);
        })
      );

      return ResponseHelper.success("Technicians retrieved successfully", {
          technicians: adminTechnicians,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
      })
    } catch (error) {
      console.error("Get technicians error:", error);
      return ResponseHelper.error("Failed to fetch technicians")
    }
  }

  async getTechnicianById(id: string): Promise<SingleTechnicianResponse> {
    try {
      const technician = await this.technicianRepository.findTechnicianById(id);

      if (!technician) {
        return ResponseHelper.notFound("Technician not found")
      }

      const adminTechnician = await this.convertToAdminTechnician(technician);

      return ResponseHelper.success("Technician retrieved successfully", {
          technician: adminTechnician,
      })
    } catch (error) {
      console.error("Get technician error:", error);
      return ResponseHelper.error("Failed to fetch technician")
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
      application?: any
    ): "pending" | "approved" | "rejected" | "suspended" => {
      if (
        application &&
        ["submitted", "under_review", "pending"].includes(application.status)
      ) {
        return "pending";
      }
      switch (status) {
        case "submitted":
        case "under_review":
        case "pending":
          return "pending";
        case "approved":
        case "active":
          return "approved";
        case "rejected":
          return "rejected";
        case "suspended":
        case "blocked":
          return "suspended";
        default:
          console.warn("Unknown technician status:", status);
          return status as "pending" | "approved" | "rejected" | "suspended";
      }
    };
    const status = mapStatus(technician.status, application);

    const getPersonalInfo = (
      technician: ITechnician,
      application?: any,
      userAddress?: any
    ) => {
      const hasRealTechnicianData =
        technician.personalInfo &&
        (technician.personalInfo.gender !== "Not specified" ||
          technician.personalInfo.phoneNumber !== "Not provided" ||
          technician.personalInfo.dateOfBirth !== "Not specified");

      let personalInfo: any;

      if (hasRealTechnicianData) {
        personalInfo = {
          fullName: technician.personalInfo?.fullName || technician.displayName,
          gender: technician.personalInfo?.gender,
          phoneNumber: technician.personalInfo?.phoneNumber || technician.phone,
          dateOfBirth: technician.personalInfo?.dateOfBirth,
          languages: technician.personalInfo?.languages || [],
        };
      } else if (application?.personal) {
        const appPersonal = application.personal;
        personalInfo = {
          fullName: appPersonal.fullName || technician.displayName,
          gender: appPersonal.gender || "Not specified",
          phoneNumber:
            appPersonal.phoneNumber || technician.phone || "Not provided",
          dateOfBirth: appPersonal.dateOfBirth || "Not specified",
          languages: appPersonal.languages || [],
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
      } else if (application?.personal?.address) {
        personalInfo.address = {
          street: application.personal.address.street || "Not specified",
          city: application.personal.address.city || "Not specified",
          state: application.personal.address.state || "Not specified",
          pincode: application.personal.address.pincode || "Not specified",
        };
      } else {
        personalInfo.address = undefined;
      }

      return personalInfo;
    };

    const personalInfo = getPersonalInfo(technician, application, userAddress);

    const getDocuments = (technician: ITechnician, application?: any) => {
      if (application?.documents) {
        const formattedDocs = this.formatApplicationDocuments(
          application.documents
        );
        return formattedDocs;
      }

      // Fallback for profile picture
      const fallbackDocs: any = {};
      if (technician.profilePictureUrl) {
        fallbackDocs.profilePhoto = {
          url: technician.profilePictureUrl,
          verified: true,
          type: "profilePhoto",
        };
      }

      return fallbackDocs;
    };

    // Format documents
    const documents = getDocuments(technician, application);

    // Create the admin technician view
    const adminTechnician: IAdminTechnician = {
      _id: technician._id,
      userId: technician.userId,
      displayName: technician.displayName,
      email: user?.email || "",
      phone: user?.phone || technician.phone || "",
      services: technician.services,
      experienceYears: technician.experienceYears,
      workAreas: technician.workAreas,
      serviceRadiusKm: technician.serviceRadiusKm,
      status: status,
      averageRating: technician.averageRating,
      ratingCount: technician.ratingCount,
      totalJobs: 0,
      completedJobs: 0,
      ongoingJobs: 0,
      totalEarnings: 0,
      profilePictureUrl: technician.profilePictureUrl,
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
    statusData: UpdateStatusRequest
  ): Promise<SingleTechnicianResponse> {
    try {
      const { status, emailNotification = true, reason } = statusData;

      if (!status || !["approved", "suspended", "rejected"].includes(status)) {
        return ResponseHelper.badRequest("Valid status is required (approved, suspended, rejected)")
      }

      // Prepare update data
      const updateData: any = {};

      // Store suspension/rejection reason and timestamp
      if (status === "suspended" || status === "rejected") {
        updateData.suspensionReason = reason;
        updateData.suspendedAt = new Date();
      } else if (status === "approved") {
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
        return ResponseHelper.notFound("Technician not found")
      }

      // Get user data for email
      const user = await this.technicianRepository.findUserById(
        technician.userId as Types.ObjectId
      );

      let emailSent = false;
      let emailMessage = "";

      // Send email notification if requested and user email exists
      if (emailNotification && user?.email) {
        if (status === "approved") {
          emailSent = await emailService.sendApplicationApprovalEmail(
            user.email,
            technician.displayName
          );
          emailMessage = emailSent
            ? " and approval email sent to technician"
            : " but failed to send email notification";

          await this.technicianRepository.updateApplicationStatus(
            id,
            "approved"
          );
        } else {
          emailSent = await emailService.sendStatusUpdateEmail(
            user.email,
            technician.displayName,
            status,
            reason
          );
          emailMessage = emailSent
            ? ` and ${status} notification email sent to technician`
            : ` but failed to send email notification`;
        }
      }

      const adminTechnician = await this.convertToAdminTechnician(technician);

      return ResponseHelper.success(`Technician status updated to ${status}${emailMessage}`, {
          technician: adminTechnician,
      })
    } catch (error) {
      console.error("Update technician status error:", error);
      return ResponseHelper.error("Failed to update technician status")
    }
  }

  async getTechnicianStats(): Promise<TechnicianStatsResponse> {
    try {
      const stats = await this.technicianRepository.getTechnicianStats();

      return ResponseHelper.success("Technician statistics retrieved successfully", stats)
    } catch (error) {
      console.error("Get technician stats error:", error);
      return ResponseHelper.error("Failed to fetch technician statistics")
    }
  }

  async getPendingApplications(
    filters: ApplicationFilters
  ): Promise<ApplicationListResponse> {
    try {
      const {
        status = "submitted,under_review",
        search,
        service,
        page = 1,
        limit = 10,
      } = filters;

      // Build filter object
      const filter: any = {
        status: { $in: (status as string).split(",") },
      };

      // Search filter
      if (search) {
        const searchRegex = new RegExp(search as string, "i");
        filter.$or = [
          { "personal.fullName": searchRegex },
          { email: searchRegex },
          { "personal.phoneNumber": searchRegex },
        ];
      }

      // Service filter
      if (service && service !== "All Services") {
        filter["skills.services"] = service;
      }

      const pageNum = parseInt(page as any);
      const limitNum = parseInt(limit as any);
      const skip = (pageNum - 1) * limitNum;

      const applications = await this.technicianRepository.findAllApplications(
        filter,
        skip,
        limitNum
      );
      const total = await this.technicianRepository.countApplications(filter);

      return ResponseHelper.success("Pending applications retrieved successfully", {
          applications: applications as ITechnicianApplication[],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
          },
      })
    } catch (error) {
      console.error("Get pending applications error:", error);
      return ResponseHelper.error("Failed to fetch pending applications")
    }
  }

  async approveApplication(id: string): Promise<ApplicationListResponse> {
    try {
      const application = await this.technicianRepository.findApplicationById(
        id
      );
      if (!application) {
        return ResponseHelper.notFound("Application not found")
      }

      // Update application status
      const updatedApplication =
        await this.technicianRepository.updateApplicationStatus(id, "approved");

      if (!updatedApplication) {
        return ResponseHelper.badRequest("Failed to update application")
      }

      // Update user's application status
      await this.technicianRepository.updateUserApplicationStatus(
        application.technicianId as Types.ObjectId,
        "approved"
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
          ? " and approval email sent to technician"
          : " but failed to send email notification";
      }

      // In approveApplication method, after creating/updating technician:
      if (application.bank && technician) {
        const bankData = application.bank;
        await this.technicianRepository.updateTechnicianPaymentDetails(
          technician._id.toString(),
          {
            bankAccount: {
              holderName: bankData.accountHolderName,
              accountNumber: bankData.accountNumber,
              ifscCode: bankData.ifscCode,
              bankName: bankData.bankName,
            },
            upiId: bankData.upiId,
            withdrawalPreference: bankData.withdrawalPreference || 'auto'
          }
        );
      }

      return ResponseHelper.success(`Application approved successfully${emailMessage}`, {
          applications: [updatedApplication as ITechnicianApplication],
          pagination: {
            page: 1,
            limit: 1,
            total: 1,
            pages: 1,
          },
      })
    } catch (error) {
      console.error("Approve application error:", error);
      return ResponseHelper.error("Failed to approve application")
    }
  }

  async rejectApplication(
    id: string,
    rejectData: RejectApplicationRequest
  ): Promise<ApplicationListResponse> {
    try {
      const { rejectionReason, emailNotification = true } = rejectData;

      const application = await this.technicianRepository.findApplicationById(
        id
      );
      if (!application) {
        return ResponseHelper.notFound("Application not found")
      }

      if (application.technicianId) {
        //Find by technicianId (from application)
        const technician = await this.technicianRepository.findTechnicianById(
          application.technicianId.toString()
        );

        if (technician) {
          const updatedTechnician =
            await this.technicianRepository.updateTechnicianStatus(
              application.technicianId.toString(),
              "rejected"
            );
        } else {
          console.log(
            "Technician not found by technicianId, trying by userId..."
          );

          // Find by userId as fallback
          const technicianByUser =
            await this.technicianRepository.findTechnicianByUserId(
              application.technicianId.toString()
            );
          if (technicianByUser) {
            const updatedTechnician =
              await this.technicianRepository.updateTechnicianStatus(
                technicianByUser._id.toString(),
                "rejected"
              );
          } else {
            console.log("Technician not found by userId either");
          }
        }
      } else {
        console.log("No technicianId found in application");
      }

      const updatedApplication =
        await this.technicianRepository.updateApplicationStatus(
          id,
          "rejected",
          {
            rejectionReason,
            rejectedAt: new Date(),
          }
        );

      await this.technicianRepository.updateUserApplicationStatus(
        application.technicianId as Types.ObjectId,
        "rejected"
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
          ? " and rejection email sent to applicant"
          : " but failed to send email notification";
      }

      return ResponseHelper.success(`Application rejected successfully${emailMessage}`, {
          applications: [updatedApplication as ITechnicianApplication],
          pagination: {
            page: 1,
            limit: 1,
            total: 1,
            pages: 1,
          },
      })
    } catch (error) {
      console.error("Reject application error:", error);
      return ResponseHelper.error("Failed to reject application")
    }
  }

  async getApplicationById(id: string): Promise<ApplicationListResponse> {
    try {
      const application = await this.technicianRepository.findApplicationById(
        id
      );
      if (!application) {
        return ResponseHelper.notFound("Application not found")
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

      return ResponseHelper.success("Application retrieved successfully", {
          applications: [applicationData],
          pagination: {
            page: 1,
            limit: 1,
            total: 1,
            pages: 1,
          },
      })
    } catch (error) {
      console.error("Get application error:", error);
      return ResponseHelper.error("Failed to fetch application")
    }
  }

  async getApplicationStats(): Promise<ApplicationStatsResponse> {
    try {
      const stats = await this.technicianRepository.getApplicationStats();

      return ResponseHelper.success("Application statistics retrieved successfully", stats)
    } catch (error) {
      console.error("Get application stats error:", error);
      return ResponseHelper.error("Failed to fetch application statistics")
    }
  }

  async getTechnicianByApplicationId(
    applicationId: string
  ): Promise<TechnicianListResponse> {
    try {
      const technician =
        await this.technicianRepository.findTechnicianByApplicationId(
          applicationId
        );

      if (!technician) {
        return ResponseHelper.notFound("Technician not found for this application")
      }

      const adminTechnician = await this.convertToAdminTechnician(technician);

      return ResponseHelper.success("Technician retrieved successfully", {
          technicians: [adminTechnician],
          pagination: {
            page: 1,
            limit: 1,
            total: 1,
            pages: 1,
          },
      })
    } catch (error) {
      console.error("Get technician by application error:", error);
      return ResponseHelper.error("Failed to fetch technician")
    }
  }
}
