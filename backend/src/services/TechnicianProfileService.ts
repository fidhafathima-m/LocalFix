import { Types } from "mongoose";
import { ITechnicianProfileService } from "../interfaces/services/technician/ITechnicianProfileService";
import { ITechnicianRepository } from "../interfaces/repository/technician/ITechnicianRepository";
import { IUserRepository } from "../interfaces/repository/user/IUserRepository";
import { IUserAddressRepository } from "../interfaces/repository/user/IUserAddressRepository";
import { ITechnicianProfileRepository } from "../interfaces/repository/technician/ITechnicianProfileRepository";
import { ResponseHelper } from "../utils/responseHelper";
import {
  TECHNICIAN_PROFILE_MESSAGES,
  VERIFICATION_STATUS,
  DOCUMENT_STATUS,
  PERSONAL_INFO_DEFAULTS,
  SKILLS_DEFAULTS,
  AVAILABILITY_DEFAULTS,
  PAYMENT_DEFAULTS,
} from "../constants";
import { ITechnician } from "@/interfaces/technician/ITechnician";

// Import DTOs and Mapper
import {
  TechnicianProfileResponseDto,
  StaticDataResponseDto,
  PersonalInfoUpdateDto,
  IdentityVerificationUpdateDto,
  SkillsServicesUpdateDto,
  AvailabilityPreferencesUpdateDto,
  BankPaymentUpdateDto,
  SecuritySettingsUpdateDto,
  DocumentUploadDto,
  TechnicianProfileDto,
  DocumentDataDto,
} from "../interfaces/dtos/technicianProfileDtos";
import { TechnicianProfileMapper } from "../mappers/technicianProfileMappers";
import { uploadToCloudinary } from "../utils/cloudinary";

export class TechnicianProfileService implements ITechnicianProfileService {
  private technicianRepository: ITechnicianRepository;
  private technicianProfileRepository: ITechnicianProfileRepository;
  private userRepository: IUserRepository;
  private userAddressRepository: IUserAddressRepository;

  constructor(
    technicianRepository: ITechnicianRepository,
    technicianProfileRepository: ITechnicianProfileRepository,
    userRepository: IUserRepository,
    userAddressRepository: IUserAddressRepository
  ) {
    this.technicianRepository = technicianRepository;
    this.technicianProfileRepository = technicianProfileRepository;
    this.userRepository = userRepository;
    this.userAddressRepository = userAddressRepository;
  }

  async getTechnicianProfile(
    technicianId: string
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(
          TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_PROFILE_NOT_FOUND
        );
      }

      let formattedLanguages: string[] = [];
      if (technician.personalInfo?.languages) {
        if (Array.isArray(technician.personalInfo.languages)) {
          formattedLanguages = technician.personalInfo.languages;
        } else if (typeof technician.personalInfo.languages === "string") {
          try {
            const parsed = JSON.parse(technician.personalInfo.languages);
            formattedLanguages = Array.isArray(parsed)
              ? parsed
              : [technician.personalInfo.languages];
          } catch {
            formattedLanguages = [technician.personalInfo.languages];
          }
        }
      }

      let documents = [];
      const technicianObject = technician.toObject
        ? technician.toObject()
        : { ...technician };

      if (technician.documents && Array.isArray(technician.documents)) {
        documents = technician.documents;
      } else if (
        technician._doc?.documents &&
        Array.isArray(technician._doc.documents)
      ) {
        documents = technician._doc.documents;
      } else {
        documents = technicianObject.documents || [];
      }

      const profileData = {
        ...technicianObject,
        personalInfo: {
          ...technicianObject.personalInfo,
          languages: formattedLanguages,
        },
        documents: technician.documents || technicianObject.documents || [],
      };

      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(
        profileData,
        user
      );

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.PROFILE_RETRIEVED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Get technician profile error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_PROFILE_MESSAGES.FAILED_FETCH_PROFILE
      );
    }
  }
  async updatePersonalInformation(
    technicianId: string,
    updateData: PersonalInfoUpdateDto
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(
          TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      const updatePayload: any = {
        personalInfo: {
          ...technician.personalInfo,
        },
      };

      // Only update fields that are provided
      if (updateData.personalInfo?.fullName !== undefined) {
        updatePayload.personalInfo.fullName = updateData.personalInfo?.fullName;
      }
      if (updateData.personalInfo?.phoneNumber !== undefined) {
        updatePayload.personalInfo.phoneNumber =
          updateData.personalInfo?.phoneNumber;
      }
      if (updateData.personalInfo?.dateOfBirth !== undefined) {
        updatePayload.personalInfo.dateOfBirth =
          updateData.personalInfo?.dateOfBirth;
      }
      if (updateData.personalInfo?.gender !== undefined) {
        updatePayload.personalInfo.gender = updateData.personalInfo?.gender;
      }
      if (updateData.personalInfo?.languages !== undefined) {
        updatePayload.personalInfo.languages =
          updateData.personalInfo?.languages;
      }

      if (updateData.bio !== undefined) {
        updatePayload.bio = updateData.bio;
      }

      if (updateData.profilePicture) {
        updatePayload.profilePictureUrl = updateData.profilePicture;
      }

      // Update technician personal info
      const updatedTechnician =
        await this.technicianProfileRepository.updateTechnician(
          technician._id!.toString(),
          updatePayload
        );

      if (!updatedTechnician) {
        return ResponseHelper.error(
          TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PERSONAL_INFO
        );
      }

      // Update user email if provided
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await this.userRepository.findByEmail(
          updateData.email
        );
        if (existingUser && existingUser._id!.toString() !== technicianId) {
          return ResponseHelper.error(
            TECHNICIAN_PROFILE_MESSAGES.EMAIL_ALREADY_EXISTS
          );
        }
        await this.technicianProfileRepository.updateUser(technicianId, {
          email: updateData.email,
        });
      }

      const updatedUser = await this.userRepository.findById(technicianId);
      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(
        updatedTechnician,
        updatedUser || user
      );

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.PERSONAL_INFO_UPDATED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Update personal information error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PERSONAL_INFO
      );
    }
  }

  async updateIdentityVerification(
    technicianId: string,
    updateData: IdentityVerificationUpdateDto
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(
          TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      const updatePayload: any = {
        identityVerification: {
          ...technician.identityVerification,
          idType: updateData.idType || technician.identityVerification?.idType,
          idNumber:
            updateData.idNumber || technician.identityVerification?.idNumber,
          idDocument:
            updateData.idDocument ||
            technician.identityVerification?.idDocument,
          verified: false,
          verificationStatus: VERIFICATION_STATUS.PENDING,
        },
      };

      if (updateData.address) {
        updatePayload.personalInfo = {
          ...technician.personalInfo,
          address: updateData.address,
        };
      }

      const updatedTechnician =
        await this.technicianProfileRepository.updateTechnician(
          technician._id!.toString(),
          updatePayload
        );

      if (!updatedTechnician) {
        console.error("Backend - Repository returned null/undefined");
        return ResponseHelper.error(
          TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_IDENTITY_VERIFICATION
        );
      }

      // Map to DTO
      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(
        updatedTechnician,
        user
      );

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.IDENTITY_VERIFICATION_UPDATED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Backend - Update identity verification error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_IDENTITY_VERIFICATION
      );
    }
  }
  async updateSkillsServices(
    technicianId: string,
    updateData: SkillsServicesUpdateDto
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(
          TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      const updatedTechnician =
        await this.technicianProfileRepository.updateTechnician(
          technician._id!.toString(),
          {
            services:
              updateData.services ||
              technician.services ||
              SKILLS_DEFAULTS.SERVICES,
            experienceYears:
              updateData.experienceYears ??
              technician.experienceYears ??
              SKILLS_DEFAULTS.EXPERIENCE_YEARS,
            basePrices:
              updateData.basePrices ||
              technician.basePrices ||
              SKILLS_DEFAULTS.BASE_PRICES,
          }
        );

      if (!updatedTechnician) {
        return ResponseHelper.error(
          TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_SKILLS_SERVICES
        );
      }

      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(
        updatedTechnician,
        user
      );

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.SKILLS_SERVICES_UPDATED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Update skills services error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_SKILLS_SERVICES
      );
    }
  }

  async updateAvailabilityPreferences(
    technicianId: string,
    updateData: AvailabilityPreferencesUpdateDto
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(
          TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      const updateDataForRepo: Partial<ITechnician> = {
        availability: {
          isAvailable:
            updateData.isAvailable ??
            technician.availability?.isAvailable ??
            AVAILABILITY_DEFAULTS.IS_AVAILABLE,
          weeklyAvailability:
            updateData.weeklyAvailability ||
            technician.availability?.weeklyAvailability,
        },
        workAreas: updateData.serviceAreas || technician.workAreas || [],
        serviceRadiusKm:
          updateData.workRadius ??
          technician.serviceRadiusKm ??
          AVAILABILITY_DEFAULTS.WORK_RADIUS,
      };

      const updatedTechnician =
        await this.technicianProfileRepository.updateTechnician(
          technician._id!.toString(),
          updateDataForRepo
        );

      if (!updatedTechnician) {
        return ResponseHelper.error(
          TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_AVAILABILITY
        );
      }

      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(
        updatedTechnician,
        user
      );

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.AVAILABILITY_UPDATED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Update availability preferences error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_AVAILABILITY
      );
    }
  }

  async updateBankPaymentDetails(
    technicianId: string,
    updateData: BankPaymentUpdateDto
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(
          TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      let paymentData: any = {};

      if (updateData.paymentDetails) {
        paymentData = {
          accountHolderName: updateData.paymentDetails.bankAccount?.holderName,
          accountNumber: updateData.paymentDetails.bankAccount?.accountNumber,
          ifscCode: updateData.paymentDetails.bankAccount?.ifscCode,
          upiId: updateData.paymentDetails.upiId,
          withdrawalPreference: updateData.paymentDetails.withdrawalPreference,
        };
      } else {
        paymentData = updateData;
      }

      // Validate required fields
      if (!paymentData.accountHolderName?.trim()) {
        return ResponseHelper.badRequest(
          "Bank account holder name is required"
        );
      }

      if (!paymentData.accountNumber?.trim()) {
        return ResponseHelper.badRequest("Account number is required");
      }

      if (!paymentData.ifscCode?.trim()) {
        return ResponseHelper.badRequest("IFSC code is required");
      }

      const allowedWithdrawalPrefs = ["auto", "manual"] as const;
      const inputPref = paymentData.withdrawalPreference;
      const resolvedWithdrawalPreference = allowedWithdrawalPrefs.includes(
        inputPref as any
      )
        ? (inputPref as (typeof allowedWithdrawalPrefs)[number])
        : technician.paymentDetails?.withdrawalPreference ??
          PAYMENT_DEFAULTS.WITHDRAWAL_PREFERENCE;

      const updatePayload = {
        paymentDetails: {
          ...technician.paymentDetails,
          bankAccount: {
            holderName:
              paymentData.accountHolderName ||
              technician.paymentDetails?.bankAccount?.holderName ||
              PAYMENT_DEFAULTS.BANK_ACCOUNT.HOLDER_NAME,
            accountNumber:
              paymentData.accountNumber ||
              technician.paymentDetails?.bankAccount?.accountNumber ||
              PAYMENT_DEFAULTS.BANK_ACCOUNT.ACCOUNT_NUMBER,
            ifscCode:
              paymentData.ifscCode ||
              technician.paymentDetails?.bankAccount?.ifscCode ||
              PAYMENT_DEFAULTS.BANK_ACCOUNT.IFSC_CODE,
            bankName:
              paymentData.bankName ||
              technician.paymentDetails?.bankAccount?.bankName ||
              PAYMENT_DEFAULTS.BANK_ACCOUNT.BANK_NAME,
          },
          upiId:
            paymentData.upiId ||
            technician.paymentDetails?.upiId ||
            PAYMENT_DEFAULTS.UPI_ID,
          withdrawalPreference: resolvedWithdrawalPreference,
        },
      };

      const updatedTechnician =
        await this.technicianProfileRepository.updateTechnician(
          technician._id!.toString(),
          updatePayload
        );

      if (!updatedTechnician) {
        return ResponseHelper.error(
          TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_BANK_PAYMENT
        );
      }

      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(
        updatedTechnician,
        user
      );

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.BANK_PAYMENT_UPDATED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("UPDATE BANK PAYMENT - Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_BANK_PAYMENT
      );
    }
  }

  async updatePassword(
    technicianId: string,
    updateData: SecuritySettingsUpdateDto
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const user = await this.userRepository.findById(technicianId);
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );

      if (!user || !technician) {
        return ResponseHelper.notFound(
          TECHNICIAN_PROFILE_MESSAGES.USER_NOT_FOUND
        );
      }

      // Verify current password
      if (updateData.currentPassword) {
        const isCurrentPasswordValid =
          await this.technicianProfileRepository.verifyPassword(
            technicianId,
            updateData.currentPassword
          );

        if (!isCurrentPasswordValid) {
          return ResponseHelper.badRequest(
            TECHNICIAN_PROFILE_MESSAGES.CURRENT_PASSWORD_INCORRECT
          );
        }
      } else {
        return ResponseHelper.badRequest("Current password is required");
      }

      // Update password
      if (updateData.newPassword) {
        if (updateData.newPassword !== updateData.confirmPassword) {
          return ResponseHelper.badRequest(
            TECHNICIAN_PROFILE_MESSAGES.PASSWORDS_DO_NOT_MATCH
          );
        }

        const updateResult =
          await this.technicianProfileRepository.updateUserPassword(
            technicianId,
            updateData.newPassword
          );

        if (!updateResult) {
          return ResponseHelper.error(
            TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PASSWORD
          );
        }
      } else {
        return ResponseHelper.badRequest("New password is required");
      }

      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(
        technician,
        user
      );

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.PASSWORD_UPDATED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("UPDATE PASSWORD - Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PASSWORD
      );
    }
  }

  async uploadDocument(
    technicianId: string,
    documentData: DocumentUploadDto | Express.Multer.File,
    documentType?: string
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(
          TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      let fileUrl: string;
      let fileName: string;
      let finalDocumentType: string;

      // Handle both DocumentUploadDto and Multer file
      if (documentData instanceof Object && "fileUrl" in documentData) {
        fileUrl = documentData.fileUrl;
        fileName = documentData.fileName;
        finalDocumentType = documentData.type;
      } else {
        // It's a Multer file
        const file = documentData as Express.Multer.File;

        if (!documentType) {
          return ResponseHelper.badRequest(
            "Document type is required for file uploads"
          );
        }
        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(file);

        if (!uploadResult || !uploadResult.secure_url) {
          console.error("Service - Cloudinary upload failed");
          return ResponseHelper.error(
            TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_DOCUMENT
          );
        }

        fileUrl = uploadResult.secure_url;
        fileName = file.originalname;
        finalDocumentType = documentType;
      }

      if (!finalDocumentType || !fileUrl || !fileName) {
        return ResponseHelper.badRequest(
          TECHNICIAN_PROFILE_MESSAGES.DOCUMENT_TYPE_REQUIRED
        );
      }

      const newDocument: DocumentDataDto = {
        _id: new Types.ObjectId().toString(),
        type: finalDocumentType,
        url: fileUrl,
        fileName: fileName,
        uploadedAt: new Date(),
        verified: false,
        status: DOCUMENT_STATUS.PENDING,
      };

      const updatedTechnician =
        await this.technicianProfileRepository.addDocument(
          technician._id!.toString(),
          newDocument as any
        );

      if (!updatedTechnician) {
        return ResponseHelper.error(
          TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_DOCUMENT
        );
      }

      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(
        updatedTechnician,
        user
      );

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.DOCUMENT_UPLOADED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Upload document error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_DOCUMENT
      );
    }
  }

  async getStaticData(): Promise<StaticDataResponseDto> {
    try {
      const staticDataDto = TechnicianProfileMapper.toStaticDataDto();

      return ResponseHelper.success("Static data retrieved successfully", {
        staticData: staticDataDto,
      });
    } catch (error: unknown) {
      console.error("Get static data error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error("Failed to fetch static data");
    }
  }
  async uploadPhoto(
    technicianId: string,
    file: Express.Multer.File
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(
          TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      // Upload to Cloudinary (same as application form)
      const uploadResult = await uploadToCloudinary(file);

      if (!uploadResult || !uploadResult.secure_url) {
        console.error("Service - Cloudinary upload failed");
        return ResponseHelper.error(
          TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_PHOTO
        );
      }

      const profilePictureUrl = uploadResult.secure_url;

      // Update technician with the new profile picture URL
      const updatedTechnician =
        await this.technicianProfileRepository.updateTechnician(
          technician._id!.toString(),
          {
            profilePictureUrl: profilePictureUrl,
          }
        );

      if (!updatedTechnician) {
        console.error("Service - Failed to update technician profile");
        return ResponseHelper.error(
          TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_PHOTO
        );
      }

      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(
        updatedTechnician,
        user
      );

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.PHOTO_UPLOADED,
        {
          profile: profileDto,
          profilePictureUrl: profilePictureUrl,
        }
      );
    } catch (error: unknown) {
      console.error("Upload photo error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_PHOTO
      );
    }
  }
}
