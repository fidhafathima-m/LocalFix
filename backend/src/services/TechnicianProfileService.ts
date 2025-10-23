import { ITechnicianProfileService } from "../interfaces/services/technician/ITechnicianProfileService";
import { ITechnicianRepository } from "../interfaces/repository/technician/ITechnicianRepository";
import { IUserRepository } from "../interfaces/repository/user/IUserRepository";
import { IUserAddressRepository } from "../interfaces/repository/user/IUserAddressRepository";
import {
  AvailabilityPreferencesUpdate,
  BankPaymentUpdate,
  IdentityVerificationUpdate,
  PersonalInfoUpdate,
  SecuritySettingsUpdate,
  SkillsServicesUpdate,
} from "../interfaces/technician/ITechnicianProfile";
import { ITechnicianProfileRepository } from "../interfaces/repository/technician/ITechnicianProfileRepository";
import {
  TECHNICIAN_PROFILE_MESSAGES,
  VERIFICATION_STATUS,
  DOCUMENT_STATUS,
  PROFILE_SECTIONS,
  AVAILABILITY_DEFAULTS,
  PAYMENT_DEFAULTS,
  PERSONAL_INFO_DEFAULTS,
  SKILLS_DEFAULTS,
  SECURITY_SETTINGS_DEFAULTS,
} from "../constants";
import { ITechnician } from "@/interfaces/technician/ITechnician";
import { IUser } from "@/interfaces/user/IUser";
import { Types } from "mongoose";

// Import the ITechnician from technicianApplicationTypes to understand the expected type
import { ITechnician as IAppTechnician } from "@/types/technicianApplicationTypes";

// Create proper document type that matches DocumentsInfo
interface DocumentData {
  _id?: Types.ObjectId;
  type: string;
  fileName: string;
  url: string;
  uploadedAt: Date;
  verified: boolean;
  status: "pending" | "approved" | "rejected";
  verifiedAt?: Date;
}

// Response interfaces
interface ProfileData {
  [key: string]: unknown;
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  displayName: string;
  email?: string;
  phone?: string;
  profilePictureUrl?: string;
  bio: string;
  services: string[];
  workAreas: string[];
  serviceRadiusKm?: number;
  status: string;
  averageRating?: number;
  ratingCount?: number;
  totalJobs?: number;
  completedJobs?: number;
  ongoingJobs?: number;
  totalEarnings?: number;
  createdAt: Date;
  updatedAt: Date;
  [PROFILE_SECTIONS.PERSONAL_INFORMATION]: PersonalInfoFormatted;
  [PROFILE_SECTIONS.IDENTITY_VERIFICATION]: IdentityVerificationFormatted;
  [PROFILE_SECTIONS.SKILLS_SERVICES]: SkillsServicesFormatted;
  [PROFILE_SECTIONS.AVAILABILITY_PREFERENCES]: AvailabilityPreferencesFormatted;
  [PROFILE_SECTIONS.BANK_PAYMENT_DETAILS]: BankPaymentDetailsFormatted;
  [PROFILE_SECTIONS.DOCUMENTS]: DocumentData[];
  [PROFILE_SECTIONS.SECURITY_SETTINGS]: SecuritySettingsFormatted;
}

interface PersonalInfoFormatted {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  languages: string[];
  bio: string;
  profilePictureUrl: string;
}

interface IdentityVerificationFormatted {
  verificationStatus: string;
  governmentIdType?: string;
  governmentIdNumber?: string;
  idDocument?: string;
}

interface SkillsServicesFormatted {
  services: string[];
  experienceYears: number;
  basePrices: Record<string, number>;
}

interface AvailabilityPreferencesFormatted {
  isAvailable: boolean;
  serviceAreas: string[];
  workRadius: number;
}

interface BankPaymentDetailsFormatted {
  bankAccount: {
    holderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  upiId: string;
  withdrawalPreference: string;
}

interface SecuritySettingsFormatted {
  lastLogin?: Date;
  loginDevice?: string;
}

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

  async getTechnicianProfile(technicianId: string): Promise<IAppTechnician> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_PROFILE_NOT_FOUND);
      }

      // Convert to the expected ITechnician type
      return this.convertToExpectedTechnician(technician);
    } catch (error: unknown) {
      console.error("Get technician profile error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_FETCH_PROFILE);
    }
  }

  async updatePersonalInformation(
    technicianId: string,
    updateData: PersonalInfoUpdate
  ): Promise<IAppTechnician> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      // Update technician personal info
      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id!.toString(),
        {
          personalInfo: {
            ...technician.personalInfo,
            fullName:
              updateData.fullName ||
              technician.personalInfo?.fullName ||
              PERSONAL_INFO_DEFAULTS.FULL_NAME,
            phoneNumber:
              updateData.phoneNumber ||
              technician.personalInfo?.phoneNumber ||
              PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
            dateOfBirth:
              updateData.dateOfBirth ||
              technician.personalInfo?.dateOfBirth ||
              PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
            gender:
              updateData.gender ||
              technician.personalInfo?.gender ||
              PERSONAL_INFO_DEFAULTS.GENDER,
            languages:
              updateData.languages ||
              technician.personalInfo?.languages ||
              PERSONAL_INFO_DEFAULTS.LANGUAGES,
          },
          bio: updateData.bio || technician.bio || PERSONAL_INFO_DEFAULTS.BIO,
          ...(updateData.profilePicture && {
            profilePictureUrl: updateData.profilePicture,
          }),
        }
      );

      if (!updatedTechnician) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PERSONAL_INFO);
      }

      // Update user email if provided
      if (updateData.email && updateData.email !== user.email) {
        await this.technicianProfileRepository.updateUser(technicianId, {
          email: updateData.email,
        });
      }

      return this.convertToExpectedTechnician(updatedTechnician);
    } catch (error: unknown) {
      console.error("Update personal information error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PERSONAL_INFO);
    }
  }

  async updateIdentityVerification(
    technicianId: string,
    updateData: IdentityVerificationUpdate
  ): Promise<IAppTechnician> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);

      if (!technician) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id!.toString(),
        {
          identityVerification: {
            ...technician.identityVerification,
            governmentIdType:
              updateData.governmentIdType ||
              technician.identityVerification?.governmentIdType,
            governmentIdNumber:
              updateData.governmentIdNumber ||
              technician.identityVerification?.governmentIdNumber,
            idDocument:
              updateData.idDocument ||
              technician.identityVerification?.idDocument,
            verified: false, // Reset verification status when updating
            verificationStatus: VERIFICATION_STATUS.PENDING,
          },
        }
      );

      if (!updatedTechnician) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_IDENTITY_VERIFICATION);
      }

      return this.convertToExpectedTechnician(updatedTechnician);
    } catch (error: unknown) {
      console.error("Update identity verification error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_IDENTITY_VERIFICATION);
    }
  }

  async updateSkillsServices(
    technicianId: string,
    updateData: SkillsServicesUpdate
  ): Promise<IAppTechnician> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);

      if (!technician) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
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
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_SKILLS_SERVICES);
      }

      return this.convertToExpectedTechnician(updatedTechnician);
    } catch (error: unknown) {
      console.error("Update skills services error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_SKILLS_SERVICES);
    }
  }

  async updateAvailabilityPreferences(
    technicianId: string,
    updateData: AvailabilityPreferencesUpdate
  ): Promise<IAppTechnician> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);

      if (!technician) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      // Create update data that matches ITechnician structure
      const updateDataForRepo: Partial<ITechnician> = {
        availability: {
          isAvailable:
            updateData.isAvailable ??
            technician.availability?.isAvailable ??
            AVAILABILITY_DEFAULTS.IS_AVAILABLE,
          weeklyAvailability: updateData.weeklyAvailability || technician.availability?.weeklyAvailability,
        },
        workAreas: updateData.serviceAreas || technician.workAreas || [],
        serviceRadiusKm:
          updateData.workRadius ??
          technician.serviceRadiusKm ??
          AVAILABILITY_DEFAULTS.WORK_RADIUS,
      };

      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id!.toString(),
        updateDataForRepo
      );

      if (!updatedTechnician) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_AVAILABILITY);
      }

      return this.convertToExpectedTechnician(updatedTechnician);
    } catch (error: unknown) {
      console.error("Update availability preferences error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_AVAILABILITY);
    }
  }

  async updateBankPaymentDetails(
    technicianId: string,
    updateData: BankPaymentUpdate
  ): Promise<IAppTechnician> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);

      if (!technician) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id!.toString(),
        {
          paymentDetails: {
            ...technician.paymentDetails,
            bankAccount: {
              holderName:
                updateData.accountHolderName ||
                technician.paymentDetails?.bankAccount?.holderName ||
                PAYMENT_DEFAULTS.BANK_ACCOUNT.HOLDER_NAME,
              accountNumber:
                updateData.accountNumber ||
                technician.paymentDetails?.bankAccount?.accountNumber ||
                PAYMENT_DEFAULTS.BANK_ACCOUNT.ACCOUNT_NUMBER,
              ifscCode:
                updateData.ifscCode ||
                technician.paymentDetails?.bankAccount?.ifscCode ||
                PAYMENT_DEFAULTS.BANK_ACCOUNT.IFSC_CODE,
              bankName: PAYMENT_DEFAULTS.BANK_ACCOUNT.BANK_NAME,
            },
            upiId:
              updateData.upiId ||
              technician.paymentDetails?.upiId ||
              PAYMENT_DEFAULTS.UPI_ID,
            withdrawalPreference:
              updateData.withdrawalPreference ||
              technician.paymentDetails?.withdrawalPreference ||
              PAYMENT_DEFAULTS.WITHDRAWAL_PREFERENCE,
          },
        }
      );

      if (!updatedTechnician) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_BANK_PAYMENT);
      }

      return this.convertToExpectedTechnician(updatedTechnician);
    } catch (error: unknown) {
      console.error("Update bank payment details error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_BANK_PAYMENT);
    }
  }

  async updatePassword(
    technicianId: string,
    updateData: SecuritySettingsUpdate
  ): Promise<IAppTechnician> {
    try {
      const user = await this.userRepository.findById(technicianId);

      if (!user) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.USER_NOT_FOUND);
      }

      // Verify current password
      if (updateData.currentPassword) {
        const isCurrentPasswordValid = await this.technicianProfileRepository.verifyPassword(
          technicianId,
          updateData.currentPassword
        );

        if (!isCurrentPasswordValid) {
          throw new Error(TECHNICIAN_PROFILE_MESSAGES.CURRENT_PASSWORD_INCORRECT);
        }
      }

      // Update password
      if (updateData.newPassword) {
        if (updateData.newPassword !== updateData.confirmPassword) {
          throw new Error(TECHNICIAN_PROFILE_MESSAGES.PASSWORDS_DO_NOT_MATCH);
        }

        await this.userRepository.updatePassword(
          technicianId,
          updateData.newPassword
        );
      }

      // Return the technician profile
      const technician = await this.technicianRepository.findByUserId(technicianId);
      if (!technician) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      return this.convertToExpectedTechnician(technician);
    } catch (error: unknown) {
      console.error("Update password error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PASSWORD);
    }
  }

  async uploadDocument(
    technicianId: string,
    documentData: {
      type: string;
      fileUrl: string;
      fileName: string;
    }
  ): Promise<IAppTechnician> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);

      if (!technician) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      if (!documentData.type) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.DOCUMENT_TYPE_REQUIRED);
      }

      if (!documentData.fileUrl) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.FILE_URL_REQUIRED);
      }

      if (!documentData.fileName) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.FILE_NAME_REQUIRED);
      }

      // Create document data that matches the DocumentsInfo structure
      const newDocument: DocumentData = {
        _id: new Types.ObjectId(),
        type: documentData.type,
        url: documentData.fileUrl,
        fileName: documentData.fileName,
        uploadedAt: new Date(),
        verified: false,
        status: DOCUMENT_STATUS.PENDING as "pending",
      };

      const updatedTechnician = await this.technicianProfileRepository.addDocument(
        technician._id!.toString(),
        newDocument as any // Use type assertion since we've matched the structure
      );

      if (!updatedTechnician) {
        throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_DOCUMENT);
      }

      return this.convertToExpectedTechnician(updatedTechnician);
    } catch (error: unknown) {
      console.error("Upload document error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_DOCUMENT);
    }
  }

  // Helper method to convert ITechnician to the expected type
  private convertToExpectedTechnician(technician: ITechnician): IAppTechnician {
    // Create a new object with required fields properly set
    const converted: any = {
      ...technician,
      // Ensure required fields have proper defaults
      bio: technician.bio || PERSONAL_INFO_DEFAULTS.BIO,
      experienceYears: technician.experienceYears ?? SKILLS_DEFAULTS.EXPERIENCE_YEARS,
      serviceRadiusKm: technician.serviceRadiusKm ?? AVAILABILITY_DEFAULTS.WORK_RADIUS,
      // Add any other required fields with defaults
    };

    return converted as IAppTechnician;
  }

  // Rest of your helper methods remain the same...
  private formatPersonalInfo(technician: ITechnician, user: IUser): PersonalInfoFormatted {
    return {
      fullName:
        technician.personalInfo?.fullName ||
        technician.displayName ||
        PERSONAL_INFO_DEFAULTS.FULL_NAME,
      phoneNumber:
        technician.personalInfo?.phoneNumber ||
        technician.phone ||
        PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
      email: user.email || "",
      dateOfBirth:
        technician.personalInfo?.dateOfBirth ||
        PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
      gender: technician.personalInfo?.gender || PERSONAL_INFO_DEFAULTS.GENDER,
      languages: Array.isArray(technician.personalInfo?.languages) 
        ? technician.personalInfo.languages 
        : PERSONAL_INFO_DEFAULTS.LANGUAGES,
      bio: technician.bio || PERSONAL_INFO_DEFAULTS.BIO,
      profilePictureUrl:
        technician.profilePictureUrl ||
        PERSONAL_INFO_DEFAULTS.PROFILE_PICTURE_URL,
    };
  }

  private formatIdentityVerification(technician: ITechnician): IdentityVerificationFormatted {
    return {
      verificationStatus:
        technician.identityVerification?.verificationStatus ||
        VERIFICATION_STATUS.PENDING,
      governmentIdType: technician.identityVerification?.governmentIdType,
      governmentIdNumber: technician.identityVerification?.governmentIdNumber,
      idDocument: technician.identityVerification?.idDocument,
    };
  }

  private formatSkillsServices(technician: ITechnician): SkillsServicesFormatted {
    return {
      services: technician.services || SKILLS_DEFAULTS.SERVICES,
      experienceYears:
        technician.experienceYears || SKILLS_DEFAULTS.EXPERIENCE_YEARS,
      basePrices: technician.basePrices || SKILLS_DEFAULTS.BASE_PRICES,
    };
  }

  private formatAvailabilityPreferences(technician: ITechnician): AvailabilityPreferencesFormatted {
    return {
      isAvailable:
        technician.availability?.isAvailable ??
        AVAILABILITY_DEFAULTS.IS_AVAILABLE,
      serviceAreas: technician.workAreas || [],
      workRadius:
        technician.serviceRadiusKm || AVAILABILITY_DEFAULTS.WORK_RADIUS,
    };
  }

  private formatBankPaymentDetails(technician: ITechnician): BankPaymentDetailsFormatted {
    if (technician.paymentDetails) {
      return {
        bankAccount: {
          holderName: technician.paymentDetails.bankAccount?.holderName || PAYMENT_DEFAULTS.BANK_ACCOUNT.HOLDER_NAME,
          accountNumber: technician.paymentDetails.bankAccount?.accountNumber || PAYMENT_DEFAULTS.BANK_ACCOUNT.ACCOUNT_NUMBER,
          ifscCode: technician.paymentDetails.bankAccount?.ifscCode || PAYMENT_DEFAULTS.BANK_ACCOUNT.IFSC_CODE,
          bankName: PAYMENT_DEFAULTS.BANK_ACCOUNT.BANK_NAME,
        },
        upiId: technician.paymentDetails.upiId || PAYMENT_DEFAULTS.UPI_ID,
        withdrawalPreference: technician.paymentDetails.withdrawalPreference || PAYMENT_DEFAULTS.WITHDRAWAL_PREFERENCE,
      };
    }

    return {
      bankAccount: {
        holderName: PAYMENT_DEFAULTS.BANK_ACCOUNT.HOLDER_NAME,
        accountNumber: PAYMENT_DEFAULTS.BANK_ACCOUNT.ACCOUNT_NUMBER,
        ifscCode: PAYMENT_DEFAULTS.BANK_ACCOUNT.IFSC_CODE,
        bankName: PAYMENT_DEFAULTS.BANK_ACCOUNT.BANK_NAME,
      },
      upiId: PAYMENT_DEFAULTS.UPI_ID,
      withdrawalPreference: PAYMENT_DEFAULTS.WITHDRAWAL_PREFERENCE,
    };
  }

  private formatDocuments(technician: ITechnician): DocumentData[] {
    return Array.isArray(technician.documents) ? technician.documents : [];
  }

  // private formatSecuritySettings(user: IUser): SecuritySettingsFormatted {
  //   return {
  //     lastLogin: user.lastLogin || SECURITY_SETTINGS_DEFAULTS.LAST_LOGIN,
  //     loginDevice: user.loginDevice || SECURITY_SETTINGS_DEFAULTS.LOGIN_DEVICE,
  //   };
  // }
}