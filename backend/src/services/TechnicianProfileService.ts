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
      return {
        success: false,
        message: "Technician profile not found",
      };
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
      personalInformation: this.formatPersonalInfo(technician, user),
      identityVerification: this.formatIdentityVerification(technician),
      skillsServices: this.formatSkillsServices(technician),
      availabilityPreferences: this.formatAvailabilityPreferences(technician),
      bankPaymentDetails: this.formatBankPaymentDetails(technician),
      documents: this.formatDocuments(technician),
      securitySettings: this.formatSecuritySettings(user),
    };

    console.log('Final profileData:', profileData);
    console.log('Final profileData.paymentDetails:', profileData.paymentDetails);
    console.log('=== END getTechnicianProfile ===');

    return {
      success: true,
      message: "Profile data retrieved successfully",
      data: {
        profile: profileData,
      },
    };
  } catch (error) {
    console.error("Get technician profile error:", error);
    return {
      success: false,
      message: "Failed to fetch profile data",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

  async updatePersonalInformation(
    technicianId: string,
    updateData: PersonalInfoUpdate
  ): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      // Update technician personal info
      const updatedTechnician =
        await this.technicianProfileRepository.updateTechnician(
          technician._id.toString(),
          {
            personalInfo: {
              ...technician.personalInfo,
              fullName:
                updateData.fullName || technician.personalInfo?.fullName,
              phoneNumber:
                updateData.phoneNumber || technician.personalInfo?.phoneNumber,
              dateOfBirth:
                updateData.dateOfBirth || technician.personalInfo?.dateOfBirth,
              gender: updateData.gender || technician.personalInfo?.gender,
              languages:
                updateData.languages || technician.personalInfo?.languages,
              bio: updateData.bio || technician.bio,
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

      return {
        success: true,
        message: "Personal information updated successfully",
        data: {
          profile: updatedTechnician,
        },
      };
    } catch (error) {
      console.error("Update personal information error:", error);
      return {
        success: false,
        message: "Failed to update personal information",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updateIdentityVerification(
    technicianId: string,
    updateData: IdentityVerificationUpdate
  ): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );

      if (!technician) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      const updatedTechnician =
        await this.technicianProfileRepository.updateTechnician(
          technician._id.toString(),
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
              verificationStatus: "pending",
            },
          }
        );

      return {
        success: true,
        message: "Identity verification updated successfully",
        data: {
          profile: updatedTechnician,
        },
      };
    } catch (error) {
      console.error("Update identity verification error:", error);
      return {
        success: false,
        message: "Failed to update identity verification",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updateSkillsServices(
    technicianId: string,
    updateData: SkillsServicesUpdate
  ): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );

      if (!technician) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      const updatedTechnician =
        await this.technicianProfileRepository.updateTechnician(
          technician._id.toString(),
          {
            services: updateData.services || technician.services,
            experienceYears:
              updateData.experienceYears || technician.experienceYears,
            basePrices: updateData.basePrices || technician.basePrices,
          }
        );

      return {
        success: true,
        message: "Skills and services updated successfully",
        data: {
          profile: updatedTechnician,
        },
      };
    } catch (error) {
      console.error("Update skills services error:", error);
      return {
        success: false,
        message: "Failed to update skills and services",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updateAvailabilityPreferences(
    technicianId: string,
    updateData: AvailabilityPreferencesUpdate
  ): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );

      if (!technician) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      const updatedTechnician =
        await this.technicianProfileRepository.updateTechnician(
          technician._id.toString(),
          {
            availability: {
              isAvailable:
                updateData.isAvailable ?? technician.availability?.isAvailable,
              serviceAreas: updateData.serviceAreas || technician.workAreas,
              workRadius: updateData.workRadius || technician.serviceRadiusKm,
              weeklyAvailability:
                updateData.weeklyAvailability ||
                technician.availability?.weeklyAvailability,
            },
            workAreas: updateData.serviceAreas || technician.workAreas,
            serviceRadiusKm:
              updateData.workRadius || technician.serviceRadiusKm,
          }
        );

      return {
        success: true,
        message: "Availability preferences updated successfully",
        data: {
          profile: updatedTechnician,
        },
      };
    } catch (error) {
      console.error("Update availability preferences error:", error);
      return {
        success: false,
        message: "Failed to update availability preferences",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updateBankPaymentDetails(
    technicianId: string,
    updateData: BankPaymentUpdate
  ): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );

      if (!technician) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      const updatedTechnician =
        await this.technicianProfileRepository.updateTechnician(
          technician._id.toString(),
          {
            paymentDetails: {
              ...technician.paymentDetails,
              bankAccount: {
                holderName:
                  updateData.accountHolderName ||
                  technician.paymentDetails?.bankAccount?.holderName,
                accountNumber:
                  updateData.accountNumber ||
                  technician.paymentDetails?.bankAccount?.accountNumber,
                ifscCode:
                  updateData.ifscCode ||
                  technician.paymentDetails?.bankAccount?.ifscCode,
              },
              upiId: updateData.upiId || technician.paymentDetails?.upiId,
              withdrawalPreference:
                updateData.withdrawalPreference ||
                technician.paymentDetails?.withdrawalPreference,
            },
          }
        );

      return {
        success: true,
        message: "Bank and payment details updated successfully",
        data: {
          profile: updatedTechnician,
        },
      };
    } catch (error) {
      console.error("Update bank payment details error:", error);
      return {
        success: false,
        message: "Failed to update bank and payment details",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updatePassword(
    technicianId: string,
    updateData: SecuritySettingsUpdate
  ): Promise<any> {
    try {
      const user = await this.userRepository.findById(technicianId);

      if (!user) {
        return {
          success: false,
          message: "User not found",
        };
      }

      // Verify current password
      if (updateData.currentPassword) {
        const isCurrentPasswordValid =
          await this.technicianProfileRepository.verifyPassword(
            technicianId,
            updateData.currentPassword
          );

        if (!isCurrentPasswordValid) {
          return {
            success: false,
            message: "Current password is incorrect",
          };
        }
      }

      // Update password
      if (updateData.newPassword) {
        if (updateData.newPassword !== updateData.confirmPassword) {
          return {
            success: false,
            message: "New password and confirm password do not match",
          };
        }

        await this.userRepository.updatePassword(
          technicianId,
          updateData.newPassword
        );
      }

      return {
        success: true,
        message: "Password updated successfully",
      };
    } catch (error) {
      console.error("Update password error:", error);
      return {
        success: false,
        message: "Failed to update password",
        error: error instanceof Error ? error.message : "Unknown error",
      };
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
      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );

      if (!technician) {
        return {
          success: false,
          message: "Technician not found",
        };
      }

      const newDocument = {
        type: documentData.type,
        url: documentData.fileUrl,
        fileName: documentData.fileName,
        uploadedAt: new Date(),
        verified: false,
        status: "pending",
      };

      const updatedTechnician =
        await this.technicianProfileRepository.addDocument(
          technician._id.toString(),
          newDocument
        );

      return {
        success: true,
        message: "Document uploaded successfully",
        data: {
          document: newDocument,
        },
      };
    } catch (error) {
      console.error("Upload document error:", error);
      return {
        success: false,
        message: "Failed to upload document",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Helper methods to format data for frontend
  private formatPersonalInfo(technician: any, user: any) {
    return {
      fullName: technician.personalInfo?.fullName || technician.displayName,
      phoneNumber: technician.personalInfo?.phoneNumber || technician.phone,
      email: user.email,
      dateOfBirth: technician.personalInfo?.dateOfBirth,
      gender: technician.personalInfo?.gender,
      languages: technician.personalInfo?.languages || [],
      bio: technician.bio,
      profilePictureUrl: technician.profilePictureUrl,
    };
  }

  private formatIdentityVerification(technician: any) {
    return {
      verificationStatus:
        technician.identityVerification?.verificationStatus || "pending",
      governmentIdType: technician.identityVerification?.governmentIdType,
      governmentIdNumber: technician.identityVerification?.governmentIdNumber,
      idDocument: technician.identityVerification?.idDocument,
    };
  }

  private formatSkillsServices(technician: any) {
    return {
      services: technician.services || [],
      experienceYears: technician.experienceYears || 0,
      basePrices: technician.basePrices || {},
    };
  }

  private formatAvailabilityPreferences(technician: any) {
    return {
      isAvailable: technician.availability?.isAvailable ?? true,
      serviceAreas: technician.workAreas || [],
      workRadius: technician.serviceRadiusKm || 10,
      weeklyAvailability:
        technician.availability?.weeklyAvailability ||
        this.getDefaultWeeklyAvailability(),
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
      holderName: technician.accountHolderName || '',
      accountNumber: technician.accountNumber || '',
      ifscCode: technician.ifscCode || '',
      bankName: technician.bankName || ''
    },
    upiId: technician.upiId || '',
    withdrawalPreference: technician.withdrawalPreference || 'auto'
  };
}

  private formatDocuments(technician: any) {
    return technician.documents || [];
  }

  private formatSecuritySettings(user: any) {
    return {
      lastLogin: user.lastLogin,
      loginDevice: user.loginDevice,
    };
  }

  private getDefaultWeeklyAvailability() {
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];
    const availability: any = {};

    days.forEach((day) => {
      availability[day] = {
        enabled: day !== "sunday",
        startTime: "09:00",
        endTime: "19:00",
      };
    });

    return availability;
  }
}
