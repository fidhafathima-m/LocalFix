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

  async getTechnicianProfile(technicianId: string): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_PROFILE_NOT_FOUND);
      }

      // ✅ Map to DTO
      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(technician, user);

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.PROFILE_RETRIEVED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Get technician profile error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_FETCH_PROFILE);
    }
  }

  async updatePersonalInformation(
    technicianId: string,
    updateData: PersonalInfoUpdateDto
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      // Update technician personal info
      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id!.toString(),
        {
          personalInfo: {
            ...technician.personalInfo,
            fullName: updateData.fullName || technician.personalInfo?.fullName || PERSONAL_INFO_DEFAULTS.FULL_NAME,
            phoneNumber: updateData.phoneNumber || technician.personalInfo?.phoneNumber || PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
            dateOfBirth: updateData.dateOfBirth || technician.personalInfo?.dateOfBirth || PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
            gender: updateData.gender || technician.personalInfo?.gender || PERSONAL_INFO_DEFAULTS.GENDER,
            languages: updateData.languages || technician.personalInfo?.languages || PERSONAL_INFO_DEFAULTS.LANGUAGES,
          },
          bio: updateData.bio || technician.bio || PERSONAL_INFO_DEFAULTS.BIO,
          ...(updateData.profilePicture && {
            profilePictureUrl: updateData.profilePicture,
          }),
        }
      );

      if (!updatedTechnician) {
        return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PERSONAL_INFO);
      }

      // Update user email if provided
      if (updateData.email && updateData.email !== user.email) {
        await this.technicianProfileRepository.updateUser(technicianId, {
          email: updateData.email,
        });
      }

      // ✅ Get updated user data and map to DTO
      const updatedUser = await this.userRepository.findById(technicianId);
      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(updatedTechnician, updatedUser || user);

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.PERSONAL_INFO_UPDATED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Update personal information error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PERSONAL_INFO);
    }
  }

  async updateIdentityVerification(
    technicianId: string,
    updateData: IdentityVerificationUpdateDto
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id!.toString(),
        {
          identityVerification: {
            ...technician.identityVerification,
            governmentIdType: updateData.governmentIdType || technician.identityVerification?.governmentIdType,
            governmentIdNumber: updateData.governmentIdNumber || technician.identityVerification?.governmentIdNumber,
            idDocument: updateData.idDocument || technician.identityVerification?.idDocument,
            verified: false, // Reset verification status when updating
            verificationStatus: VERIFICATION_STATUS.PENDING,
          },
        }
      );

      if (!updatedTechnician) {
        return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_IDENTITY_VERIFICATION);
      }

      // ✅ Map to DTO
      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(updatedTechnician, user);

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.IDENTITY_VERIFICATION_UPDATED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Update identity verification error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_IDENTITY_VERIFICATION);
    }
  }

  async updateSkillsServices(
    technicianId: string,
    updateData: SkillsServicesUpdateDto
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id!.toString(),
        {
          services: updateData.services || technician.services || SKILLS_DEFAULTS.SERVICES,
          experienceYears: updateData.experienceYears ?? technician.experienceYears ?? SKILLS_DEFAULTS.EXPERIENCE_YEARS,
          basePrices: updateData.basePrices || technician.basePrices || SKILLS_DEFAULTS.BASE_PRICES,
        }
      );

      if (!updatedTechnician) {
        return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_SKILLS_SERVICES);
      }

      // ✅ Map to DTO
      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(updatedTechnician, user);

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.SKILLS_SERVICES_UPDATED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Update skills services error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_SKILLS_SERVICES);
    }
  }

  async updateAvailabilityPreferences(
    technicianId: string,
    updateData: AvailabilityPreferencesUpdateDto
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      const updateDataForRepo: Partial<ITechnician> = {
        availability: {
          isAvailable: updateData.isAvailable ?? technician.availability?.isAvailable ?? AVAILABILITY_DEFAULTS.IS_AVAILABLE,
          weeklyAvailability: updateData.weeklyAvailability || technician.availability?.weeklyAvailability,
        },
        workAreas: updateData.serviceAreas || technician.workAreas || [],
        serviceRadiusKm: updateData.workRadius ?? technician.serviceRadiusKm ?? AVAILABILITY_DEFAULTS.WORK_RADIUS,
      };

      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id!.toString(),
        updateDataForRepo
      );

      if (!updatedTechnician) {
        return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_AVAILABILITY);
      }

      // ✅ Map to DTO
      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(updatedTechnician, user);

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.AVAILABILITY_UPDATED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Update availability preferences error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_AVAILABILITY);
    }
  }

  async updateBankPaymentDetails(
    technicianId: string,
    updateData: BankPaymentUpdateDto
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id!.toString(),
        (() => {
          const allowedWithdrawalPrefs = ['auto', 'manual'] as const;
          const inputPref = updateData.withdrawalPreference;
          const resolvedWithdrawalPreference = allowedWithdrawalPrefs.includes(inputPref as any)
            ? (inputPref as typeof allowedWithdrawalPrefs[number])
            : (technician.paymentDetails?.withdrawalPreference ?? PAYMENT_DEFAULTS.WITHDRAWAL_PREFERENCE);

          return {
            paymentDetails: {
              ...technician.paymentDetails,
              bankAccount: {
                holderName: updateData.accountHolderName || technician.paymentDetails?.bankAccount?.holderName || PAYMENT_DEFAULTS.BANK_ACCOUNT.HOLDER_NAME,
                accountNumber: updateData.accountNumber || technician.paymentDetails?.bankAccount?.accountNumber || PAYMENT_DEFAULTS.BANK_ACCOUNT.ACCOUNT_NUMBER,
                ifscCode: updateData.ifscCode || technician.paymentDetails?.bankAccount?.ifscCode || PAYMENT_DEFAULTS.BANK_ACCOUNT.IFSC_CODE,
                bankName: PAYMENT_DEFAULTS.BANK_ACCOUNT.BANK_NAME,
              },
              upiId: updateData.upiId || technician.paymentDetails?.upiId || PAYMENT_DEFAULTS.UPI_ID,
              withdrawalPreference: resolvedWithdrawalPreference,
            },
          };
        })()
      );

      if (!updatedTechnician) {
        return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_BANK_PAYMENT);
      }

      // ✅ Map to DTO
      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(updatedTechnician, user);

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.BANK_PAYMENT_UPDATED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Update bank payment details error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_BANK_PAYMENT);
    }
  }

  async updatePassword(
    technicianId: string,
    updateData: SecuritySettingsUpdateDto
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const user = await this.userRepository.findById(technicianId);
      const technician = await this.technicianRepository.findByUserId(technicianId);

      if (!user || !technician) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.USER_NOT_FOUND);
      }

      // Verify current password
      if (updateData.currentPassword) {
        const isCurrentPasswordValid = await this.technicianProfileRepository.verifyPassword(
          technicianId,
          updateData.currentPassword
        );

        if (!isCurrentPasswordValid) {
          return ResponseHelper.badRequest(TECHNICIAN_PROFILE_MESSAGES.CURRENT_PASSWORD_INCORRECT);
        }
      }

      // Update password
      if (updateData.newPassword) {
        if (updateData.newPassword !== updateData.confirmPassword) {
          return ResponseHelper.badRequest(TECHNICIAN_PROFILE_MESSAGES.PASSWORDS_DO_NOT_MATCH);
        }

        await this.userRepository.updatePassword(technicianId, updateData.newPassword);
      }

      // ✅ Map to DTO
      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(technician, user);

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.PASSWORD_UPDATED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Update password error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PASSWORD);
    }
  }

  async uploadDocument(
    technicianId: string,
    documentData: DocumentUploadDto
  ): Promise<TechnicianProfileResponseDto> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      if (!documentData.type || !documentData.fileUrl || !documentData.fileName) {
        return ResponseHelper.badRequest(TECHNICIAN_PROFILE_MESSAGES.DOCUMENT_TYPE_REQUIRED);
      }

      const newDocument: DocumentDataDto = {
        _id: new Types.ObjectId().toString(),
        type: documentData.type,
        url: documentData.fileUrl,
        fileName: documentData.fileName,
        uploadedAt: new Date(),
        verified: false,
        status: DOCUMENT_STATUS.PENDING,
      };

      const updatedTechnician = await this.technicianProfileRepository.addDocument(
        technician._id!.toString(),
        newDocument as any
      );

      if (!updatedTechnician) {
        return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_DOCUMENT);
      }

      // ✅ Map to DTO
      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(updatedTechnician, user);

      return ResponseHelper.success(
        TECHNICIAN_PROFILE_MESSAGES.DOCUMENT_UPLOADED,
        {
          profile: profileDto,
        }
      );
    } catch (error: unknown) {
      console.error("Upload document error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_DOCUMENT);
    }
  }

  async getStaticData(): Promise<StaticDataResponseDto> {
    try {
      // ✅ Map to DTO
      const staticDataDto = TechnicianProfileMapper.toStaticDataDto();

      return ResponseHelper.success(
        "Static data retrieved successfully",
        {
          staticData: staticDataDto,
        }
      );
    } catch (error: unknown) {
      console.error("Get static data error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error("Failed to fetch static data");
    }
  }
}