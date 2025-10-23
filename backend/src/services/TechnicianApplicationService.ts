import { Types } from "mongoose";
import {
  StartApplicationRequest,
  SaveStepRequest,
  SubmitApplicationRequest,
  ApplicationResponse,
} from "../interfaces/technician/ITechnicianApplication";
import { uploadToCloudinary } from "../utils/cloudinary";
import UserAddressSchema from "../models/UserAddressSchema";
import { ITechnicianDocument } from "../interfaces/technician/ITechnicianDocuments";
import { ITechnicianApplicationRepository } from "../interfaces/repository/technician/ITechnicianApplicationRepository";
import { FilesCollection, ITechnicianApplicationService, UploadedFile } from "../interfaces/services/technician/ITechnicianApplicationService";
import { ITechnicianRepository } from "../interfaces/repository/technician/ITechnicianRepository";
import { ITechnicianDocumentRepository } from "../interfaces/repository/technician/ITechnicianDocumentRepository";
import { IUserRepository } from "../interfaces/repository/user/IUserRepository";
import { ResponseHelper } from "../utils/responseHelper";
import {
  TECH_APPLICATION_MESSAGES,
  APPLICATION_STEPS,
  DOCUMENT_TYPES,
  REDIRECT_PATHS,
  REQUIRED_STEPS,
  STEP_MAPPING,
  APPLICATION_STATUS,
  USER_ROLES,
} from "../constants";
import { ITechnicianApplication } from "@/models/technician/TechnicianApplicationSchema";
import { DocumentsInfo, IdentityInfo, PersonalInfo, SkillsInfo, AvailabilityInfo, BankInfo } from "@/interfaces/technician/ITechnician";

// Interface definitions
interface AddressData {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

interface StepData {
  address?: string | AddressData;
  location?: IdentityInfo['location'];
  agreement?: string | boolean;
  governmentIdType?: string;
  governmentIdNumber?: string;
  idDocument?: string;
  verified?: boolean;
  verificationStatus?: "pending" | "approved" | "rejected";
  verifiedAt?: Date;
  [key: string]: unknown;
}

// Update DocumentData to match DocumentFile interface
interface DocumentData {
  url: string;
  publicId?: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedAt: Date;
  verified: boolean;
  uploadFailed?: boolean;
  error?: string;
}

// Update DocumentsCollection to be compatible with DocumentsInfo
type DocumentsCollection = {
  [K in keyof DocumentsInfo]?: DocumentData;
} & {
  [key: string]: DocumentData | undefined;
};

export class TechnicianApplicationService
  implements ITechnicianApplicationService
{
  private applicationRepository: ITechnicianApplicationRepository;
  private technicianRepository: ITechnicianRepository;
  private documentRepository: ITechnicianDocumentRepository;
  private userRepository: IUserRepository;

  constructor(
    applicationRepository: ITechnicianApplicationRepository,
    technicianRepository: ITechnicianRepository,
    documentRepository: ITechnicianDocumentRepository,
    userRepository: IUserRepository
  ) {
    this.applicationRepository = applicationRepository;
    this.technicianRepository = technicianRepository;
    this.documentRepository = documentRepository;
    this.userRepository = userRepository;
  }

  async startApplication(
    data: StartApplicationRequest
  ): Promise<ApplicationResponse> {
    try {
      const { email, userId } = data;

      const user = await this.userRepository.findById(userId);
      if (!user) {
        return ResponseHelper.notFound("User not found");
      }

      // Ensure the provided email matches the user's actual email
      if (user.email !== email) {
        return ResponseHelper.badRequest("Email must match your account email");
      }

      const existingUserApplication =
        await this.applicationRepository.findByTechnicianIdAndStatus(userId, [
          APPLICATION_STATUS.DRAFT,
          APPLICATION_STATUS.SUBMITTED,
          APPLICATION_STATUS.UNDER_REVIEW,
          APPLICATION_STATUS.APPROVED,
        ]);

      if (existingUserApplication) {
        const appStatus = existingUserApplication.status;

        // If application is submitted or under review, redirect to pending dashboard
        if (
          appStatus === APPLICATION_STATUS.SUBMITTED ||
          appStatus === APPLICATION_STATUS.UNDER_REVIEW
        ) {
          return ResponseHelper.success(
            TECH_APPLICATION_MESSAGES.APPLICATION_ALREADY_SUBMITTED,
            {
              data: {
                applicationId: existingUserApplication._id.toString(),
                redirectTo: REDIRECT_PATHS.PENDING_DASHBOARD,
              },
            }
          );
        }

        // If application is approved, redirect to technician dashboard
        if (appStatus === APPLICATION_STATUS.APPROVED) {
          return ResponseHelper.success(
            TECH_APPLICATION_MESSAGES.APPLICATION_ALREADY_APPROVED,
            {
              data: {
                applicationId: existingUserApplication._id.toString(),
                redirectTo: REDIRECT_PATHS.TECHNICIAN_DASHBOARD,
              },
            }
          );
        }

        // Allow DRAFT applications to be edited
        if (appStatus === APPLICATION_STATUS.DRAFT) {
          return ResponseHelper.success(
            TECH_APPLICATION_MESSAGES.DRAFT_APPLICATION_FOUND,
            {
              data: {
                applicationId: existingUserApplication._id.toString(),
                redirectTo: null,
              },
            }
          );
        }
      }

      const existingEmailApplication =
        await this.applicationRepository.findByEmailAndStatus(email, [
          APPLICATION_STATUS.DRAFT,
          APPLICATION_STATUS.SUBMITTED,
          APPLICATION_STATUS.UNDER_REVIEW,
          APPLICATION_STATUS.APPROVED,
        ]);

      if (existingEmailApplication) {
        const existingAppTechnicianId =
          existingEmailApplication.technicianId?.toString();

        // Email already used by someone else in an active application
        if (existingAppTechnicianId && existingAppTechnicianId !== userId) {
          return ResponseHelper.conflict(
            TECH_APPLICATION_MESSAGES.EMAIL_ALREADY_IN_USE
          );
        }
      }

      // Create new application with proper typing
      const applicationData: Partial<ITechnicianApplication> = {
        email: email.toLowerCase().trim(),
        technicianId: new Types.ObjectId(userId),
        status: APPLICATION_STATUS.DRAFT,
        stepsCompleted: [],
        personal: {} as PersonalInfo,
        identity: {} as IdentityInfo,
        skills: {} as SkillsInfo,
        availability: {} as AvailabilityInfo,
        bank: {} as BankInfo,
        documents: {} as DocumentsInfo,
        agreement: false,
      };

      const application = await this.applicationRepository.create(applicationData);

      return ResponseHelper.success(
        TECH_APPLICATION_MESSAGES.APPLICATION_STARTED,
        {
          data: {
            applicationId: application._id.toString(),
            redirectTo: null,
          },
        }
      );
    } catch (error: unknown) {
      console.error("Start application error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECH_APPLICATION_MESSAGES.FAILED_TO_START_APPLICATION
      );
    }
  }

  async saveStep(
    data: SaveStepRequest,
    files?: FilesCollection
  ): Promise<ApplicationResponse> {
    try {
      const { applicationId, step, ...stepData } = data;

      if (!applicationId || !step) {
        return ResponseHelper.badRequest(
          TECH_APPLICATION_MESSAGES.APPLICATION_ID_AND_STEP_REQUIRED
        );
      }

      const application = await this.applicationRepository.findById(applicationId);
      if (!application) {
        return ResponseHelper.notFound(
          TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND
        );
      }

      const processedStepData: StepData = { ...stepData };

      // Parse JSON fields
      const jsonFields = [
        "availability",
        "services",
        "languages",
        "serviceAreas",
      ];
      jsonFields.forEach((field) => {
        if (
          processedStepData[field] &&
          typeof processedStepData[field] === "string"
        ) {
          try {
            processedStepData[field] = JSON.parse(processedStepData[field] as string);
          } catch (e) {
            // Keep original value if parsing fails
            console.warn(`Failed to parse ${field} as JSON`);
          }
        }
      });

      if (step === APPLICATION_STEPS.IDENTITY_VERIFICATION) {
        await this.handleIdentityVerificationStep(
          application,
          processedStepData
        );
      } else if (step === APPLICATION_STEPS.DOCUMENTS) {
        await this.handleDocumentsStep(application, files);
      } else if (step === APPLICATION_STEPS.AGREEMENT_CONSENT) {
        await this.handleAgreementStep(application, processedStepData);
      } else if (step === APPLICATION_STEPS.REVIEW_SUBMIT) {
        await this.handleReviewStep(application);
      } else {
        await this.handleGenericStep(application, step, processedStepData);
      }

      // Mark step as completed if not already
      if (!application.stepsCompleted.includes(step)) {
        application.stepsCompleted.push(step);
      }

      await this.applicationRepository.save(application);

      return ResponseHelper.success(TECH_APPLICATION_MESSAGES.STEP_SAVED, {
        data: {
          application: {
            _id: application._id,
            stepsCompleted: application.stepsCompleted,
          },
        },
      });
    } catch (error: unknown) {
      console.error("Save step error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECH_APPLICATION_MESSAGES.FAILED_TO_SAVE_STEP
      );
    }
  }

  private async handleIdentityVerificationStep(
    application: ITechnicianApplication,
    stepData: StepData
  ): Promise<void> {
    // Save address to UserAddress collection
    if (stepData.address || stepData.location) {
      try {
        let addressData: string | AddressData | undefined = stepData.address;
        let locationData = stepData.location;

        if (typeof addressData === "string") {
          try {
            addressData = JSON.parse(addressData) as AddressData;
          } catch (e) {
            console.error("Could not parse address as JSON");
          }
        }

        if (typeof addressData === "object" && addressData.street) {
          const userAddress = new UserAddressSchema({
            userId: application.technicianId,
            label: "Home",
            street: addressData.street || "",
            city: addressData.city || "",
            state: addressData.state || "",
            pincode: addressData.pincode || "",
            landmark: addressData.landmark || "",
            isDefault: true,
            location: {
              type: "Point",
              coordinates: locationData?.coordinates || [0, 0],
            },
            formattedAddress: locationData?.formattedAddress || "",
            placeId: locationData?.placeId || "",
          });

          await userAddress.save();
        }
      } catch (error: unknown) {
        console.error("Error saving to UserAddress:", error);
      }
    }

    // Use type assertion for Mongoose document operations
    const app = application as any;
    if (!app.identity) {
      app.identity = {};
    }

    // Create update data with proper typing
    const updateData: Partial<IdentityInfo> = {
      ...app.identity,
      ...stepData,
    };

    app.identity = updateData;
  }

  private async handleDocumentsStep(
    application: ITechnicianApplication,
    files?: FilesCollection
  ): Promise<void> {
    const app = application as any;
    
    if (!app.documents) {
      app.documents = {};
    }

    const documents: DocumentsCollection = app.documents;
    const documentFields = [
      DOCUMENT_TYPES.ID_PROOF,
      DOCUMENT_TYPES.ADDRESS_PROOF,
      DOCUMENT_TYPES.POLICE_VERIFICATION,
      DOCUMENT_TYPES.PASSPORT_PHOTO,
      DOCUMENT_TYPES.PROFILE_PHOTO,
      DOCUMENT_TYPES.TRADE_LICENSE,
    ];

    for (const field of documentFields) {
      if (files && files[field]) {
        const file = files[field];

        try {
          let fileToUpload: UploadedFile;
          if (Array.isArray(file)) {
            fileToUpload = file[0];
          } else {
            fileToUpload = file;
          }

          // Convert UploadedFile to Express.Multer.File for uploadToCloudinary
          const fileForUpload: Express.Multer.File = {
            fieldname: fileToUpload.fieldname || field,
            originalname: fileToUpload.originalname,
            encoding: fileToUpload.encoding,
            mimetype: fileToUpload.mimetype,
            size: fileToUpload.size,
            stream: fileToUpload.stream as any,
            destination: fileToUpload.destination || '',
            filename: fileToUpload.filename || fileToUpload.originalname,
            path: fileToUpload.path || '',
            buffer: fileToUpload.buffer || Buffer.from(''),
          };

          const uploadResult = await uploadToCloudinary(fileForUpload);

          if (uploadResult && uploadResult.secure_url) {
            documents[field] = {
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
              filename: fileToUpload.originalname,
              mimetype: fileToUpload.mimetype,
              size: fileToUpload.size,
              uploadedAt: new Date(),
              verified: false,
              uploadFailed: false,
            };

            await this.documentRepository.create({
              technicianId: application.technicianId!,
              applicationId: application._id,
              type: this.mapDocumentType(field),
              fileUrl: uploadResult.secure_url,
              status: "pending",
              uploadedAt: new Date(),
              metadata: {
                originalName: fileToUpload.originalname,
                mimetype: fileToUpload.mimetype,
                size: fileToUpload.size,
                fieldName: field,
              },
            });
          } else {
            console.error(`Cloudinary returned no secure_url for ${field}`);
            documents[field] = {
              url: "",
              filename: fileToUpload.originalname,
              mimetype: fileToUpload.mimetype,
              size: fileToUpload.size,
              uploadedAt: new Date(),
              uploadFailed: true,
              error: TECH_APPLICATION_MESSAGES.CLOUDINARY_UPLOAD_FAILED,
              verified: false,
            };
          }
        } catch (uploadError: unknown) {
          console.error(`Error uploading ${field}:`, uploadError);
          let errorMessage = "Unknown upload error";
          if (uploadError instanceof Error) {
            errorMessage = uploadError.message;
          } else if (typeof uploadError === "string") {
            errorMessage = uploadError;
          } else if (uploadError && typeof uploadError === "object") {
            errorMessage = JSON.stringify(uploadError);
          }

          const fileToUpload: UploadedFile = Array.isArray(file) ? file[0] : file;
          documents[field] = {
            url: "",
            filename: fileToUpload.originalname,
            mimetype: fileToUpload.mimetype,
            size: fileToUpload.size,
            uploadedAt: new Date(),
            uploadFailed: true,
            error: errorMessage,
            verified: false,
          };
        }
      }
    }

    app.documents = documents;
  }

  private mapDocumentType(field: string): ITechnicianDocument["type"] {
    const mapping: Record<string, ITechnicianDocument["type"]> = {
      idProof: "idProof",
      addressProof: "addressProof",
      policeVerification: "policeVerification",
      passportPhoto: "other",
      profilePhoto: "other",
      tradeLicense: "tradeLicense",
    };
    return mapping[field] || "other";
  }

  private async handleAgreementStep(
    application: ITechnicianApplication,
    stepData: StepData
  ): Promise<void> {
    if (stepData.agreement !== undefined) {
      const agreementValue =
        stepData.agreement === "true" || stepData.agreement === true;
      (application as any).agreement = agreementValue;
    }
  }

  private async handleReviewStep(application: ITechnicianApplication): Promise<void> {
    // No specific data processing for review step, just mark as completed
  }

  private async handleGenericStep(
    application: ITechnicianApplication,
    step: string,
    stepData: StepData
  ): Promise<void> {
    const stepMapping: Record<string, string> = STEP_MAPPING;

    const applicationField = stepMapping[step];
    if (applicationField) {
      const app = application as any;
      const currentData = app[applicationField] || {};
      const newData = {
        ...currentData,
        ...stepData,
      };
      app[applicationField] = newData;
    }
  }

  async getApplication(applicationId: string): Promise<ApplicationResponse> {
    try {
      if (
        !applicationId ||
        applicationId === "undefined" ||
        applicationId === "null"
      ) {
        return ResponseHelper.badRequest("Invalid application ID");
      }

      if (!Types.ObjectId.isValid(applicationId)) {
        return ResponseHelper.badRequest("Invalid application ID format");
      }

      const application = await this.applicationRepository.findById(applicationId);
      if (!application) {
        return ResponseHelper.notFound(
          TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND
        );
      }

      const applicationData = {
        _id: application._id,
        email: application.email,
        status: application.status,
        stepsCompleted: application.stepsCompleted,
        personal: application.personal || {},
        identity: application.identity || {},
        skills: application.skills || {},
        availability: application.availability || {},
        bank: application.bank || {},
        documents: application.documents || {},
        agreement: application.agreement,
        submittedAt: application.submittedAt,
        reviewNotes: application.reviewNotes,
        rejectionReason: application.rejectionReason,
        rejectedAt: application.rejectedAt,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
      };

      return ResponseHelper.success(
        TECH_APPLICATION_MESSAGES.APPLICATION_RETRIEVED,
        {
          data: { application: applicationData },
        }
      );
    } catch (error: unknown) {
      console.error("Get application error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECH_APPLICATION_MESSAGES.FAILED_TO_RETRIEVE_APPLICATION
      );
    }
  }

  async submitApplication(
    applicationId: string,
    userId: string
  ): Promise<ApplicationResponse> {
    try {
      const application = await this.applicationRepository.findById(applicationId);
      if (!application) {
        return ResponseHelper.notFound(
          TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND
        );
      }

      let languagesArray: string[] = [];

      const skillsLanguages = application.skills?.languages as unknown;

      if (Array.isArray(skillsLanguages)) {
        languagesArray = (skillsLanguages as string[]).filter(
        (lang) => lang && String(lang).trim() !== ""
      );
      } else if (
        skillsLanguages &&
      typeof skillsLanguages === "string" &&
      skillsLanguages.trim() !== ""
      ) {
        try {
          const parsed = JSON.parse(skillsLanguages);
          if (Array.isArray(parsed)) {
            languagesArray = parsed.filter(
              (lang: string) => lang && String(lang).trim() !== ""
            );
          }
        } catch (e) {
          // If not JSON, split by comma
          languagesArray = skillsLanguages
            .split(",")
            .map((lang: string) => lang.trim())
            .filter((lang: string) => lang !== "");
        }
      }

      // Ownership validation
      if (
        !application.technicianId ||
        application.technicianId.toString() !== userId
      ) {
        return ResponseHelper.forbidden(
          TECH_APPLICATION_MESSAGES.ACCESS_DENIED
        );
      }

      if (application.status !== APPLICATION_STATUS.DRAFT) {
        return ResponseHelper.badRequest(
          TECH_APPLICATION_MESSAGES.APPLICATION_ALREADY_SUBMITTED
        );
      }

      // Validate all required steps are completed
      const requiredSteps = REQUIRED_STEPS;

      const missingSteps = requiredSteps.filter(
        (step) => !application.stepsCompleted.includes(step)
      );

      if (missingSteps.length > 0) {
        return ResponseHelper.unProcessableEntity(
          TECH_APPLICATION_MESSAGES.COMPLETE_ALL_STEPS_REQUIRED,
          {
            missingSteps,
          }
        );
      }

      const existingSubmittedApp =
        await this.applicationRepository.findByTechnicianIdAndStatus(userId, [
          APPLICATION_STATUS.SUBMITTED,
          APPLICATION_STATUS.UNDER_REVIEW,
        ]);

      if (
        existingSubmittedApp &&
        existingSubmittedApp._id.toString() !== applicationId
      ) {
        return ResponseHelper.badRequest(
          "You already have an application in review. Please wait for it to be processed."
        );
      }

      // Update user
      const user = await this.userRepository.updateApplicationStatus(
        userId,
        APPLICATION_STATUS.SUBMITTED
      );
      if (!user) {
        return ResponseHelper.notFound(
          TECH_APPLICATION_MESSAGES.USER_NOT_FOUND
        );
      }

      // Update user email if different
      if (application.email && user.email !== application.email) {
        await this.userRepository.update(userId, { email: application.email });
      }

      // Create or update technician record
      let technician = await this.technicianRepository.findByUserId(userId);

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

      if (!technician) {
        technician = await this.technicianRepository.create({
          userId: new Types.ObjectId(userId),
          displayName: (application.personal?.fullName as string) || USER_ROLES.TECHNICIAN,
          bio: (application.skills?.bio as string) || "",
          experienceYears: parseInt(application.skills?.yearsOfExperience as string) || 0,
          services: application.skills?.services as string[] || [],
          serviceRates: {},
          workAreas: application.skills?.serviceAreas as string[] || [],
          serviceRadiusKm: parseInt(application.skills?.workRadius as string) || 10,
          currentLocation: {
            type: "Point",
            coordinates: [0, 0],
          },
          averageRating: 0,
          ratingCount: 0,
          status: APPLICATION_STATUS.SUBMITTED,
          profilePictureUrl: (application.documents?.passportPhoto?.url as string) || "",
          personalInfo: {
            fullName: (application.personal?.fullName as string) || "",
            gender: (application.personal?.gender as string) || "",
            phoneNumber: (application.personal?.phoneNumber as string) || "",
            dateOfBirth: (application.personal?.dateOfBirth as string) || "",
            languages: languagesArray,
            address: addressData,
          },
        });
      } else {
        await this.technicianRepository.updateByUserId(userId, {
          displayName: (application.personal?.fullName as string) || technician.displayName,
          bio: (application.skills?.bio as string) || technician.bio,
          experienceYears:
            parseInt(application.skills?.yearsOfExperience as string) ||
            technician.experienceYears,
          services: (application.skills?.services as string[]) || technician.services,
          workAreas: (application.skills?.serviceAreas as string[]) || technician.workAreas,
          serviceRadiusKm:
            parseInt(application.skills?.workRadius as string) ||
            technician.serviceRadiusKm,
          profilePictureUrl:
            (application.documents?.passportPhoto?.url as string) ||
            technician.profilePictureUrl,
          status: APPLICATION_STATUS.SUBMITTED,
          personalInfo: {
            ...technician.personalInfo,
            fullName:
              (application.personal?.fullName as string) ||
              technician.personalInfo?.fullName ||
              "",
            gender:
              (application.personal?.gender as string) ||
              technician.personalInfo?.gender ||
              "",
            phoneNumber:
              (application.personal?.phoneNumber as string) ||
              technician.personalInfo?.phoneNumber ||
              "",
            dateOfBirth:
              (application.personal?.dateOfBirth as string) ||
              technician.personalInfo?.dateOfBirth ||
              "",
            languages: languagesArray,
            address: addressData,
          },
        });
      }

      // Update application status
      await this.applicationRepository.update(applicationId, {
        status: APPLICATION_STATUS.SUBMITTED,
        submittedAt: new Date(),
      });

      return ResponseHelper.success(
        TECH_APPLICATION_MESSAGES.APPLICATION_SUBMITTED,
        {
          data: {
            applicationId: application._id.toString(),
          },
        }
      );
    } catch (error: unknown) {
      console.error("Submit application error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.badRequest(
        TECH_APPLICATION_MESSAGES.FAILED_TO_SUBMIT_APPLICATION
      );
    }
  }

  async getApplicationStatus(
    applicationId: string
  ): Promise<ApplicationResponse> {
    try {
      const application = await this.applicationRepository.findById(applicationId);
      if (!application) {
        return ResponseHelper.notFound(
          TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND
        );
      }

      const applicationData = {
        ...application.toObject(),
        documents: application.documents || {},
      };

      return ResponseHelper.success(
        TECH_APPLICATION_MESSAGES.APPLICATION_STATUS_RETRIEVED,
        {
          data: { application: applicationData },
        }
      );
    } catch (error: unknown) {
      console.error("Get application status error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECH_APPLICATION_MESSAGES.FAILED_TO_GET_STATUS
      );
    }
  }

  async getUserApplications(userId: string): Promise<ApplicationResponse> {
    try {
      const applications = await this.applicationRepository.findByTechnicianId(
        userId
      );

      return ResponseHelper.success(
        TECH_APPLICATION_MESSAGES.USER_APPLICATIONS_RETRIEVED,
        {
          data: { applications },
        }
      );
    } catch (error: unknown) {
      console.error("Get user applications error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECH_APPLICATION_MESSAGES.FAILED_TO_RETRIEVE_APPLICATION
      );
    }
  }

  async resubmitApplication(
    applicationId: string,
    userId: string
  ): Promise<ApplicationResponse> {
    try {
      const application = await this.applicationRepository.findById(applicationId);
      if (!application) {
        return ResponseHelper.notFound(
          TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND
        );
      }

      // Ownership validation
      if (!application.technicianId) {
        return ResponseHelper.badRequest(
          TECH_APPLICATION_MESSAGES.NO_TECHNICIAN_ASSIGNED
        );
      }

      if (application.technicianId.toString() !== userId) {
        return ResponseHelper.forbidden(
          TECH_APPLICATION_MESSAGES.ACCESS_DENIED
        );
      }

      // Check if application is rejected
      if (application.status !== APPLICATION_STATUS.REJECTED) {
        return ResponseHelper.badRequest(
          TECH_APPLICATION_MESSAGES.ONLY_REJECTED_CAN_RESUBMIT
        );
      }

      // Update application status and clear rejection details
      application.status = APPLICATION_STATUS.SUBMITTED;
      application.rejectionReason = undefined;
      application.reviewNotes = undefined;
      application.resubmittedCount = (application.resubmittedCount || 0) + 1;
      application.lastSubmittedAt = new Date();
      application.updatedAt = new Date();

      await this.applicationRepository.save(application);

      const technician = await this.technicianRepository.findByUserId(userId);
      if (technician) {
        await this.technicianRepository.updateByUserId(userId, {
          status: APPLICATION_STATUS.SUBMITTED,
        });
      }

      return ResponseHelper.success(
        TECH_APPLICATION_MESSAGES.APPLICATION_RESUBMITTED,
        {
          data: {
            applicationId: application._id.toString(),
          },
        }
      );
    } catch (error: unknown) {
      console.error("Resubmit application error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECH_APPLICATION_MESSAGES.FAILED_TO_RESUBMIT_APPLICATION
      );
    }
  }

  async startNewApplicationAfterRejection(
    userId: string,
    email: string
  ): Promise<ApplicationResponse> {
    try {
      // Find the rejected application
      const rejectedApplication =
        await this.applicationRepository.findByTechnicianIdAndStatus(userId, [
          APPLICATION_STATUS.REJECTED,
        ]);

      if (!rejectedApplication) {
        return ResponseHelper.notFound(
          TECH_APPLICATION_MESSAGES.NO_REJECTED_APPLICATION_FOUND
        );
      }

      const newApplication = await this.applicationRepository.create({
        email: email.toLowerCase().trim(),
        technicianId: new Types.ObjectId(userId),
        status: APPLICATION_STATUS.DRAFT,
        stepsCompleted: [],

        personal: {
          email: email.toLowerCase().trim(),
        } as PersonalInfo,
        identity: {} as IdentityInfo,
        skills: {} as SkillsInfo,
        availability: {} as AvailabilityInfo,
        bank: {} as BankInfo,

        documents: rejectedApplication.documents || {} as DocumentsInfo,

        agreement: false,
        previousApplicationId: rejectedApplication._id,
        resubmittedCount: (rejectedApplication.resubmittedCount || 0) + 1,
      } as Partial<ITechnicianApplication>);

      return ResponseHelper.success(
        TECH_APPLICATION_MESSAGES.NEW_APPLICATION_STARTED,
        {
          data: {
            applicationId: newApplication._id.toString(),
            redirectTo: null,
            isFreshStart: true,
          },
        }
      );
    } catch (error: unknown) {
      console.error("Start new application after rejection error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECH_APPLICATION_MESSAGES.FAILED_TO_START_NEW_APPLICATION
      );
    }
  }
}