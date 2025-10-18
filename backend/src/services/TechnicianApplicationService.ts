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
import { ITechnicianApplicationService } from "../interfaces/services/technician/ITechnicianApplicationService";
import { ITechnicianRepository } from "../interfaces/repository/technician/ITechnicianRepository";
import { ITechnicianDocumentRepository } from "../interfaces/repository/technician/ITechnicianDocumentRepository";
import { IUserRepository } from "../interfaces/repository/user/IUserRepository";
import { ResponseHelper } from "../utils/responseHelper";
import { TECH_APPLICATION_MESSAGES, APPLICATION_STEPS, DOCUMENT_TYPES, REDIRECT_PATHS, REQUIRED_STEPS, STEP_MAPPING, APPLICATION_STATUS, USER_ROLES } from "../constants";

export class TechnicianApplicationService implements ITechnicianApplicationService {
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

      if (!email || !userId) {
        return ResponseHelper.badRequest(TECH_APPLICATION_MESSAGES.EMAIL_AND_USER_ID_REQUIRED)
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ResponseHelper.badRequest(TECH_APPLICATION_MESSAGES.VALID_EMAIL_REQUIRED)
      }

      const existingUserApplication =
        await this.applicationRepository.findByTechnicianIdAndStatus(userId, [
          APPLICATION_STATUS.DRAFT,
          APPLICATION_STATUS.SUBMITTED,
          APPLICATION_STATUS.UNDER_REVIEW,
          APPLICATION_STATUS.APPROVED,
          APPLICATION_STATUS.REJECTED,
        ]);

      if (existingUserApplication) {
        const appStatus = existingUserApplication.status;

        // If application is submitted or under review, redirect to pending dashboard
        if (appStatus === APPLICATION_STATUS.SUBMITTED || appStatus === APPLICATION_STATUS.UNDER_REVIEW) {
          return ResponseHelper.success(TECH_APPLICATION_MESSAGES.APPLICATION_ALREADY_SUBMITTED, {
            data: {
              applicationId: existingUserApplication._id.toString(),
              redirectTo: REDIRECT_PATHS.PENDING_DASHBOARD,
            },
          })
        }

        // If application is approved, redirect to technician dashboard
        if (appStatus === APPLICATION_STATUS.APPROVED) {
          return ResponseHelper.success(TECH_APPLICATION_MESSAGES.APPLICATION_ALREADY_APPROVED, {
            data: {
              applicationId: existingUserApplication._id.toString(),
              redirectTo: REDIRECT_PATHS.TECHNICIAN_DASHBOARD,
            },
          })
        }

        // Allow rejected applications to be edited and resubmitted
        if (appStatus === APPLICATION_STATUS.DRAFT || appStatus === APPLICATION_STATUS.REJECTED) {
          return ResponseHelper.success(
            appStatus === APPLICATION_STATUS.REJECTED
                ? TECH_APPLICATION_MESSAGES.REJECTED_APPLICATION_FOUND
                : TECH_APPLICATION_MESSAGES.DRAFT_APPLICATION_FOUND, {
                  data: {
              applicationId: existingUserApplication._id.toString(),
              redirectTo: null,
            },
          });
        }
      }

      // Check if email is already registered to different user
      const existingEmailApplication =
        await this.applicationRepository.findByEmailAndStatus(email, [
          APPLICATION_STATUS.DRAFT,
          APPLICATION_STATUS.SUBMITTED,
          APPLICATION_STATUS.UNDER_REVIEW,
          APPLICATION_STATUS.APPROVED,
          APPLICATION_STATUS.REJECTED,
        ]);

      if (existingEmailApplication) {
        const existingAppTechnicianId =
          existingEmailApplication.technicianId?.toString();

        // Email already used by someone else
        if (existingAppTechnicianId && existingAppTechnicianId !== userId) {
          return ResponseHelper.conflict(TECH_APPLICATION_MESSAGES.EMAIL_ALREADY_IN_USE)
        }
      }

      // Create new application
      const application = await this.applicationRepository.create({
        email: email.toLowerCase().trim(),
        technicianId: new Types.ObjectId(userId),
        status: APPLICATION_STATUS.DRAFT,
        stepsCompleted: [],
        personal: {},
        identity: {},
        skills: {},
        availability: {},
        bank: {},
        documents: {},
        agreement: false,
      });

      return ResponseHelper.success(TECH_APPLICATION_MESSAGES.APPLICATION_STARTED, {
        data: {
          applicationId: application._id.toString(),
          redirectTo: null,
        },
      })
    } catch (error) {
      console.error("Start application error:", error);
      return ResponseHelper.error(TECH_APPLICATION_MESSAGES.FAILED_TO_START_APPLICATION)
    }
  }

  async saveStep(
    data: SaveStepRequest,
    files?: any
  ): Promise<ApplicationResponse> {
    try {
      const { applicationId, step, ...stepData } = data;

      if (!applicationId || !step) {
        return ResponseHelper.badRequest(TECH_APPLICATION_MESSAGES.APPLICATION_ID_AND_STEP_REQUIRED)
      }

      const application = await this.applicationRepository.findById(
        applicationId
      );
      if (!application) {
        return ResponseHelper.notFound(TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND)
      }

      const processedStepData = { ...stepData };

      // Parse JSON fields
      const jsonFields = [
        "availability",
        "services",
        "languages",
        "serviceAreas",
      ];
      jsonFields.forEach((field) => {
        if (
          (processedStepData as any)[field] &&
          typeof (processedStepData as any)[field] === "string"
        ) {
          try {
            (processedStepData as any)[field] = JSON.parse(
              (processedStepData as any)[field]
            );
          } catch (e) {
            // Keep as string if parsing fails
          }
        }
      });

      // Handle different steps
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
      })
    } catch (error) {
      console.error("Save step error:", error);
      return ResponseHelper.error(TECH_APPLICATION_MESSAGES.FAILED_TO_SAVE_STEP)
    }
  }

  private async handleIdentityVerificationStep(
    application: any,
    stepData: any
  ): Promise<void> {
    // Save address to UserAddress collection
    if (stepData.address || stepData.location) {
      try {
        let addressData = stepData.address;
        let locationData = stepData.location;

        if (typeof addressData === "string") {
          try {
            addressData = JSON.parse(addressData);
          } catch (e) {
            console.error("Could not parse address as JSON");
          }
        }

        if (typeof locationData === "string") {
          try {
            locationData = JSON.parse(locationData);
          } catch (e) {
            console.error("Could not parse location as JSON");
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
      } catch (error) {
        console.error("Error saving to UserAddress:", error);
      }
    }

    if (!application.identity) {
      application.identity = {};
    }

    application.identity = {
      ...application.identity,
      ...stepData,
    };

    if (stepData.location && typeof stepData.location === "object") {
      application.identity.location = stepData.location;
    }
  }

  private async handleDocumentsStep(
    application: any,
    files: any
  ): Promise<void> {
    if (!application.documents || typeof application.documents !== "object") {
      application.documents = {};
    }

    const documents: any = application.documents;
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
          let fileToUpload = Array.isArray(file) ? file[0] : file;

          const uploadResult = await uploadToCloudinary(fileToUpload);

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
              technicianId: application.technicianId,
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
              uploadedAt: new Date(),
              uploadFailed: true,
              error: TECH_APPLICATION_MESSAGES.CLOUDINARY_UPLOAD_FAILED,
              verified: false,
            };
          }
        } catch (uploadError) {
          console.error(`Error uploading ${field}:`, uploadError);
          let errorMessage = "Unknown upload error";
          if (uploadError instanceof Error) {
            errorMessage = uploadError.message;
          } else if (typeof uploadError === "string") {
            errorMessage = uploadError;
          } else if (uploadError && typeof uploadError === "object") {
            errorMessage = JSON.stringify(uploadError);
          }

          documents[field] = {
            url: "",
            filename: file.originalname,
            uploadedAt: new Date(),
            uploadFailed: true,
            error: errorMessage,
            verified: false,
          };
        }
      }
    }

    application.documents = documents;
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
    application: any,
    stepData: any
  ): Promise<void> {
    if (stepData.agreement !== undefined) {
      const agreementValue =
        stepData.agreement === "true" || stepData.agreement === true;
      application.agreement = agreementValue;
    }
  }

  private async handleReviewStep(application: any): Promise<void> {
    // No specific data processing for review step, just mark as completed
  }

  private async handleGenericStep(
    application: any,
    step: string,
    stepData: any
  ): Promise<void> {
    const stepMapping: Record<string, string> = STEP_MAPPING

    const applicationField = stepMapping[step];
    if (applicationField) {
      const currentData = application[applicationField] || {};
      const newData = {
        ...currentData,
        ...stepData,
      };
      application.set(applicationField, newData);
    }
  }

  async getApplication(applicationId: string): Promise<ApplicationResponse> {
    try {
      const application = await this.applicationRepository.findById(
        applicationId
      );
      if (!application) {
        return ResponseHelper.notFound(TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND)
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

      return ResponseHelper.success(TECH_APPLICATION_MESSAGES.APPLICATION_RETRIEVED, {
        data: { application: applicationData },
      })
    } catch (error) {
      console.error("Get application error:", error);
      return ResponseHelper.error(TECH_APPLICATION_MESSAGES.FAILED_TO_RETRIEVE_APPLICATION)
    }
  }

  async submitApplication(
    applicationId: string,
    userId: string
  ): Promise<ApplicationResponse> {
    try {
      const application = await this.applicationRepository.findById(
        applicationId
      );
      if (!application) {
        return ResponseHelper.notFound(TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND)
      }

      let languagesArray: string[] = [];

      if (Array.isArray(application.skills?.languages)) {
        languagesArray = application.skills.languages.filter(
          (lang) => lang && String(lang).trim() !== ""
        );
      } else if (
        typeof application.skills?.languages === "string" &&
        application.skills.languages.trim() !== ""
      ) {
        try {
          const parsed = JSON.parse(application.skills.languages);
          if (Array.isArray(parsed)) {
            languagesArray = parsed.filter(
              (lang) => lang && String(lang).trim() !== ""
            );
          }
        } catch (e) {
          // If not JSON, split by comma
          languagesArray = application.skills.languages
            .split(",")
            .map((lang: string) => lang.trim())
            .filter((lang) => lang !== "");
        }
      }

      // Ownership validation
      if (
        !application.technicianId ||
        application.technicianId.toString() !== userId
      ) {
        return ResponseHelper.forbidden(TECH_APPLICATION_MESSAGES.ACCESS_DENIED)
      }

      // Check if application already submitted
      if (application.status !== APPLICATION_STATUS.DRAFT) {
        return ResponseHelper.badRequest(TECH_APPLICATION_MESSAGES.APPLICATION_ALREADY_SUBMITTED)
      }

      // Validate all required steps are completed
      const requiredSteps = REQUIRED_STEPS

      const missingSteps = requiredSteps.filter(
        (step) => !application.stepsCompleted.includes(step)
      );

      if (missingSteps.length > 0) {
        return ResponseHelper.unProcessableEntity(TECH_APPLICATION_MESSAGES.COMPLETE_ALL_STEPS_REQUIRED, {
          missingSteps,
        })
      }

      // Update user
      const user = await this.userRepository.updateApplicationStatus(
        userId,
        APPLICATION_STATUS.SUBMITTED
      );
      if (!user) {
        return ResponseHelper.notFound(TECH_APPLICATION_MESSAGES.USER_NOT_FOUND)
      }

      // Update user email if different
      if (application.email && user.email !== application.email) {
        await this.userRepository.update(userId, { email: application.email });
      }

      // Create or update technician record
      let technician = await this.technicianRepository.findByUserId(userId);

      let addressData = {};
      if (application.identity?.address) {
        if (typeof application.identity.address === "string") {
          try {
            addressData = JSON.parse(application.identity.address);
          } catch (e) {
            console.error("Error parsing address JSON:", e);
            addressData = {};
          }
        } else {
          addressData = application.identity.address;
        }
      }
      if (application.bank && technician) {
      await this.technicianRepository.updateByUserId(userId, {
        paymentDetails: {
          bankAccount: {
            holderName: application.bank.accountHolderName,
            accountNumber: application.bank.accountNumber,
            ifscCode: application.bank.ifscCode,
            bankName: application.bank.bankName || "",
          },
          upiId: application.bank.upiId || "",
          withdrawalPreference: 'auto'
        }
      });
    }

      if (!technician) {
        technician = await this.technicianRepository.create({
          userId: new Types.ObjectId(userId),
          displayName: application.personal?.fullName || USER_ROLES.TECHNICIAN,
          bio: application.skills?.bio || "",
          experienceYears: parseInt(application.skills?.yearsOfExperience) || 0,
          services: application.skills?.services || [],
          serviceRates: {},
          workAreas: application.skills?.serviceAreas || [],
          serviceRadiusKm: parseInt(application.skills?.workRadius) || 10,
          currentLocation: {
            type: "Point",
            coordinates: [0, 0],
          },
          averageRating: 0,
          ratingCount: 0,
          status: APPLICATION_STATUS.SUBMITTED,
          profilePictureUrl: application.documents?.passportPhoto?.url || "",
          personalInfo: {
            fullName: application.personal?.fullName || "",
            gender: application.personal?.gender || "",
            phoneNumber: application.personal?.phoneNumber || "",
            dateOfBirth: application.personal?.dateOfBirth || "",
            languages: languagesArray,
            address: addressData,
          },
        });
      } else {
        await this.technicianRepository.updateByUserId(userId, {
          displayName: application.personal?.fullName || technician.displayName,
          bio: application.skills?.bio || technician.bio,
          experienceYears:
            parseInt(application.skills?.yearsOfExperience) ||
            technician.experienceYears,
          services: application.skills?.services || technician.services,
          workAreas: application.skills?.serviceAreas || technician.workAreas,
          serviceRadiusKm:
            parseInt(application.skills?.workRadius) ||
            technician.serviceRadiusKm,
          profilePictureUrl:
            application.documents?.passportPhoto?.url ||
            technician.profilePictureUrl,
          status: APPLICATION_STATUS.SUBMITTED,
          personalInfo: {
            ...technician.personalInfo,
            fullName:
              application.personal?.fullName ||
              technician.personalInfo?.fullName ||
              "",
            gender:
              application.personal?.gender ||
              technician.personalInfo?.gender ||
              "",
            phoneNumber:
              application.personal?.phoneNumber ||
              technician.personalInfo?.phoneNumber ||
              "",
            dateOfBirth:
              application.personal?.dateOfBirth ||
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

      return ResponseHelper.success(TECH_APPLICATION_MESSAGES.APPLICATION_SUBMITTED, {
        data: {
          applicationId: application._id.toString(),
        },
      })
    } catch (error) {
      console.error("Submit application error:", error);
      return ResponseHelper.badRequest(TECH_APPLICATION_MESSAGES.FAILED_TO_SUBMIT_APPLICATION)
    }
  }

  async getApplicationStatus(
    applicationId: string
  ): Promise<ApplicationResponse> {
    try {
      const application = await this.applicationRepository.findById(
        applicationId
      );
      if (!application) {
        return ResponseHelper.notFound(TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND)
      }

      const applicationData = {
        ...application.toObject(),
        documents: application.documents || {},
      };

      return ResponseHelper.success( TECH_APPLICATION_MESSAGES.APPLICATION_STATUS_RETRIEVED, {
        data: { application: applicationData }
      })
    } catch (error) {
      console.error("Get application status error:", error);
      return ResponseHelper.error(TECH_APPLICATION_MESSAGES.FAILED_TO_GET_STATUS)
    }
  }

  async getUserApplications(userId: string): Promise<ApplicationResponse> {
    try {
      const applications = await this.applicationRepository.findByTechnicianId(
        userId
      );

      return ResponseHelper.success(TECH_APPLICATION_MESSAGES.USER_APPLICATIONS_RETRIEVED,{
          data: { applications },
        }
      )
    } catch (error) {
      console.error("Get user applications error:", error);
      return ResponseHelper.error(TECH_APPLICATION_MESSAGES.FAILED_TO_RETRIEVE_APPLICATION)
    }
  }

  async resubmitApplication(
    applicationId: string,
    userId: string
  ): Promise<ApplicationResponse> {
    try {
      const application = await this.applicationRepository.findById(
        applicationId
      );
      if (!application) {
        return ResponseHelper.notFound(TECH_APPLICATION_MESSAGES.APPLICATION_NOT_FOUND)
      }

      // Ownership validation
      if (!application.technicianId) {
        return ResponseHelper.badRequest(TECH_APPLICATION_MESSAGES.NO_TECHNICIAN_ASSIGNED)
      }

      if (application.technicianId.toString() !== userId) {
        return ResponseHelper.forbidden(TECH_APPLICATION_MESSAGES.ACCESS_DENIED)
      }

      // Check if application is rejected
      if (application.status !== APPLICATION_STATUS.REJECTED) {
        return ResponseHelper.badRequest(TECH_APPLICATION_MESSAGES.ONLY_REJECTED_CAN_RESUBMIT)
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

      return ResponseHelper.success(TECH_APPLICATION_MESSAGES.APPLICATION_RESUBMITTED, {
        data: {
          applicationId: application._id.toString(),
        },
      })
    } catch (error) {
      console.error("Resubmit application error:", error);
      return ResponseHelper.error(TECH_APPLICATION_MESSAGES.FAILED_TO_RESUBMIT_APPLICATION)
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
        return ResponseHelper.notFound(TECH_APPLICATION_MESSAGES.NO_REJECTED_APPLICATION_FOUND)
      }

      // Create a brand new application, but copy some data for convenience
      const newApplication = await this.applicationRepository.create({
        email: email.toLowerCase().trim(),
        technicianId: new Types.ObjectId(userId),
        status: APPLICATION_STATUS.DRAFT,
        stepsCompleted: [],

        // Copy basic info to save user time, but reset steps
        personal: rejectedApplication.personal || {},
        identity: rejectedApplication.identity || {},
        skills: rejectedApplication.skills || {},
        availability: rejectedApplication.availability || {},
        bank: rejectedApplication.bank || {},

        // Keep documents to avoid re-uploading
        documents: rejectedApplication.documents || {},

        agreement: false,
        previousApplicationId: rejectedApplication._id, // Track the previous application
        resubmittedCount: (rejectedApplication.resubmittedCount || 0) + 1,
      });

      return ResponseHelper.success(TECH_APPLICATION_MESSAGES.NEW_APPLICATION_STARTED, {
        data: {
          applicationId: newApplication._id.toString(),
          redirectTo: null,
        },
      })
    } catch (error) {
      console.error("Start new application after rejection error:", error);
      return ResponseHelper.error(TECH_APPLICATION_MESSAGES.FAILED_TO_START_NEW_APPLICATION)
    }
  }
}
