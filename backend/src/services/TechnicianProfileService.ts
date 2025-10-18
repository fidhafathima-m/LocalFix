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
import { ResponseHelper } from "../utils/responseHelper";
import {
  TECHNICIAN_PROFILE_MESSAGES,
  VERIFICATION_STATUS,
  DOCUMENT_STATUS,
  PROFILE_SECTIONS,
  AVAILABILITY_DEFAULTS,
  WEEKLY_AVAILABILITY_DAYS,
  PAYMENT_DEFAULTS,
  PERSONAL_INFO_DEFAULTS,
  SKILLS_DEFAULTS,
  SECURITY_SETTINGS_DEFAULTS,
} from "../constants";

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

  async getTechnicianProfile(technicianId: string): Promise<any> {
    try {
      console.log('=== START getTechnicianProfile ===');
      console.log('Technician ID:', technicianId);
      
      const technician = await this.technicianRepository.findByUserId(technicianId);
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_PROFILE_NOT_FOUND);
      }

      console.log('Raw technician from DB (before toObject):', technician);
      console.log('Has paymentDetails?', 'paymentDetails' in technician);
      console.log('Technician paymentDetails:', technician.paymentDetails);

      // Convert to plain object
      const technicianObj = technician.toObject ? technician.toObject() : technician;
      console.log('Technician as plain object:', technicianObj);
      console.log('Plain object has paymentDetails?', 'paymentDetails' in technicianObj);
      console.log('Plain object paymentDetails:', technicianObj.paymentDetails);

      // Format profile data for frontend
      const profileData = {
        // Include all basic technician fields
        ...technicianObj,
        
        // Your formatted sections
        [PROFILE_SECTIONS.PERSONAL_INFORMATION]: this.formatPersonalInfo(technician, user),
        [PROFILE_SECTIONS.IDENTITY_VERIFICATION]: this.formatIdentityVerification(technician),
        [PROFILE_SECTIONS.SKILLS_SERVICES]: this.formatSkillsServices(technician),
        [PROFILE_SECTIONS.AVAILABILITY_PREFERENCES]: this.formatAvailabilityPreferences(technician),
        [PROFILE_SECTIONS.BANK_PAYMENT_DETAILS]: this.formatBankPaymentDetails(technician),
        [PROFILE_SECTIONS.DOCUMENTS]: this.formatDocuments(technician),
        [PROFILE_SECTIONS.SECURITY_SETTINGS]: this.formatSecuritySettings(user),
      };

      console.log('Final profileData:', profileData);
      console.log('Final profileData.paymentDetails:', profileData.paymentDetails);
      console.log('=== END getTechnicianProfile ===');

      return ResponseHelper.success(TECHNICIAN_PROFILE_MESSAGES.PROFILE_RETRIEVED, {
        data: {
          profile: profileData,
        },
      });
    } catch (error) {
      console.error("Get technician profile error:", error);
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_FETCH_PROFILE);
    }
  }

  async updatePersonalInformation(
    technicianId: string,
    updateData: PersonalInfoUpdate
  ): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      // Update technician personal info
      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id.toString(),
        {
          personalInfo: {
            ...technician.personalInfo,
            fullName: updateData.fullName || technician.personalInfo?.fullName || PERSONAL_INFO_DEFAULTS.FULL_NAME,
            phoneNumber: updateData.phoneNumber || technician.personalInfo?.phoneNumber || PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
            dateOfBirth: updateData.dateOfBirth || technician.personalInfo?.dateOfBirth || PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
            gender: updateData.gender || technician.personalInfo?.gender || PERSONAL_INFO_DEFAULTS.GENDER,
            languages: updateData.languages || technician.personalInfo?.languages || PERSONAL_INFO_DEFAULTS.LANGUAGES,
            bio: updateData.bio || technician.bio || PERSONAL_INFO_DEFAULTS.BIO,
          },
          ...(updateData.profilePicture && {
            profilePictureUrl: updateData.profilePicture,
          }),
        }
      );

      // Update user email if provided
      if (updateData.email && updateData.email !== user.email) {
        await this.technicianProfileRepository.updateUser(technicianId, {
          email: updateData.email,
        });
      }

      return ResponseHelper.success(TECHNICIAN_PROFILE_MESSAGES.PERSONAL_INFO_UPDATED, {
        data: {
          profile: updatedTechnician,
        },
      });
    } catch (error) {
      console.error("Update personal information error:", error);
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PERSONAL_INFO);
    }
  }

  async updateIdentityVerification(
    technicianId: string,
    updateData: IdentityVerificationUpdate
  ): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);

      if (!technician) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id.toString(),
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

      return ResponseHelper.success(TECHNICIAN_PROFILE_MESSAGES.IDENTITY_VERIFICATION_UPDATED, {
        data: {
          profile: updatedTechnician,
        },
      });
    } catch (error) {
      console.error("Update identity verification error:", error);
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_IDENTITY_VERIFICATION);
    }
  }

  async updateSkillsServices(
    technicianId: string,
    updateData: SkillsServicesUpdate
  ): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);

      if (!technician) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id.toString(),
        {
          services: updateData.services || technician.services || SKILLS_DEFAULTS.SERVICES,
          experienceYears: updateData.experienceYears || technician.experienceYears || SKILLS_DEFAULTS.EXPERIENCE_YEARS,
          basePrices: updateData.basePrices || technician.basePrices || SKILLS_DEFAULTS.BASE_PRICES,
        }
      );

      return ResponseHelper.success(TECHNICIAN_PROFILE_MESSAGES.SKILLS_SERVICES_UPDATED, {
        data: {
          profile: updatedTechnician,
        },
      });
    } catch (error) {
      console.error("Update skills services error:", error);
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_SKILLS_SERVICES);
    }
  }

  async updateAvailabilityPreferences(
    technicianId: string,
    updateData: AvailabilityPreferencesUpdate
  ): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);

      if (!technician) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id.toString(),
        {
          availability: {
            isAvailable: updateData.isAvailable ?? technician.availability?.isAvailable ?? AVAILABILITY_DEFAULTS.IS_AVAILABLE,
            serviceAreas: updateData.serviceAreas || technician.workAreas || [],
            workRadius: updateData.workRadius || technician.serviceRadiusKm || AVAILABILITY_DEFAULTS.WORK_RADIUS,
            // weeklyAvailability: updateData.weeklyAvailability || technician.availability?.weeklyAvailability || this.getDefaultWeeklyAvailability(),
          },
          workAreas: updateData.serviceAreas || technician.workAreas || [],
          serviceRadiusKm: updateData.workRadius || technician.serviceRadiusKm || AVAILABILITY_DEFAULTS.WORK_RADIUS,
        }
      );

      return ResponseHelper.success(TECHNICIAN_PROFILE_MESSAGES.AVAILABILITY_UPDATED, {
        data: {
          profile: updatedTechnician,
        },
      });
    } catch (error) {
      console.error("Update availability preferences error:", error);
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_AVAILABILITY);
    }
  }

  async updateBankPaymentDetails(
    technicianId: string,
    updateData: BankPaymentUpdate
  ): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);

      if (!technician) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      const updatedTechnician = await this.technicianProfileRepository.updateTechnician(
        technician._id.toString(),
        {
          paymentDetails: {
            ...technician.paymentDetails,
            bankAccount: {
              holderName: updateData.accountHolderName || technician.paymentDetails?.bankAccount?.holderName || PAYMENT_DEFAULTS.BANK_ACCOUNT.HOLDER_NAME,
              accountNumber: updateData.accountNumber || technician.paymentDetails?.bankAccount?.accountNumber || PAYMENT_DEFAULTS.BANK_ACCOUNT.ACCOUNT_NUMBER,
              ifscCode: updateData.ifscCode || technician.paymentDetails?.bankAccount?.ifscCode || PAYMENT_DEFAULTS.BANK_ACCOUNT.IFSC_CODE,
            },
            upiId: updateData.upiId || technician.paymentDetails?.upiId || PAYMENT_DEFAULTS.UPI_ID,
            withdrawalPreference: updateData.withdrawalPreference || technician.paymentDetails?.withdrawalPreference || PAYMENT_DEFAULTS.WITHDRAWAL_PREFERENCE,
          },
        }
      );

      return ResponseHelper.success(TECHNICIAN_PROFILE_MESSAGES.BANK_PAYMENT_UPDATED, {
        data: {
          profile: updatedTechnician,
        },
      });
    } catch (error) {
      console.error("Update bank payment details error:", error);
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_BANK_PAYMENT);
    }
  }

  async updatePassword(
    technicianId: string,
    updateData: SecuritySettingsUpdate
  ): Promise<any> {
    try {
      const user = await this.userRepository.findById(technicianId);

      if (!user) {
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

      return ResponseHelper.success(TECHNICIAN_PROFILE_MESSAGES.PASSWORD_UPDATED);
    } catch (error) {
      console.error("Update password error:", error);
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PASSWORD);
    }
  }

  async uploadDocument(
    technicianId: string,
    documentData: {
      type: string;
      fileUrl: string;
      fileName: string;
    }
  ): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);

      if (!technician) {
        return ResponseHelper.notFound(TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
      }

      if (!documentData.type) {
        return ResponseHelper.badRequest(TECHNICIAN_PROFILE_MESSAGES.DOCUMENT_TYPE_REQUIRED);
      }

      if (!documentData.fileUrl) {
        return ResponseHelper.badRequest(TECHNICIAN_PROFILE_MESSAGES.FILE_URL_REQUIRED);
      }

      if (!documentData.fileName) {
        return ResponseHelper.badRequest(TECHNICIAN_PROFILE_MESSAGES.FILE_NAME_REQUIRED);
      }

      const newDocument = {
        type: documentData.type,
        url: documentData.fileUrl,
        fileName: documentData.fileName,
        uploadedAt: new Date(),
        verified: false,
        status: DOCUMENT_STATUS.PENDING,
      };

      const updatedTechnician = await this.technicianProfileRepository.addDocument(
        technician._id.toString(),
        newDocument
      );

      return ResponseHelper.success(TECHNICIAN_PROFILE_MESSAGES.DOCUMENT_UPLOADED, {
        data: {
          document: newDocument,
        },
      });
    } catch (error) {
      console.error("Upload document error:", error);
      return ResponseHelper.error(TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_DOCUMENT);
    }
  }

  // Helper methods to format data for frontend
  private formatPersonalInfo(technician: any, user: any) {
    return {
      fullName: technician.personalInfo?.fullName || technician.displayName || PERSONAL_INFO_DEFAULTS.FULL_NAME,
      phoneNumber: technician.personalInfo?.phoneNumber || technician.phone || PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
      email: user.email,
      dateOfBirth: technician.personalInfo?.dateOfBirth || PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
      gender: technician.personalInfo?.gender || PERSONAL_INFO_DEFAULTS.GENDER,
      languages: technician.personalInfo?.languages || PERSONAL_INFO_DEFAULTS.LANGUAGES,
      bio: technician.bio || PERSONAL_INFO_DEFAULTS.BIO,
      profilePictureUrl: technician.profilePictureUrl || PERSONAL_INFO_DEFAULTS.PROFILE_PICTURE_URL,
    };
  }

  private formatIdentityVerification(technician: any) {
    return {
      verificationStatus: technician.identityVerification?.verificationStatus || VERIFICATION_STATUS.PENDING,
      governmentIdType: technician.identityVerification?.governmentIdType,
      governmentIdNumber: technician.identityVerification?.governmentIdNumber,
      idDocument: technician.identityVerification?.idDocument,
    };
  }

  private formatSkillsServices(technician: any) {
    return {
      services: technician.services || SKILLS_DEFAULTS.SERVICES,
      experienceYears: technician.experienceYears || SKILLS_DEFAULTS.EXPERIENCE_YEARS,
      basePrices: technician.basePrices || SKILLS_DEFAULTS.BASE_PRICES,
    };
  }

  private formatAvailabilityPreferences(technician: any) {
    return {
      isAvailable: technician.availability?.isAvailable ?? AVAILABILITY_DEFAULTS.IS_AVAILABLE,
      serviceAreas: technician.workAreas || [],
      workRadius: technician.serviceRadiusKm || AVAILABILITY_DEFAULTS.WORK_RADIUS,
      // weeklyAvailability: technician.availability?.weeklyAvailability || this.getDefaultWeeklyAvailability(),
    };
  }

  private formatBankPaymentDetails(technician: any) {
    console.log('Technician data in formatBankPaymentDetails:', technician);
    
    // Check if we have paymentDetails directly on technician
    if (technician.paymentDetails) {
      console.log('Found paymentDetails on technician:', technician.paymentDetails);
      return technician.paymentDetails;
    }
    
    // Check if we have bankPaymentDetails (from the formatted structure)
    if (technician.bankPaymentDetails) {
      console.log('Found bankPaymentDetails:', technician.bankPaymentDetails);
      return technician.bankPaymentDetails;
    }

    // Fallback to flat structure (old application data)
    console.log('Using fallback structure');
    return {
      bankAccount: {
        holderName: technician.accountHolderName || PAYMENT_DEFAULTS.BANK_ACCOUNT.HOLDER_NAME,
        accountNumber: technician.accountNumber || PAYMENT_DEFAULTS.BANK_ACCOUNT.ACCOUNT_NUMBER,
        ifscCode: technician.ifscCode || PAYMENT_DEFAULTS.BANK_ACCOUNT.IFSC_CODE,
        bankName: technician.bankName || PAYMENT_DEFAULTS.BANK_ACCOUNT.BANK_NAME
      },
      upiId: technician.upiId || PAYMENT_DEFAULTS.UPI_ID,
      withdrawalPreference: technician.withdrawalPreference || PAYMENT_DEFAULTS.WITHDRAWAL_PREFERENCE
    };
  }

  private formatDocuments(technician: any) {
    return technician.documents || [];
  }

  private formatSecuritySettings(user: any) {
    return {
      lastLogin: user.lastLogin || SECURITY_SETTINGS_DEFAULTS.LAST_LOGIN,
      loginDevice: user.loginDevice || SECURITY_SETTINGS_DEFAULTS.LOGIN_DEVICE,
    };
  }

  // private getDefaultWeeklyAvailability() {
  //   const availability: any = {};

  //   WEEKLY_AVAILABILITY_DAYS.forEach((day) => {
  //     availability[day] = {
  //       enabled: !AVAILABILITY_DEFAULTS.DAYS_OFF.includes(day),
  //       startTime: AVAILABILITY_DEFAULTS.START_TIME,
  //       endTime: AVAILABILITY_DEFAULTS.END_TIME,
  //     };
  //   });

  //   return availability;
  // }
}