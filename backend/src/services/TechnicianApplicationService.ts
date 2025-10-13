import { Types } from "mongoose";
import { TechnicianApplicationRepository } from "../repositories/technician/TechnicianApplicationRepository";
import { TechnicianRepository } from "../repositories/technician/TechnicianRepository";
import { TechnicianDocumentRepository } from "../repositories/technician/TechnicianDocumentRepository";
import { UserRepository } from "../repositories/user/UserRepository";
import {
  StartApplicationRequest,
  SaveStepRequest,
  SubmitApplicationRequest,
  ApplicationResponse,
} from "../interfaces/technician/ITechnicianApplication";
import { uploadToCloudinary } from "../utils/cloudinary";
import UserAddressSchema from "../models/UserAddressSchema";
import { ITechnicianDocument } from "../interfaces/technician/ITechnicianDocuments";

export class TechnicianApplicationService {
  private applicationRepository: TechnicianApplicationRepository;
  private technicianRepository: TechnicianRepository;
  private documentRepository: TechnicianDocumentRepository;
  private userRepository: UserRepository;

  constructor() {
    this.applicationRepository = new TechnicianApplicationRepository();
    this.technicianRepository = new TechnicianRepository();
    this.documentRepository = new TechnicianDocumentRepository();
    this.userRepository = new UserRepository();
  }

  async startApplication(
    data: StartApplicationRequest
  ): Promise<ApplicationResponse> {
    try {
      const { email, userId } = data;

      console.log("Starting application for email:", email, "user:", userId);

      if (!email || !userId) {
        return {
          success: false,
          message: "Email and User ID are required",
        };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: "Please provide a valid email address",
        };
      }

      const existingUserApplication =
        await this.applicationRepository.findByTechnicianIdAndStatus(userId, [
          "draft",
          "submitted",
          "under_review",
          "approved",
          "rejected",
        ]);

      if (existingUserApplication) {
        const appStatus = existingUserApplication.status;

        // If application is submitted or under review, redirect to pending dashboard
        if (appStatus === "submitted" || appStatus === "under_review") {
          return {
            success: true,
            message: "Application already submitted",
            data: {
              applicationId: existingUserApplication._id.toString(),
              redirectTo: "/pending-technician/dashboard",
            },
          };
        }

        // If application is approved, redirect to technician dashboard
        if (appStatus === "approved") {
          return {
            success: true,
            message: "Application already approved",
            data: {
              applicationId: existingUserApplication._id.toString(),
              redirectTo: "/technician/dashboard",
            },
          };
        }

        // Allow rejected applications to be edited and resubmitted
        if (appStatus === "draft" || appStatus === "rejected") {
          return {
            success: true,
            message:
              appStatus === "rejected"
                ? "Rejected application found - you can edit and resubmit"
                : "Draft application found",
            data: {
              applicationId: existingUserApplication._id.toString(),
              redirectTo: null,
            },
          };
        }
      }

      // Check if email is already registered to different user
      const existingEmailApplication =
        await this.applicationRepository.findByEmailAndStatus(email, [
          "draft",
          "submitted",
          "under_review",
          "approved",
          "rejected",
        ]);

      if (existingEmailApplication) {
        const existingAppTechnicianId =
          existingEmailApplication.technicianId?.toString();

        // Email already used by someone else
        if (existingAppTechnicianId && existingAppTechnicianId !== userId) {
          return {
            success: false,
            message:
              "Email already has an application in progress by another user",
          };
        }
      }

      // Create new application
      const application = await this.applicationRepository.create({
        email: email.toLowerCase().trim(),
        technicianId: new Types.ObjectId(userId),
        status: "draft",
        stepsCompleted: [],
        personal: {},
        identity: {},
        skills: {},
        availability: {},
        bank: {},
        documents: {},
        agreement: false,
      });

      console.log("Created new application with ID:", application._id);

      return {
        success: true,
        message: "Application started successfully",
        data: {
          applicationId: application._id.toString(),
          redirectTo: null,
        },
      };
    } catch (error) {
      console.error("Start application error:", error);
      return {
        success: false,
        message: "Failed to start application",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async saveStep(
    data: SaveStepRequest,
    files?: any
  ): Promise<ApplicationResponse> {
    try {
      const { applicationId, step, ...stepData } = data;

      if (!applicationId || !step) {
        return {
          success: false,
          message: "Application ID and step are required",
        };
      }

      const application = await this.applicationRepository.findById(
        applicationId
      );
      if (!application) {
        return {
          success: false,
          message: "Application not found",
        };
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
      if (step === "Identity & Verification") {
        await this.handleIdentityVerificationStep(
          application,
          processedStepData
        );
      } else if (step === "Documents") {
        await this.handleDocumentsStep(application, files);
      } else if (step === "Agreement & Consent") {
        await this.handleAgreementStep(application, processedStepData);
      } else if (step === "Review & Submit") {
        await this.handleReviewStep(application);
      } else {
        await this.handleGenericStep(application, step, processedStepData);
      }

      // Mark step as completed if not already
      if (!application.stepsCompleted.includes(step)) {
        application.stepsCompleted.push(step);
      }

      await this.applicationRepository.save(application);

      return {
        success: true,
        message: "Step saved successfully",
        data: {
          application: {
            _id: application._id,
            stepsCompleted: application.stepsCompleted,
          },
        },
      };
    } catch (error) {
      console.error("Save step error:", error);
      return {
        success: false,
        message: "Failed to save step",
        error: error instanceof Error ? error.message : "Unknown error",
      };
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
            console.log("⚠️ Could not parse address as JSON");
          }
        }

        if (typeof locationData === "string") {
          try {
            locationData = JSON.parse(locationData);
          } catch (e) {
            console.log("⚠️ Could not parse location as JSON");
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
      "idProof",
      "addressProof",
      "policeVerification",
      "passportPhoto",
      "profilePhoto",
      "tradeLicense",
    ];

    console.log("📁 Documents step - Received files:", files);

    for (const field of documentFields) {
      if (files && files[field]) {
        const file = files[field];
        console.log(`📤 Processing ${field}:`, {
          field: field,
          file: file,
          isArray: Array.isArray(file),
          fileCount: Array.isArray(file) ? file.length : 1,
        });

        try {
          let fileToUpload = Array.isArray(file) ? file[0] : file;

          console.log(`📤 Uploading ${field} to Cloudinary:`, {
            originalName: fileToUpload.originalname,
            mimetype: fileToUpload.mimetype,
            size: fileToUpload.size,
          });

          const uploadResult = await uploadToCloudinary(fileToUpload);

          console.log(
            `✅ Cloudinary upload result for ${field}:`,
            uploadResult
          );

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

            console.log(
              `✅ Successfully saved ${field} document:`,
              documents[field]
            );

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
            console.error(`❌ Cloudinary returned no secure_url for ${field}`);
            documents[field] = {
              url: "",
              filename: fileToUpload.originalname,
              uploadedAt: new Date(),
              uploadFailed: true,
              error: "Cloudinary upload failed - no secure_url returned",
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
      } else {
        console.log(`📭 No file provided for ${field}`);
      }
    }

    application.documents = documents;
    console.log("📁 Final documents state:", application.documents);
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
    const stepMapping: Record<string, string> = {
      "Personal Information": "personal",
      "Identity & Verification": "identity",
      "Skills & Services": "skills",
      "Availability & Work Preferences": "availability",
      "Banking Details": "bank",
    };

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
        return {
          success: false,
          message: "Application not found",
        };
      }

      console.log("🔍 Service - Application found:", {
        id: application._id,
        status: application.status,
        rejectionReason: application.rejectionReason,
        rejectedAt: application.rejectedAt,
      });

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

      console.log("🔍 Service - Returning application data:", applicationData);

      return {
        success: true,
        message: "Application retrieved successfully",
        data: { application: applicationData },
      };
    } catch (error) {
      console.error("Get application error:", error);
      return {
        success: false,
        message: "Failed to retrieve application",
        error: error instanceof Error ? error.message : "Unknown error",
      };
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
        return {
          success: false,
          message: "Application not found",
        };
      }

      // Ownership validation
      if (
        !application.technicianId ||
        application.technicianId.toString() !== userId
      ) {
        return {
          success: false,
          message:
            "Access denied - application does not belong to current user",
        };
      }

      // Check if application already submitted
      if (application.status !== "draft") {
        return {
          success: false,
          message: "Application has already been submitted",
        };
      }

      // Validate all required steps are completed
      const requiredSteps = [
        "Personal Information",
        "Identity & Verification",
        "Skills & Services",
        "Availability & Work Preferences",
        "Banking Details",
        "Documents",
        "Agreement & Consent",
      ];

      const missingSteps = requiredSteps.filter(
        (step) => !application.stepsCompleted.includes(step)
      );

      if (missingSteps.length > 0) {
        return {
          success: false,
          message: "Please complete all steps before submitting",
          missingSteps,
        };
      }

      // Update user
      const user = await this.userRepository.updateApplicationStatus(
        userId,
        "submitted"
      );
      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Update user email if different
      if (application.email && user.email !== application.email) {
        await this.userRepository.update(userId, { email: application.email });
      }

      // Update user role if needed
      if (user.role !== "serviceProvider") {
        await this.userRepository.updateRole(userId, "serviceProvider");
      }

      // Create or update technician record
      let technician = await this.technicianRepository.findByUserId(userId);

      const languages = application.personal?.languages || [];
      const languagesArray = Array.isArray(languages)
        ? languages
        : typeof languages === "string"
        ? [languages]
        : [];

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
          // If it's already an object, use it directly
          addressData = application.identity.address;
        }
      }

      console.log("🔍 Address data for technician:", {
        original: application.identity?.address,
        parsed: addressData,
        type: typeof application.identity?.address,
      });

      if (!technician) {
        technician = await this.technicianRepository.create({
          userId: new Types.ObjectId(userId),
          displayName: application.personal?.fullName || "Technician",
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
          status: "submitted",
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
          status: "submitted",
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
        status: "submitted",
        submittedAt: new Date(),
      });

      return {
        success: true,
        message: "Application submitted successfully",
        data: {
          applicationId: application._id.toString(),
        },
      };
    } catch (error) {
      console.error("Submit application error:", error);
      return {
        success: false,
        message: "Failed to submit application",
        error: error instanceof Error ? error.message : "Unknown error",
      };
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
        return {
          success: false,
          message: "Application not found",
        };
      }

      const applicationData = {
        ...application.toObject(),
        documents: application.documents || {},
      };

      return {
        success: true,
        message: "Application status retrieved successfully",
        data: { application: applicationData },
      };
    } catch (error) {
      console.error("Get application status error:", error);
      return {
        success: false,
        message: "Failed to get application status",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getUserApplications(userId: string): Promise<ApplicationResponse> {
    try {
      const applications = await this.applicationRepository.findByTechnicianId(
        userId
      );

      return {
        success: true,
        message: "User applications retrieved successfully",
        data: { applications },
      };
    } catch (error) {
      console.error("Get user applications error:", error);
      return {
        success: false,
        message: "Failed to retrieve user applications",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async resubmitApplication(
    applicationId: string,
    userId: string
  ): Promise<ApplicationResponse> {
    try {
      console.log("🔍 Resubmit - Starting for application:", applicationId);
      console.log("🔍 Resubmit - User ID:", userId);

      const application = await this.applicationRepository.findById(
        applicationId
      );
      if (!application) {
        console.log("❌ Resubmit - Application not found");
        return {
          success: false,
          message: "Application not found",
        };
      }

      console.log("🔍 Resubmit - Found application:", {
        id: application._id,
        status: application.status,
        technicianId: application.technicianId,
      });

      // Ownership validation
      if (!application.technicianId) {
        console.log("❌ Resubmit - No technicianId found in application");
        return {
          success: false,
          message: "Application has no technician assigned",
        };
      }

      if (application.technicianId.toString() !== userId) {
        console.log("❌ Resubmit - Ownership mismatch:", {
          applicationTechnicianId: application.technicianId.toString(),
          currentUserId: userId,
        });
        return {
          success: false,
          message:
            "Access denied - application does not belong to current user",
        };
      }

      // Check if application is rejected
      if (application.status !== "rejected") {
        console.log(
          "❌ Resubmit - Application status is not rejected:",
          application.status
        );
        return {
          success: false,
          message: "Only rejected applications can be resubmitted",
        };
      }

      console.log(
        "🔍 Resubmit - All validations passed, updating application..."
      );

      // Update application status and clear rejection details
      application.status = "submitted";
      application.rejectionReason = undefined;
      application.reviewNotes = undefined;
      application.resubmittedCount = (application.resubmittedCount || 0) + 1;
      application.lastSubmittedAt = new Date();
      application.updatedAt = new Date();

      console.log("🔍 Resubmit - Saving application...");
      await this.applicationRepository.save(application);
      console.log("🔍 Resubmit - Application saved successfully");

      // Update technician status if exists
      console.log("🔍 Resubmit - Updating technician status...");
      const technician = await this.technicianRepository.findByUserId(userId);
      if (technician) {
        console.log(
          "🔍 Resubmit - Found technician, updating status to submitted"
        );
        await this.technicianRepository.updateByUserId(userId, {
          status: "submitted",
        });
      } else {
        console.log("🔍 Resubmit - No technician found for user");
      }

      console.log("✅ Resubmit - Completed successfully");

      return {
        success: true,
        message: "Application resubmitted successfully",
        data: {
          applicationId: application._id.toString(),
        },
      };
    } catch (error) {
      console.error("❌ Resubmit application error:", error);
      return {
        success: false,
        message: "Failed to resubmit application",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async startNewApplicationAfterRejection(
    userId: string,
    email: string
  ): Promise<ApplicationResponse> {
    try {
      console.log("Starting new application after rejection for user:", userId);

      // Find the rejected application
      const rejectedApplication =
        await this.applicationRepository.findByTechnicianIdAndStatus(userId, [
          "rejected",
        ]);

      if (!rejectedApplication) {
        return {
          success: false,
          message: "No rejected application found",
        };
      }

      // Create a brand new application, but copy some data for convenience
      const newApplication = await this.applicationRepository.create({
        email: email.toLowerCase().trim(),
        technicianId: new Types.ObjectId(userId),
        status: "draft",
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

      console.log(
        "Created new application after rejection:",
        newApplication._id
      );

      return {
        success: true,
        message: "New application started successfully",
        data: {
          applicationId: newApplication._id.toString(),
          redirectTo: null,
        },
      };
    } catch (error) {
      console.error("Start new application after rejection error:", error);
      return {
        success: false,
        message: "Failed to start new application",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
