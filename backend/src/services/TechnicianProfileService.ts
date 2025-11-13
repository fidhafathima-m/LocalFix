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
import { RRule } from "rrule";
import { LoggerService } from "./LoggerService";
import { IOrderService } from "@/interfaces/services/user/IOrderService";
import { IEmailService } from "@/interfaces/services/IEmailService";
import { INotificationService } from "@/interfaces/services/INotificationService";
import { ILogger } from "@/interfaces/utils/ILogger";

export class TechnicianProfileService implements ITechnicianProfileService {
  private technicianRepository: ITechnicianRepository;
  private technicianProfileRepository: ITechnicianProfileRepository;
  private userRepository: IUserRepository;
  private userAddressRepository: IUserAddressRepository;
  private logger: ILogger;
  private orderService: IOrderService;
  private emailService: IEmailService;
  private notificationService: INotificationService;

  constructor(
    technicianRepository: ITechnicianRepository,
    technicianProfileRepository: ITechnicianProfileRepository,
    userRepository: IUserRepository,
    userAddressRepository: IUserAddressRepository,
    orderService: IOrderService,
    emailService: IEmailService,
    notificationService: INotificationService,
    logger: ILogger
  ) {
    this.technicianRepository = technicianRepository;
    this.technicianProfileRepository = technicianProfileRepository;
    this.userRepository = userRepository;
    this.userAddressRepository = userAddressRepository;
    this.logger = logger;
    this.orderService = orderService;
    this.emailService = emailService;
    this.notificationService = notificationService;
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
          idType:
            updateData.identityVerification?.idType ||
            technician.identityVerification?.idType,
          idNumber:
            updateData.identityVerification?.idNumber ||
            technician.identityVerification?.idNumber,
          verified: false,
          verificationStatus: VERIFICATION_STATUS.PENDING,
        },
      };

      if (updateData.personalInfo) {
        updatePayload.personalInfo = {
          ...technician.personalInfo,
          ...updateData.personalInfo,
          address: {
            ...technician.personalInfo?.address,
            ...updateData.personalInfo.address,
          },
        };
      }

      const updatedTechnician =
        await this.technicianProfileRepository.updateTechnician(
          technician._id!.toString(),
          updatePayload
        );

      if (!updatedTechnician) {
        console.error("Repository returned null/undefined");
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
      console.error("Update identity verification error:", error);
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
      console.log(
        "UPDATE AVAILABILITY - Starting update for technician:",
        technicianId
      );

      const technician = await this.technicianRepository.findByUserId(
        technicianId
      );
      const user = await this.userRepository.findById(technicianId);

      if (!technician || !user) {
        return ResponseHelper.notFound(
          TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      // Extract work areas and service radius
      const workAreas = updateData.workAreas || updateData.serviceAreas || [];
      const serviceRadiusKm =
        updateData.serviceRadiusKm || updateData.workRadius || 10;

      // Build update payload
      const updateDataForRepo: Partial<ITechnician> = {
        workAreas: workAreas,
        serviceRadiusKm: serviceRadiusKm,
      };

      // Add availability preferences if provided
      if (updateData.availability) {
        updateDataForRepo.availability = {
          isAvailable: updateData.availability.isAvailable,
          weeklyPattern: updateData.availability.weeklyPattern,
        };
      }

      // Update technician with the new data
      const updatedTechnician =
        await this.technicianProfileRepository.updateTechnician(
          technician._id!.toString(),
          updateDataForRepo
        );

      if (!updatedTechnician) {
        console.error(
          "UPDATE AVAILABILITY - Failed to update technician work preferences"
        );
        return ResponseHelper.error(
          TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_AVAILABILITY
        );
      }

      // Process slot rules and availability records if availability data is provided
      if (updateData.availability) {
        try {
          await this.processAvailabilityData(
            technicianId,
            updateData.availability
          );
        } catch (availabilityError) {
          console.error(
            "UPDATE AVAILABILITY - Error processing availability data:",
            availabilityError
          );
        }
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
      console.error("UPDATE AVAILABILITY - Error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error(
        TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_AVAILABILITY
      );
    }
  }
  private async processAvailabilityData(
    technicianId: string,
    availabilityData: {
      isAvailable: boolean;
      weeklyPattern?: {
        [key: string]: {
          available: boolean;
          startTime: string;
          endTime: string;
        };
      };
      availableWeeks?: number[];
    }
  ): Promise<void> {
    try {
      const SlotRule = require("../models/technician/SlotRuleSchema").default;
      const TechnicianAvailability =
        require("../models/technician/TechnicianAvailabilitySchema").default;

      const technicianObjectId = new Types.ObjectId(technicianId);

      if (!availabilityData.weeklyPattern) {
        return;
      }

      const weeklyPattern = availabilityData.weeklyPattern;

      const durationMonths = 3;
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + durationMonths);

      // Deactivate existing slot rules
      await SlotRule.updateMany(
        {
          technicianId: technicianObjectId,
          isActive: true,
        },
        {
          $set: { isActive: false },
        }
      );

      const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ];
      const dayMap: { [key: string]: any } = {
        monday: RRule.MO,
        tuesday: RRule.TU,
        wednesday: RRule.WE,
        thursday: RRule.TH,
        friday: RRule.FR,
        saturday: RRule.SA,
        sunday: RRule.SU,
      };

      let createdRulesCount = 0;

      for (const day of days) {
        const dayData = weeklyPattern[day];

        if (dayData && dayData.available) {
          try {
            // Create simple weekly RRule for this specific day
            const rule = new RRule({
              freq: RRule.WEEKLY,
              byweekday: [dayMap[day]],
              dtstart: startDate,
              until: endDate,
            });

            const slotRule = new SlotRule({
              technicianId: technicianObjectId,
              name: `${
                day.charAt(0).toUpperCase() + day.slice(1)
              } Availability`,
              rruleString: rule.toString(),
              startTime: dayData.startTime,
              endTime: dayData.endTime,
              slotDurationMinutes: 60,
              bookingBufferBeforeMinutes: 0,
              bookingBufferAfterMinutes: 0,
              maxBookingsPerSlot: 1,
              effectiveFrom: startDate,
              isActive: true,
            });

            await slotRule.save();
            createdRulesCount++;
          } catch (error) {
            console.error(`Error creating slot rule for ${day}:`, error);
          }
        }
      }

      // Delete existing availability records
      const deleteResult = await TechnicianAvailability.deleteMany({
        technicianId: technicianObjectId,
        date: { $gte: startDate, $lte: endDate },
      });

      // Get active slot rules and generate availability records
      const activeSlotRules = await SlotRule.find({
        technicianId: technicianObjectId,
        isActive: true,
      });

      let totalRecordsCreated = 0;

      for (const slotRule of activeSlotRules) {
        try {
          const rrule = RRule.fromString(slotRule.rruleString);
          const occurrences = rrule.between(startDate, endDate, true);

          for (const occurrence of occurrences) {
            const timeSlots = slotRule.generateSlotsForDate(occurrence);

            const availabilityRecord = new TechnicianAvailability({
              technicianId: technicianObjectId,
              date: occurrence,
              timeSlots: timeSlots,
              isRecurring: true,
              slotRuleId: slotRule._id,
            });

            await availabilityRecord.save();
            totalRecordsCreated++;
          }
        } catch (ruleError) {
          console.error(
            `Error processing slot rule ${slotRule.name}:`,
            ruleError
          );
        }
      }
    } catch (error) {
      console.error("Error in processAvailabilityData:", error);
      throw error;
    }
  }

  private generateTimeSlotsForDate(
    date: Date,
    startTime: string,
    endTime: string,
    slotDurationMinutes: number
  ): any[] {
    const timeSlots = [];

    // Parse start and end times
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    const startDateTime = new Date(date);
    startDateTime.setHours(startHour, startMinute, 0, 0);

    const endDateTime = new Date(date);
    endDateTime.setHours(endHour, endMinute, 0, 0);

    let currentTime = new Date(startDateTime);

    while (currentTime < endDateTime) {
      const slotEnd = new Date(
        currentTime.getTime() + slotDurationMinutes * 60000
      );

      // Don't create slots that extend beyond the end time
      if (slotEnd > endDateTime) {
        break;
      }

      timeSlots.push({
        start: new Date(currentTime),
        end: new Date(slotEnd),
        status: "available",
        isBooked: false,
      });

      currentTime = slotEnd;
    }

    return timeSlots;
  }

  private formatTimeToString(date: Date): string {
    return date.toTimeString().slice(0, 5); // Returns "HH:MM" format
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
  async getSlotRules(
    technicianId: string
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

      const slotRules = await this.getSlotRulesFromRepository(technicianId);

      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(
        technician,
        user
      );

      return ResponseHelper.success("Slot rules retrieved successfully", {
        profile: profileDto,
        slotRules: slotRules,
      });
    } catch (error: unknown) {
      console.error("Get slot rules error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error("Failed to get slot rules");
    }
  }

  async getTechnicianAvailability(
    technicianId: string
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

      // Fetch actual availability from TechnicianAvailability collection
      const availabilityData =
        await this.getTechnicianAvailabilityFromRepository(technicianId);

      const profileDto = TechnicianProfileMapper.toTechnicianProfileDto(
        technician,
        user
      );

      return ResponseHelper.success(
        "Technician availability retrieved successfully",
        {
          profile: profileDto,
          availability: availabilityData,
        }
      );
    } catch (error: unknown) {
      console.error("Get technician availability error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return ResponseHelper.error("Failed to get technician availability");
    }
  }

  // Update the helper method to fetch real availability data
  private async getTechnicianAvailabilityFromRepository(
    technicianId: string
  ): Promise<any[]> {
    try {
      const TechnicianAvailability =
        require("../models/technician/TechnicianAvailabilitySchema").default;

      // Fetch availability records for this technician
      const availabilityRecords = await TechnicianAvailability.find({
        technicianId: new Types.ObjectId(technicianId),
      }).sort({ date: 1 });

      this.logger.info(
        "Availability Data from technciian",
        availabilityRecords
      );

      return availabilityRecords;
    } catch (error) {
      console.error(
        "Error fetching technician availability from repository:",
        error
      );
      return [];
    }
  }

  private async getSlotRulesFromRepository(
    technicianId: string
  ): Promise<any[]> {
    try {
      const SlotRule = require("../models/technician/SlotRuleSchema").default;

      // Fetch actual slot rules from database
      const slotRules = await SlotRule.find({
        technicianId: new Types.ObjectId(technicianId),
        isActive: true,
      });

      return slotRules;
    } catch (error) {
      console.error("Error fetching slot rules from repository:", error);
      return [];
    }
  }

  private async handleTechnicianUnavailability(
    technicianId: string,
    unavailableDate: Date
  ): Promise<void> {
    const context = {
      operation: "handleTechnicianUnavailability",
      data: { technicianId, unavailableDate },
    };

    try {
      this.logger.info("Handling technician unavailability", context);

      const orders = await this.orderService.getOrdersByTechnicianAndDate(
        technicianId,
        unavailableDate
      );

      if (orders.length === 0) {
        this.logger.info("No orders found for the specified date", context);
        return;
      }

      this.logger.info(`Found ${orders.length} orders to process`, {
        ...context,
        orderCount: orders.length,
      });

      // Process each order
      for (const order of orders) {
        try {
          const orderContext = {
            ...context,
            orderId: order._id.toString(),
          };

          this.logger.info("Processing order for cancellation", orderContext);

          const updatedOrder = await this.orderService.updateOrderStatus(
            order._id.toString(),
            "cancelled",
            "system",
            "Technician unavailable"
          );

          if (updatedOrder.success) {
            // Get customer details from populated order
            const customer = order.userId as any;

            // Send email notification
            if (customer?.email) {
              await this.emailService.sendTechnicianUnavailableNotification(
                customer.email,
                customer.fullName || "Customer",
                (order.technicianId as any)?.displayName || "Technician",
                new Date(order.scheduledAt).toLocaleDateString(),
                order.serviceName,
                order._id.toString()
              );
            }

            // Create in-app notification
            await this.notificationService.createTechnicianUnavailableNotification(
              customer._id.toString(),
              (order.technicianId as any)?.displayName || "Technician",
              order.serviceName,
              new Date(order.scheduledAt).toLocaleDateString(),
              order._id.toString()
            );

            this.logger.info("Order processed successfully", orderContext);
          }
        } catch (orderError) {
          this.logger.error("Error processing order", {
            ...context,
            orderId: order._id.toString(),
            error:
              orderError instanceof Error
                ? orderError.message
                : "Unknown error",
          });
          // Continue with other orders even if one fails
        }
      }

      // Notify technician about the impact
      if (orders.length > 0) {
        await this.notificationService.createAvailabilityChangeImpactNotification(
          technicianId,
          orders.length,
          unavailableDate.toLocaleDateString()
        );
      }

      this.logger.info("Technician unavailability handled successfully", {
        ...context,
        processedOrders: orders.length,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error handling technician unavailability", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      // Don't throw error to avoid breaking the main availability update
    }
  }
}
