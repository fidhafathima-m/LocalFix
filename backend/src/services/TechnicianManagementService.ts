import { TechnicianManagementRepository } from '../repositories/admin/TechnicianManagemnetRepository';
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
  AdminITechnicianApplication,
} from '../interfaces/admin/ITechnicianManagement';
import { Types } from 'mongoose';
import { emailService } from './EmailService';
import { ITechnicianManagementService } from '../interfaces/services/admin/ITechnicianManagementService';
import { ITechnicianManagementRepository } from '../interfaces/repository/admin/ITechnicianManagementRepository';
import { ResponseHelper } from '../utils/responseHelper';
import {
  TECHNICIAN_MANAGEMENT_MESSAGES,
  STATUS_MAPPING,
  FILTER_DEFAULTS,
  RATING_FILTER_MAPPING,
  STATUS_FILTER_MAPPING,
  VALID_STATUS_VALUES,
  PERSONAL_INFO_DEFAULTS,
  DOCUMENT_FIELDS,
  SEARCH_FIELDS,
  PAGINATION_DEFAULTS,
  EMAIL_CONFIG,
  BANK_DETAILS_DEFAULTS,
  TechnicianStatus,
  APPLICATION_STATUS,
} from '../constants';
import { IUser } from '../interfaces/user/IUser';
import { IAddress } from '../interfaces/user/IAddress';
import { IUserAddress } from '../models/UserAddressSchema';
import {
  ApplicationFiltersDto,
  ApplicationListDto,
  ApplicationListResponseDto,
  RejectApplicationRequestDto,
  SingleTechnicianResponseDto,
  TechnicianFiltersDto,
  TechnicianListDto,
  TechnicianListResponseDto,
  UpdateStatusRequestDto,
} from '../interfaces/dtos/technicianDtos';
import { TechnicianAvailabilityService } from './AvailabilityService';
import { RRule } from 'rrule';
import { INotificationService } from '../interfaces/services/INotificationService';
import { ILogger } from '../interfaces/utils/ILogger';
import { toTechnicianDetailDto } from '../mappers/technicianMappers';
import {
  toApplicationDetailDto,
  toApplicationListDto,
} from '../mappers/applicationMapper';
import { SocketService } from './SocketService';

interface DocumentInfo {
  url: string;
  verified: boolean;
  uploadedAt: Date;
  type: string;
}

interface FormattedDocuments {
  [key: string]: DocumentInfo;
}

interface PersonalInfo {
  fullName: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: string | Date | undefined;
  languages: string[];
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface FilterQuery {
  status?: string | { $in: string[] };
  services?: string;
  averageRating?: { $gte?: number; $lte?: number };
  workAreas?: { $in: RegExp[] };
  $or?: Array<{ [key: string]: RegExp }>;
  'skills.services'?: string;
  [key: string]: unknown;
}

interface TechnicianFilter {
  status?: string | { $in: string[] };
  services?: string | { $in: string[] };
  averageRating?: { $gte?: number; $lte?: number };
  workAreas?: { $in: RegExp[] };
  $or?: Array<{ [key: string]: RegExp }>;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  search?: string;
  [key: string]: unknown;
}

export class TechnicianManagementService
  implements ITechnicianManagementService
{
  private _technicianRepository: ITechnicianManagementRepository;
  private _logger: ILogger;
  private _socketService: SocketService;

  constructor(
    technicianRepository: ITechnicianManagementRepository,
    socketService: SocketService,
    logger: ILogger
  ) {
    this._technicianRepository = technicianRepository;
    this._logger = logger;
    this._socketService = socketService;
  }

  private formatApplicationDocuments(documents: unknown): FormattedDocuments {
    if (!documents || typeof documents !== 'object') return {};

    const formatted: FormattedDocuments = {};

    DOCUMENT_FIELDS.forEach(key => {
      const doc = (documents as Record<string, any>)[key];
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
    filters: TechnicianFiltersDto & {
      search?: string;
      status?: string;
      service?: string;
    }
  ): Promise<TechnicianListResponseDto> {
    const context = {
      operation: 'getAllTechnicians',
      filters,
      timestamp: new Date().toString(),
    };

    try {
      this._logger.info('Fetching all technicians with filters', context);

      // Ensure page and limit are numbers
      const page = Number(filters.page) || PAGINATION_DEFAULTS.PAGE;
      const limit = Number(filters.limit) || PAGINATION_DEFAULTS.LIMIT;
      const { search, status, service } = filters;

      const technicians = await this._technicianRepository.findTechnicians(
        {}, // pass empty filter object since we're handling filters in the method
        search,
        status,
        service
      );

      // Pagination - ensure all calculations use numbers
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTechnicians = technicians.slice(startIndex, endIndex);

      const technicianDtos = paginatedTechnicians.map(tech =>
        this.mapToTechnicianDto(tech)
      );

      this._logger.debug('Technicians retrieved with filters', {
        ...context,
        technicianCount: technicians.length,
        paginatedCount: technicianDtos.length,
      });

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIANS_RETRIEVED,
        {
          technicians: technicianDtos,
          pagination: {
            page: page, // Ensure this is number
            limit: limit, // Ensure this is number
            total: technicians.length,
            pages: Math.ceil(technicians.length / limit),
          },
        }
      ) as TechnicianListResponseDto; // Add type assertion
    } catch (error) {
      console.error('Error fetching technicians with filters:', error);
      this._logger.error('Failed to get technicians with filters', {
        ...context,
        error: error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_TECHNICIANS
      ) as TechnicianListResponseDto;
    }
  }

  private mapAdminTechnicianToListDto(
    adminTechnician: IAdminTechnician
  ): TechnicianListDto {
    return {
      _id: adminTechnician._id.toString(),
      userId: adminTechnician.userId?.toString() || '',
      displayName: adminTechnician.displayName || '',
      email: adminTechnician.email || '',
      phone: adminTechnician.phone || '',
      services: adminTechnician.services || [],
      status: adminTechnician.status || '',
      experienceYears: adminTechnician.experienceYears || 0,
      ratingCount: adminTechnician.ratingCount || 0,
      averageRating: adminTechnician.averageRating || 0,
      totalJobs: adminTechnician.totalJobs || 0,
      completedJobs: adminTechnician.completedJobs || 0,
      createdAt: adminTechnician.createdAt || new Date(),
      profilePictureUrl: adminTechnician.profilePictureUrl,

      address: adminTechnician.personalInfo?.address,
      workAreas: adminTechnician.workAreas,
      serviceRadiusKm: adminTechnician.serviceRadiusKm,
    };
  }
  async getTechnicianById(id: string): Promise<SingleTechnicianResponseDto> {
    const context = {
      operation: 'getTechnicianById',
      technicianId: id,
      timestamp: new Date().toISOString(),
    };
    try {
      this._logger.info('Fetching technician by ID', context);
      const technician =
        await this._technicianRepository.findTechnicianById(id);

      if (!technician) {
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      this._logger.debug('Technician found, converting to admin view', context);
      const adminTechnician = await this.convertToAdminTechnician(technician);

      const technicianDto = toTechnicianDetailDto(adminTechnician);

      this._logger.info('Successfully retrieved technician', context);

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_RETRIEVED,
        {
          technician: technicianDto,
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch technician', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_TECHNICIAN
      );
    }
  }

  private async convertToAdminTechnician(
    technician: ITechnician
  ): Promise<IAdminTechnician> {
    const context = {
      operation: 'convertToAdminTechnician',
      technicianId: technician._id.toString(),
      timestamp: new Date().toISOString(),
    };
    try {
      this._logger.debug('Converting technician to admin view', context);
      const user = await this._technicianRepository.findUserById(
        technician.userId as Types.ObjectId
      );

      // Get technician's application data for personal info
      const application =
        await this._technicianRepository.findApplicationByTechnicianId(
          technician._id.toString()
        );

      const userAddress = await this._technicianRepository.findUserAddress(
        technician.userId as Types.ObjectId
      );

      const availabilityData = await this.getAvailabilityForFrontend(
        technician._id.toString()
      );
      let finalAvailability = availabilityData;
      if (technician.availability?.weeklyPattern) {
        finalAvailability = {
          ...availabilityData,
          weeklyPattern: technician.availability.weeklyPattern,
        };
      }
      const mapStatus = (
        status: string,
        application?: ITechnicianApplication
      ): 'pending' | 'approved' | 'rejected' | 'suspended' => {
        if (
          application &&
          [
            APPLICATION_STATUS.SUBMITTED,
            APPLICATION_STATUS.UNDER_REVIEW,
            TechnicianStatus.PENDING,
          ].includes(application.status as any)
        ) {
          return TechnicianStatus.PENDING as 'pending';
        }

        const mappedStatus =
          STATUS_MAPPING[status as keyof typeof STATUS_MAPPING];
        return (
          mappedStatus ||
          (status as 'pending' | 'approved' | 'rejected' | 'suspended')
        );
      };

      const status = mapStatus(technician.status, application || undefined);

      const getPersonalInfo = (
        technician: ITechnician,
        application?: ITechnicianApplication,
        userAddress?: IAddress | null | IUserAddress
      ): PersonalInfo => {
        const hasRealTechnicianData =
          technician.personalInfo &&
          (technician.personalInfo.gender !== PERSONAL_INFO_DEFAULTS.GENDER ||
            technician.personalInfo.phoneNumber !==
              PERSONAL_INFO_DEFAULTS.PHONE_NUMBER ||
            technician.personalInfo.dateOfBirth !==
              PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH);

        let personalInfo: PersonalInfo;

        if (hasRealTechnicianData) {
          personalInfo = {
            fullName:
              technician.personalInfo?.fullName || technician.displayName,
            gender:
              technician.personalInfo?.gender || PERSONAL_INFO_DEFAULTS.GENDER,
            phoneNumber:
              technician.personalInfo?.phoneNumber ||
              technician.phone ||
              PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
            dateOfBirth:
              technician.personalInfo?.dateOfBirth ||
              PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
            languages: Array.isArray(technician.personalInfo?.languages)
              ? technician.personalInfo.languages
              : PERSONAL_INFO_DEFAULTS.LANGUAGES,
            address: undefined,
          };
        } else if (application?.personal) {
          const appPersonal = application.personal;
          const appSkills = application.skills;
          personalInfo = {
            fullName: appPersonal.fullName || technician.displayName,
            gender: appPersonal.gender || PERSONAL_INFO_DEFAULTS.GENDER,
            phoneNumber:
              appPersonal.phoneNumber ||
              technician.phone ||
              PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
            dateOfBirth:
              appPersonal.dateOfBirth || PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
            languages: Array.isArray(appSkills.languages)
              ? appSkills.languages
              : PERSONAL_INFO_DEFAULTS.LANGUAGES,
            address: undefined,
          };
        } else {
          personalInfo = {
            fullName: technician.displayName,
            gender: PERSONAL_INFO_DEFAULTS.GENDER,
            phoneNumber:
              technician.phone || PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
            dateOfBirth: PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
            languages: PERSONAL_INFO_DEFAULTS.LANGUAGES,
            address: undefined,
          };
        }

        if (userAddress) {
          personalInfo.address = {
            street: userAddress.street || PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
            city: userAddress.city || PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
            state: userAddress.state || PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
            pincode:
              userAddress.pincode || PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
          };
        } else if (technician.personalInfo?.address) {
          const address = technician.personalInfo.address;
          personalInfo.address = {
            street: address.street || PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
            city: address.city || PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
            state: address.state || PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
            pincode: address.pincode || PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
          };
        } else if (application?.personal?.address) {
          const address = application.personal.address;
          personalInfo.address = {
            street: address.street || PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
            city: address.city || PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
            state: address.state || PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
            pincode: address.pincode || PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
          };
        }

        return personalInfo;
      };

      const personalInfo = getPersonalInfo(
        technician,
        application || undefined,
        userAddress
      );

      const getDocuments = (
        technician: ITechnician,
        application?: ITechnicianApplication
      ): FormattedDocuments => {
        if (application?.documents) {
          const formattedDocs = this.formatApplicationDocuments(
            application.documents
          );
          return formattedDocs;
        }

        // Fallback for profile picture
        const fallbackDocs: FormattedDocuments = {};
        if (technician.profilePictureUrl) {
          fallbackDocs.profilePhoto = {
            url: technician.profilePictureUrl,
            verified: true,
            uploadedAt: new Date(),
            type: 'profilePhoto',
          };
        }

        return fallbackDocs;
      };

      // Format documents
      const documents = getDocuments(technician, application || undefined);

      // Create the admin technician view
      const adminTechnician: IAdminTechnician = {
        _id: technician._id,
        userId: technician.userId,
        displayName: technician.displayName,
        email: user?.email || '',
        phone: user?.phone || technician.phone || '',
        bio: technician.bio || '',
        services: technician.services || [],
        experienceYears: technician.experienceYears || 0,
        workAreas: technician.workAreas || [],
        serviceRadiusKm: technician.serviceRadiusKm || 0,
        status: status,
        averageRating: technician.averageRating || 0,
        ratingCount: technician.ratingCount || 0,
        totalJobs: technician.totalJobs || 0,
        completedJobs: technician.completedJobs || 0,
        ongoingJobs: technician.ongoingJobs || 0,
        totalEarnings: technician.totalEarnings || 0,
        profilePictureUrl: technician.profilePictureUrl || '',
        createdAt: technician.createdAt,
        updatedAt: technician.updatedAt,
        user: user
          ? {
              email: user.email || '',
              phone: user.phone || '',
              fullName: user.fullName || technician.displayName,
              createdAt: user.createdAt,
            }
          : undefined,
        personalInfo: personalInfo,
        identityVerification: technician.identityVerification,
        documents: documents,
        availability: technician.availability || finalAvailability,
        suspensionReason: technician.suspensionReason,
        suspendedAt: technician.suspendedAt,
      };
      this._logger.debug(
        'Successfully converted technician to admin view',
        context
      );

      return adminTechnician;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to convert technician to admin view', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private async getAvailabilityForFrontend(technicianId: string): Promise<any> {
    try {
      // Get active slot rules
      const slotRules =
        await this._technicianRepository.getActiveSlotRules(technicianId);

      // Convert slot rules to frontend schedule format
      const schedule = await this.convertSlotRulesToSchedule(
        slotRules,
        technicianId
      );

      return {
        isAvailable: true,
        schedule: schedule,
        hasAvailability: schedule.some(day => day.slots.length > 0),
        slotRulesCount: slotRules.length,
        workRadius: slotRules[0]?.workRadius || 20,
      };
    } catch (error) {
      console.error('Error getting availability for frontend:', error);
      return {
        isAvailable: false,
        schedule: [],
        hasAvailability: false,
      };
    }
  }

  private async convertSlotRulesToSchedule(
    slotRules: any[],
    technicianId: string
  ): Promise<any[]> {
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
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

    // Get upcoming availability for the next 7 days to see actual slots
    const upcomingAvailability =
      await this._technicianRepository.getUpcomingAvailability(technicianId, 7);

    return days.map(day => {
      // Check if this day has any active slot rules
      const hasRule = slotRules.some(rule => {
        try {
          if (!rule.rruleString || typeof rule.rruleString !== 'string') {
            return false;
          }

          const rrule = RRule.fromString(rule.rruleString);
          const byweekday = rrule.origOptions.byweekday;

          if (Array.isArray(byweekday)) {
            return byweekday.includes(dayMap[day]);
          } else if (byweekday !== undefined && byweekday !== null) {
            return byweekday === dayMap[day];
          }
          return false;
        } catch (error) {
          console.error(`Error parsing RRule for rule ${rule._id}:`, error);
          return false;
        }
      });

      // Get slots for this day from upcoming availability
      const daySlots = this.getSlotsForDay(upcomingAvailability, day);

      return {
        day: day,
        slots: daySlots,
        available: hasRule && daySlots.length > 0,
      };
    });
  }

  private getSlotsForDay(upcomingAvailability: any[], day: string): any[] {
    const slots: any[] = [];

    upcomingAvailability.forEach(avail => {
      const availDay = avail.date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayMap: { [key: string]: number } = {
        sunday: 0,
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
        saturday: 6,
      };

      if (availDay === dayMap[day]) {
        // Add available slots for this day
        if (avail.timeSlots && Array.isArray(avail.timeSlots)) {
          avail.timeSlots.forEach((slot: any) => {
            if (slot.status === 'available') {
              slots.push({
                start:
                  slot.start instanceof Date
                    ? this.formatTime(slot.start)
                    : slot.start || '09:00',
                end:
                  slot.end instanceof Date
                    ? this.formatTime(slot.end)
                    : slot.end || '18:00',
              });
            }
          });
        }
      }
    });

    return slots;
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
  private convertAvailabilityToSchedule(availabilityData: any): any[] {
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    // If we have specific availability data, use it
    if (availabilityData.schedule && Array.isArray(availabilityData.schedule)) {
      return availabilityData.schedule;
    }

    // Fallback: Create a basic schedule based on slot rules
    return days.map(day => ({
      day,
      slots: [],
      available: false,
    }));
  }

  async updateTechnicianStatus(
    id: string,
    statusData: UpdateStatusRequestDto
  ): Promise<SingleTechnicianResponseDto> {
    const context = {
      operation: 'updateTechnicianStatus',
      technicianId: id,
      newStatus: statusData.status,
      timestamp: new Date().toISOString(),
    };
    try {
      this._logger.info('Updating technician status', context);
      const {
        status,
        emailNotification = EMAIL_CONFIG.DEFAULT_NOTIFICATION,
        reason,
      } = statusData;

      if (
        !status ||
        !VALID_STATUS_VALUES.includes(
          status as 'approved' | 'rejected' | 'suspended'
        )
      ) {
        this._logger.warn('Invalid status provided', {
          ...context,
          providedStatus: status,
        });
        return ResponseHelper.badRequest(
          TECHNICIAN_MANAGEMENT_MESSAGES.VALID_STATUS_REQUIRED
        );
      }
      // Prepare update data
      const updateData: Record<string, unknown> = {};

      // Store suspension/rejection reason and timestamp
      if (
        status === TechnicianStatus.SUSPENDED ||
        status === TechnicianStatus.REJECTED
      ) {
        updateData.suspensionReason = reason;
        updateData.suspendedAt = new Date();
        this._logger.debug('Setting suspension data', {
          ...context,
          reason,
          suspendedAt: updateData.suspendedAt,
        });
      } else if (status === TechnicianStatus.APPROVED) {
        // Clear suspension data when approving/reactivating
        updateData.suspensionReason = undefined;
        updateData.suspendedAt = undefined;
        this._logger.debug('Clearing suspension data for approval', context);
      }

      const technician =
        await this._technicianRepository.updateTechnicianStatus(
          id,
          status,
          updateData
        );

      if (!technician) {
        this._logger.warn('Technician not found for status update', context);
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      this._logger.debug('Technician status updated in repository', context);

      // Get user data for email
      const user = await this._technicianRepository.findUserById(
        technician.userId as Types.ObjectId
      );

      let emailSent = false;
      let emailMessage = '';

      // Send email notification if requested and user email exists
      if (emailNotification && user?.email) {
        this._logger.debug('Sending email notification', {
          ...context,
          userEmail: user.email,
          notificationType: status,
        });
        if (status === TechnicianStatus.APPROVED) {
          emailSent = await emailService.sendApplicationApprovalEmail(
            user.email,
            technician.displayName
          );
          emailMessage = emailSent
            ? TECHNICIAN_MANAGEMENT_MESSAGES.APPROVAL_EMAIL_SENT
            : TECHNICIAN_MANAGEMENT_MESSAGES.EMAIL_SEND_FAILED;

          await this._technicianRepository.updateApplicationStatus(
            id,
            APPLICATION_STATUS.APPROVED
          );
        } else {
          emailSent = await emailService.sendStatusUpdateEmail(
            user.email,
            technician.displayName,
            status,
            reason
          );
          emailMessage = emailSent
            ? TECHNICIAN_MANAGEMENT_MESSAGES.STATUS_EMAIL_SENT.replace(
                '${status}',
                status
              )
            : TECHNICIAN_MANAGEMENT_MESSAGES.EMAIL_SEND_FAILED;
        }
        this._logger.info(
          `Email notification ${emailSent ? 'sent' : 'failed'}`,
          {
            ...context,
            emailSent,
          }
        );
      }

      const adminTechnician = await this.convertToAdminTechnician(technician);
      const technicianDto = toTechnicianDetailDto(adminTechnician);

      this._logger.info('Successfully updated technician status', context);

      return ResponseHelper.success(
        `${TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_STATUS_UPDATED.replace(
          '${status}',
          status
        )}${emailMessage}`,
        {
          technician: technicianDto,
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to update technician status', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_UPDATE_STATUS
      );
    }
  }

  async getTechnicianStats(): Promise<TechnicianStatsResponse> {
    const context = {
      operation: 'getTechnicianStats',
      timestamp: new Date().toISOString(),
    };
    try {
      this._logger.info('Fetching technician statistics', context);
      const stats = await this._technicianRepository.getTechnicianStats();

      this._logger.info('Successfully retrieved technician statistics', {
        ...context,
        stats,
      });

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_STATS_RETRIEVED,
        stats
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch technician statistics', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_STATS
      );
    }
  }

  async getPendingApplications(
    filters: ApplicationFiltersDto & { search?: string; service?: string }
  ): Promise<ApplicationListResponseDto> {
    const context = {
      operation: 'getPendingApplications',
      filters,
      timestamp: new Date().toString(),
    };

    try {
      this._logger.info('Fetching pending applications with filters', context);

      // Ensure page and limit are numbers
      const page = Number(filters.page) || PAGINATION_DEFAULTS.PAGE;
      const limit = Number(filters.limit) || PAGINATION_DEFAULTS.LIMIT;
      const { search, service } = filters;

      const applications = await this._technicianRepository.findApplications(
        {}, // pass empty filter object
        search,
        service
      );

      // Pagination - ensure all calculations use numbers
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedApplications = applications.slice(startIndex, endIndex);

      const applicationDtos = paginatedApplications.map(app =>
        this.mapToApplicationDto(app)
      );

      this._logger.debug('Applications retrieved with filters', {
        ...context,
        applicationCount: applications.length,
        paginatedCount: applicationDtos.length,
      });

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATIONS_RETRIEVED,
        {
          applications: applicationDtos,
          pagination: {
            page: page, // Ensure this is number
            limit: limit, // Ensure this is number
            total: applications.length,
            pages: Math.ceil(applications.length / limit),
          },
        }
      ) as ApplicationListResponseDto; // Add type assertion
    } catch (error) {
      console.error('Error fetching applications with filters:', error);
      this._logger.error('Failed to get applications with filters', {
        ...context,
        error: error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_APPLICATIONS
      ) as ApplicationListResponseDto;
    }
  }

  async approveApplication(id: string): Promise<ApplicationListResponseDto> {
    const context = {
      operation: 'approveApplication',
      applicationId: id,
      timestamp: new Date().toISOString(),
    };
    try {
      this._logger.info('Approving application', context);
      const application =
        await this._technicianRepository.findApplicationById(id);
      if (!application) {
        this._logger.warn('Application not found for approval', context);
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_NOT_FOUND
        );
      }

      const availabilityService = new TechnicianAvailabilityService(
        this._logger
      );

      // Update application status
      const updatedApplication =
        await this._technicianRepository.updateApplicationStatus(
          id,
          APPLICATION_STATUS.APPROVED
        );

      if (!updatedApplication) {
        this._logger.error(
          'Failed to update application status in repostory',
          context
        );
        return ResponseHelper.badRequest(
          TECHNICIAN_MANAGEMENT_MESSAGES.UPDATE_APPLICATION_FAILED
        );
      }

      this._logger.info('Application status updated to approved', context);

      // Update user's application status
      await this._technicianRepository.updateUserApplicationStatus(
        application.technicianId as Types.ObjectId,
        APPLICATION_STATUS.APPROVED
      );

      this._logger.info('User application status updated', context);

      // Update or create technician record
      const technician =
        await this._technicianRepository.findOrCreateTechnician(application);

      this._logger.debug('Technician record processed', {
        ...context,
        technicianId: technician._id?.toString(),
      });

      let locationCoordinates: [number, number] | null = null;

      if (application.identity?.location) {
        try {
          let locationData: any;

          if (typeof application.identity.location === 'string') {
            locationData = JSON.parse(application.identity.location);
          } else {
            locationData = application.identity.location;
          }

          if (
            locationData.coordinates &&
            Array.isArray(locationData.coordinates)
          ) {
            const [lng, lat] = locationData.coordinates;
            if (
              typeof lng === 'number' &&
              typeof lat === 'number' &&
              lng !== 0 &&
              lat !== 0
            ) {
              locationCoordinates = [lng, lat];
            }
          }
        } catch (error) {
          console.error('Error parsing location data:', error);
        }
      }

      if (technician && locationCoordinates) {
        await this._technicianRepository.updateTechnicianLocation(
          technician._id.toString(),
          locationCoordinates
        );

        this._logger.info('Technician location updated in repository', {
          ...context,
          technicianId: technician._id?.toString(),
          locationCoordinates,
        });
      }
      if (technician && application.availability) {
        try {
          // Convert application availability format to technician availability format
          const technicianAvailability =
            this.convertApplicationAvailabilityToTechnicianAvailability(
              application.availability
            );

          this._logger.info(
            'Creating technician availability from application',
            context
          );

          await availabilityService.createTechnicianAvailabilityFromApplication(
            technician._id.toString(),
            technicianAvailability
          );

          // VERIFY the slot rules were actually created with correct timings
          const slotRules = await this._technicianRepository.getActiveSlotRules(
            technician._id.toString()
          );

          this._logger.debug('Fetching active slot rules of technician', {
            ...context,
            technicianId: technician._id?.toString(),
            slotRulesCount: slotRules.length,
          });

          // Additional verification - check if the timings match
          const applicationPattern = application.availability?.weeklyPattern;
          if (applicationPattern) {
            const mondayTiming = applicationPattern.monday;
            if (mondayTiming && mondayTiming.available) {
              // Get all active slot rules to check if any match Monday's timing
              const hasCorrectMondayTiming = slotRules.some(rule => {
                return (
                  rule.startTime === mondayTiming.startTime &&
                  rule.endTime === mondayTiming.endTime
                );
              });

              if (!hasCorrectMondayTiming) {
                this._logger.warn(
                  'Monday timing mismatch in generated slot rules',
                  {
                    expected: `${mondayTiming.startTime}-${mondayTiming.endTime}`,
                    actual: slotRules.map(r => `${r.startTime}-${r.endTime}`),
                  }
                );
              } else {
                this._logger.info('Monday timing verified correctly', {
                  expected: `${mondayTiming.startTime}-${mondayTiming.endTime}`,
                  ruleCount: slotRules.length,
                });
              }
            }
          }

          if (slotRules.length === 0) {
            this._logger.error('Failed to create slot rules', context);
            throw new Error('Failed to create slot rules during approval');
          }
        } catch (availabilityError) {
          this._logger.error(
            'Failed to transfer availability during approval',
            {
              ...context,
              error: availabilityError,
            }
          );
          console.error(
            'CRITICAL ERROR in availability transfer:',
            availabilityError
          );
        }
      } else {
      }
      if (application.documents && technician) {
        const technicianDocuments: any[] = [];

        Object.entries(application.documents).forEach(
          ([type, doc]: [string, any]) => {
            if (doc && doc.url) {
              technicianDocuments.push({
                type: type,
                fileName: doc.filename || `${type}_document`,
                url: doc.url,
                uploadedAt: doc.uploadedAt || new Date(),
                verified: true,
                status: 'approved' as const,
                verifiedAt: new Date(),
              });
            }
          }
        );

        await this._technicianRepository.updateTechnicianDocuments(
          technician._id.toString(),
          technicianDocuments
        );
        this._logger.info('Updated technician documents during approval', {
          ...context,
          technicianId: technician._id?.toString(),
          technicianDocuments,
        });
      }

      let languagesArray: string[] = [];

      if (application.skills?.languages) {
        const rawLanguages: any = application.skills.languages;

        if (Array.isArray(rawLanguages)) {
          languagesArray = rawLanguages;
        } else if (typeof rawLanguages === 'string') {
          try {
            const parsed = JSON.parse(rawLanguages);
            languagesArray = Array.isArray(parsed) ? parsed : [rawLanguages];
          } catch {
            if ((rawLanguages as string).includes(',')) {
              languagesArray = (rawLanguages as string)
                .split(',')
                .map((lang: string) => lang.trim());
            } else {
              languagesArray = [rawLanguages as string];
            }
          }
        }
      }

      let addressData: Record<string, unknown> = {};
      if (application.identity?.address) {
        if (typeof application.identity.address === 'string') {
          try {
            addressData = JSON.parse(application.identity.address);
          } catch (e) {
            console.error('Error parsing address JSON:', e);
            addressData = {};
          }
        } else {
          addressData = application.identity.address as Record<string, unknown>;
        }
      }

      const identityVerificationData = {
        idType: this.mapIdType(application.identity?.idType || ''),
        idNumber: application.identity?.idNumber || '',
        idDocument: application.documents?.idProof?.url || '',
        verificationStatus: 'approved' as const,
        verified: true,
        verifiedAt: new Date(),
      };

      if (technician) {
        await this._technicianRepository.updateTechnicianPersonalInfo(
          technician._id.toString(),
          {
            ...technician.personalInfo,
            languages: languagesArray,
            address: addressData,
          }
        );

        this._logger.info('Updated technician profile info during approval', {
          ...context,
          technicianId: technician._id?.toString(),
          personalInfo: technician.personalInfo,
        });

        await this._technicianRepository.updateTechnicianIdentityVerification(
          technician._id.toString(),
          identityVerificationData
        );
        this._logger.info(
          'Updated technician identification and verification during approval',
          {
            ...context,
            technicianId: technician._id?.toString(),
            identityVerificationData,
          }
        );

        if (application.documents) {
          const technicianDocuments = Object.entries(application.documents).map(
            ([type, doc]: [string, any]) => ({
              _id: new Types.ObjectId().toString(),
              type: type,
              fileName: doc.filename || `${type}_document`,
              url: doc.url,
              uploadedAt: doc.uploadedAt || new Date(),
              verified: true,
              status: 'approved' as const,
              verifiedAt: new Date(),
            })
          );

          await this._technicianRepository.updateTechnicianDocuments(
            technician._id.toString(),
            technicianDocuments
          );

          this._logger.info('Updated technician documents during approval', {
            ...context,
            technicianId: technician._id?.toString(),
            technicianDocuments,
          });
        }
      }

      if (application.bank && technician) {
        const bankData = application.bank;

        const paymentDetails = {
          bankAccount: {
            holderName: bankData.accountHolderName?.trim() || '',
            accountNumber: bankData.accountNumber || '',
            ifscCode: bankData.ifscCode || '',
            bankName: bankData.bankName || '',
          },
          upiId: bankData.upiId || '',
          withdrawalPreference: 'auto' as const,
        };

        const updateResult =
          await this._technicianRepository.updateTechnicianPaymentDetails(
            technician._id.toString(),
            paymentDetails
          );

        this._logger.info(
          'Updated technician payment details during approval',
          {
            ...context,
            technicianId: technician._id?.toString(),
            paymentDetails,
          }
        );
      }

      // Send approval email
      let emailSent = false;
      let emailMessage = '';

      if (application.email) {
        emailSent = await emailService.sendApplicationApprovalEmail(
          application.email,
          application.personal?.fullName || 'Technician'
        );
        emailMessage = emailSent
          ? TECHNICIAN_MANAGEMENT_MESSAGES.APPROVAL_EMAIL_SENT
          : TECHNICIAN_MANAGEMENT_MESSAGES.EMAIL_SEND_FAILED;
      }

      const applicationDto = toApplicationListDto(updatedApplication);

      this._logger.info(`Email notification ${emailSent ? 'sent' : 'failed'}`, {
        ...context,
        emailSent,
      });

      if (technician) {
        await this._socketService.notifyApplicationStatus(
          technician._id.toString(),
          'approved',
          application.personal?.fullName || 'Technician'
        );
      }

      return ResponseHelper.success(
        `${TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_APPROVED}${emailMessage}`,
        {
          applications: [applicationDto],
          pagination: PAGINATION_DEFAULTS.SINGLE_RESULT,
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to approve technician', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_APPROVE_APPLICATION
      );
    }
  }
  private convertApplicationAvailabilityToTechnicianAvailability(
    applicationAvailability: any
  ): any {
    if (!applicationAvailability) {
      return {
        isAvailable: true,
        schedule: [],
      };
    }

    const availability =
      applicationAvailability.availability || applicationAvailability;
    const weeklyPattern = availability.weeklyPattern;

    if (!weeklyPattern) {
      return {
        isAvailable: true,
        schedule: [],
      };
    }

    // Convert the weekly pattern to the schedule format expected by the technician
    const schedule = Object.entries(weeklyPattern).map(
      ([day, dayData]: [string, any]) => {
        const slots = [];

        if (dayData.available && dayData.startTime && dayData.endTime) {
          slots.push({
            start: dayData.startTime,
            end: dayData.endTime,
          });
        }

        return {
          day: day.toLowerCase(),
          slots: slots,
          available: dayData.available || false,
          // Store the individual day timing for proper RRule generation
          startTime: dayData.startTime,
          endTime: dayData.endTime,
        };
      }
    );

    const result = {
      isAvailable: true,
      schedule: schedule,
      workRadius: applicationAvailability.workRadius || 20,
      serviceAreas: applicationAvailability.serviceAreas || [],
      emergencyService: applicationAvailability.emergencyService || false,
      afterHoursService: applicationAvailability.afterHoursService || false,
      weeklyPattern: weeklyPattern,
      originalAvailability: availability,
    };

    return result;
  }
  async rejectApplication(
    id: string,
    rejectData: RejectApplicationRequestDto
  ): Promise<ApplicationListResponseDto> {
    const context = {
      operation: 'rejectApplication',
      technicianId: id,
      rejectData,
      timestamp: new Date().toString(),
    };
    try {
      this._logger.info('Rejecting technician', context);
      const {
        rejectionReason,
        emailNotification = EMAIL_CONFIG.DEFAULT_NOTIFICATION,
      } = rejectData;

      const application =
        await this._technicianRepository.findApplicationById(id);
      if (!application) {
        this._logger.warn('Technician application not found', context);
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_NOT_FOUND
        );
      }

      if (application.technicianId) {
        const technician = await this._technicianRepository.findTechnicianById(
          application.technicianId.toString()
        );

        if (technician) {
          this._logger.info('Technician found by technciianId to reject', {
            ...context,
            applicationId: application.technicianId.toString(),
          });
          await this._technicianRepository.updateTechnicianStatus(
            application.technicianId.toString(),
            TechnicianStatus.REJECTED
          );
          this._logger.info('Technician status updated to reject', {
            ...context,
            applicationId: application.technicianId.toString(),
            status: TechnicianStatus.REJECTED,
          });
        } else {
          const technicianByUser =
            await this._technicianRepository.findTechnicianByUserId(
              application.technicianId.toString()
            );
          if (technicianByUser) {
            this._logger.info('Technician found by userId to reject', {
              ...context,
              applicationId: application.technicianId.toString(),
            });
            await this._technicianRepository.updateTechnicianStatus(
              technicianByUser._id.toString(),
              TechnicianStatus.REJECTED
            );
            this._logger.info('Technician status updated to reject', {
              ...context,
              applicationId: application.technicianId.toString(),
              status: TechnicianStatus.REJECTED,
            });
          }
        }
      }

      const updatedApplication =
        await this._technicianRepository.updateApplicationStatus(
          id,
          APPLICATION_STATUS.REJECTED,
          {
            rejectionReason,
            rejectedAt: new Date(),
          }
        );

      if (!updatedApplication) {
        this._logger.warn("Technician's status update failed", context);
        return ResponseHelper.badRequest(
          TECHNICIAN_MANAGEMENT_MESSAGES.UPDATE_APPLICATION_FAILED
        );
      }

      this._logger.info("Technician's status updated", {
        ...context,
        technicianId: id,
        status: APPLICATION_STATUS.REJECTED,
      });

      await this._technicianRepository.updateUserApplicationStatus(
        application.technicianId as Types.ObjectId,
        APPLICATION_STATUS.REJECTED
      );

      // Send rejection email
      let emailSent = false;
      let emailMessage = '';

      if (emailNotification && application.email) {
        emailSent = await emailService.sendApplicationRejectionEmail(
          application.email,
          application.personal?.fullName || 'Applicant',
          rejectionReason
        );
        emailMessage = emailSent
          ? TECHNICIAN_MANAGEMENT_MESSAGES.REJECTION_EMAIL_SENT
          : TECHNICIAN_MANAGEMENT_MESSAGES.EMAIL_SEND_FAILED;
      }

      const applicationDto = toApplicationListDto(updatedApplication);

      this._logger.info(`Email notification ${emailSent ? 'sent' : 'failed'}`, {
        ...context,
        emailSent,
      });

      return ResponseHelper.success(
        `${TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_REJECTED}${emailMessage}`,
        {
          applications: [applicationDto],
          pagination: PAGINATION_DEFAULTS.SINGLE_RESULT,
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to reject technician', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_REJECT_APPLICATION
      );
    }
  }
  async getApplicationById(id: string): Promise<ApplicationListResponseDto> {
    const context = {
      operation: 'getApplicationById',
      technicianId: id,
      timestamp: new Date().toString(),
    };
    try {
      this._logger.info('Fetching application by id', context);
      const application =
        await this._technicianRepository.findApplicationById(id);
      if (!application) {
        this._logger.warn('Application not found', context);
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_NOT_FOUND
        );
      }
      this._logger.info('Application found in repository', {
        ...context,
        technicianId: id,
      });

      // Get user data
      const user = await this._technicianRepository.updateUserApplicationStatus(
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

      const applicationDto = toApplicationDetailDto(applicationData);

      this._logger.info('Application retrieved', {
        ...context,
        technicianId: application.technicianId,
        userId: user,
      });

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_RETRIEVED,
        {
          applications: [applicationDto],
          pagination: PAGINATION_DEFAULTS.SINGLE_RESULT,
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch application by id', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_APPLICATION
      );
    }
  }

  async getApplicationStats(): Promise<ApplicationStatsResponse> {
    const context = {
      operation: 'getApplicationStats',
      timestamp: new Date().toString(),
    };
    try {
      this._logger.info('Fetching application stats', context);
      const stats = await this._technicianRepository.getApplicationStats();

      this._logger.info('Application stats retrieved', {
        ...context,
        stats,
      });

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.APPLICATION_STATS_RETRIEVED,
        stats
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch application stats', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_APPLICATION_STATS
      );
    }
  }

  async getTechnicianByApplicationId(
    applicationId: string
  ): Promise<TechnicianListResponseDto> {
    const context = {
      operation: 'getTechnicianByApplicationId',
      applicationId: applicationId,
      timestamp: new Date().toString(),
    };
    try {
      this._logger.info('Fetchnicng technician by application id', context);
      const technician =
        await this._technicianRepository.findTechnicianByApplicationId(
          applicationId
        );

      if (!technician) {
        this._logger.warn('Technician not found for application', context);
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_NOT_FOUND_FOR_APPLICATION
        );
      }

      const adminTechnician = await this.convertToAdminTechnician(technician);

      const technicianDto = toTechnicianDetailDto(adminTechnician);

      this._logger.info('Technician by application retrieved', {
        ...context,
        technicians: [technicianDto],
        pagination: PAGINATION_DEFAULTS.SINGLE_RESULT,
      });

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_BY_APPLICATION_RETRIEVED,
        {
          technicians: [technicianDto],
          pagination: PAGINATION_DEFAULTS.SINGLE_RESULT,
        }
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch technician by application id', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(
        TECHNICIAN_MANAGEMENT_MESSAGES.FAILED_FETCH_TECHNICIAN_BY_APP
      );
    }
  }
  async getPublicTechnicians(
    filters: TechnicianFiltersDto
  ): Promise<TechnicianListResponseDto> {
    const context = {
      operation: 'getPublicTechnicians',
      filters,
      timestamp: new Date().toString(),
    };
    try {
      this._logger.info('fetching public technicians', context);
      const {
        service,
        page = PAGINATION_DEFAULTS.PAGE,
        limit = PAGINATION_DEFAULTS.LIMIT,
        search,
        location,
        sortBy = 'default',
      } = filters;

      const repoFilters: TechnicianFilter = {
        status: 'approved',
      };

      if (service) {
        repoFilters.services = { $in: [service] };
      }

      // Search filter for public technicians
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        repoFilters.$or = [
          { displayName: searchRegex },
          { services: searchRegex },
          { workAreas: searchRegex },
          { 'personalInfo.address.city': searchRegex },
          { 'personalInfo.address.state': searchRegex },
        ];
      }

      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;

      let sortOptions: any = {};

      switch (sortBy) {
        case 'rating':
          // Sort by rating (highest first), then by number of ratings, then by experience
          sortOptions = {
            averageRating: -1,
            ratingCount: -1,
            experienceYears: -1,
            createdAt: -1,
          };
          break;

        case 'experience':
          // Sort by experience (highest first), then by rating, then by number of ratings
          sortOptions = {
            experienceYears: -1,
            averageRating: -1,
            ratingCount: -1,
            createdAt: -1,
          };
          break;

        case 'nearby':
          // For nearby, we need to handle this differently with location data
          sortOptions = { createdAt: -1 };
          break;

        case 'default':
        default:
          // Default: sort by creation date (newest first)
          sortOptions = { createdAt: -1 };
          break;
      }

      this._logger.info('Get public technicians with pagination and sorting', {
        ...context,
        filters: repoFilters,
        skip,
        limit: limitNum,
        sortOptions,
        sortBy,
      });

      // Get public technicians with pagination AND sorting
      const technicians =
        await this._technicianRepository.findPublicTechnicians(
          repoFilters,
          skip,
          limitNum,
          sortOptions
        );

      const total =
        await this._technicianRepository.countPublicTechnicians(repoFilters);

      this._logger.debug('Technicians returned in sorted order', {
        ...context,
        sortBy,
        technicians: technicians.map(tech => ({
          id: tech._id,
          name: tech.displayName,
          rating: tech.averageRating,
          ratingCount: tech.ratingCount,
          experience: tech.experienceYears,
        })),
      });

      // Map to DTOs with proper address mapping
      const technicianDtos: TechnicianListDto[] = await Promise.all(
        technicians.map(async (tech: ITechnician) => {
          const adminTechnician = await this.convertToAdminTechnician(tech);

          // Create public technician with address data
          const publicTechnician = {
            ...this.mapAdminTechnicianToListDto(adminTechnician),
            address: adminTechnician.personalInfo?.address,
            workAreas: adminTechnician.workAreas,
            serviceRadiusKm: adminTechnician.serviceRadiusKm,
          };

          return publicTechnician;
        })
      );

      this._logger.info('Technicians retrieved with sorting', {
        ...context,
        techniciansCount: technicianDtos.length,
        sortBy,
        sampleRatings: technicianDtos.slice(0, 3).map(t => ({
          name: t.displayName,
          rating: t.averageRating,
          experience: t.experienceYears,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      });

      return ResponseHelper.success('Technicians retrieved successfully', {
        technicians: technicianDtos,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
          hasNext: pageNum < Math.ceil(total / limitNum),
          hasPrev: pageNum > 1,
        },
      });
    } catch (error) {
      console.error(
        'Backend Service: Error getting public technicians:',
        error
      );
      this._logger.error('Failed to get public technicians', {
        ...context,
        error: error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to retrieve technicians');
    }
  }
  async getPublicTechnicianById(
    id: string
  ): Promise<SingleTechnicianResponseDto> {
    const context = {
      operation: 'getPublicTechnicianById',
      technicianId: id,
      timestamp: new Date().toString(),
    };
    try {
      this._logger.info('Get technician by id', context);
      const technician =
        await this._technicianRepository.findTechnicianById(id);

      if (!technician) {
        this._logger.warn('Technician not found', context);
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      // Only return approved technicians to public
      if (technician.status !== 'approved') {
        this._logger.warn('Technician with approved status not found', context);
        return ResponseHelper.notFound(
          TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIAN_NOT_FOUND
        );
      }

      // Get ACTUAL availability records for the next 30 days
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const availabilityRecords =
        await this._technicianRepository.getUpcomingAvailabilityProfile(
          id,
          startDate,
          endDate
        );

      // Get active slot rules to understand the pattern
      const slotRules = await this._technicianRepository.getActiveSlotRules(id);

      const adminTechnician = await this.convertToAdminTechnician(technician);

      // Include REAL availability data
      const publicTechnician = {
        ...adminTechnician,
        identityVerification: undefined,
        paymentDetails: undefined,
        suspensionReason: undefined,
        rejectionReason: undefined,
        // Include actual availability records and slot rules
        availabilityRecords: availabilityRecords,
        slotRules: slotRules,
      };

      const technicianDto = toTechnicianDetailDto(publicTechnician);

      // Add the actual data to response
      const responseData = {
        ...technicianDto,
        availabilityRecords: availabilityRecords,
        slotRules: slotRules,
      };

      this._logger.info('Technician retrieved with REAL availability', {
        ...context,
        technicianId: id,
        availabilityRecordsCount: availabilityRecords.length,
        slotRulesCount: slotRules.length,
      });

      return ResponseHelper.success(
        TECHNICIAN_MANAGEMENT_MESSAGES.TECHNICIANS_RETRIEVED,
        {
          technician: responseData,
        }
      );
    } catch (error) {
      this._logger.error('Failed to get public technicians by id', {
        ...context,
        error: error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to retrieve technician');
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
      const SlotRule = require('../models/technician/SlotRuleSchema').default;
      const TechnicianAvailability =
        require('../models/technician/TechnicianAvailabilitySchema').default;

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
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
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
      console.error('Error in processAvailabilityData:', error);
      throw error;
    }
  }
  private mapIdType(governmentIdType: string): string {
    const idTypeMap: { [key: string]: string } = {
      drivingLicense: 'driving_license',
      passport: 'passport',
      aadhaar: 'aadhaar',
      voterId: 'national_id',
      panCard: 'national_id',
    };

    return idTypeMap[governmentIdType] || 'national_id';
  }
  async getTechnicianSlotRules(technicianId: string): Promise<any> {
    const context = {
      operation: 'getPublicTechnicianSlotRules',
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching public technician slot rules', context);

      // First verify technician exists and is approved
      const technician =
        await this._technicianRepository.findTechnicianById(technicianId);

      if (!technician || technician.status !== 'approved') {
        this._logger.warn('Technician not found or not approved', context);
        return ResponseHelper.notFound('Technician not found');
      }

      const slotRules =
        await this._technicianRepository.getActiveSlotRules(technicianId);

      this._logger.info(`Found ${slotRules.length} public slot rules`, {
        ...context,
        slotRulesCount: slotRules.length,
      });

      return ResponseHelper.success('Slot rules retrieved successfully', {
        slotRules,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch public slot rules', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to retrieve slot rules');
    }
  }

  async getTechnicianAvailability(
    technicianId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const context = {
      operation: 'getPublicTechnicianAvailability',
      technicianId,
      startDate,
      endDate,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching public technician availability', context);

      // First verify technician exists and is approved
      const technician =
        await this._technicianRepository.findTechnicianById(technicianId);

      if (!technician || technician.status !== 'approved') {
        this._logger.warn('Technician not found or not approved', context);
        return ResponseHelper.notFound('Technician not found');
      }

      // Default to next 7 days if no dates provided
      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date();
      end.setDate(end.getDate() + 7); // Next 7 days

      const availability =
        await this._technicianRepository.getUpcomingAvailabilityProfile(
          technicianId,
          start,
          end
        );

      this._logger.info(
        `Found public availability for ${availability.length} days`,
        {
          ...context,
          availabilityCount: availability.length,
        }
      );

      return ResponseHelper.success('Availability retrieved successfully', {
        availability,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch public availability', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to retrieve availability');
    }
  }

  async getTechnicianPublicAvailability(
    technicianId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    const context = {
      operation: 'getTechnicianPublicAvailability',
      technicianId,
      startDate,
      endDate,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching public technician availability', context);

      // First verify technician exists and is approved
      const technician =
        await this._technicianRepository.findTechnicianById(technicianId);

      if (!technician || technician.status !== 'approved') {
        this._logger.warn('Technician not found or not approved', context);
        return ResponseHelper.notFound('Technician not found');
      }

      // Default to next 7 days if no dates provided
      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date();
      end.setDate(end.getDate() + 7);

      const availability =
        await this._technicianRepository.getUpcomingAvailabilityProfile(
          technicianId,
          start,
          end
        );

      // Format the availability for frontend display
      const formattedAvailability =
        this.formatAvailabilityForDisplay(availability);

      this._logger.info(
        `Found public availability for ${availability.length} days`,
        {
          ...context,
          availabilityCount: availability.length,
        }
      );

      return ResponseHelper.success('Availability retrieved successfully', {
        availability: formattedAvailability,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch public availability', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to retrieve availability');
    }
  }

  private formatAvailabilityForDisplay(availabilityRecords: any[]): any[] {
    return availabilityRecords.map(record => {
      const availableSlots = record.timeSlots
        .filter((slot: any) => slot.status === 'available')
        .map((slot: any) => ({
          start:
            slot.start instanceof Date
              ? slot.start.toTimeString().substring(0, 5)
              : new Date(slot.start).toTimeString().substring(0, 5),
          end:
            slot.end instanceof Date
              ? slot.end.toTimeString().substring(0, 5)
              : new Date(slot.end).toTimeString().substring(0, 5),
        }));

      return {
        date: record.date,
        dayName: new Date(record.date)
          .toLocaleDateString('en-US', { weekday: 'long' })
          .toLowerCase(),
        slots: availableSlots,
        isToday: this.isToday(new Date(record.date)),
      };
    });
  }

  private isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  private mapToTechnicianDto(technician: ITechnician): any {
    return {
      _id: technician._id,
      displayName: technician.displayName,
      email: technician.personalInfo?.email,
      phone: technician.phone,
      services: technician.services,
      experienceYears: technician.experienceYears,
      workAreas: technician.workAreas,
      status: technician.status,
      averageRating: technician.averageRating,
      profilePictureUrl: technician.profilePictureUrl,
      createdAt: technician.createdAt,
      updatedAt: technician.updatedAt,
    };
  }

  private mapToApplicationDto(application: AdminITechnicianApplication): any {
    return {
      _id: application._id,
      technicianId: application.technicianId,
      email: application.email,
      status: application.status,
      personal: application.personal,
      skills: application.skills,
      submittedAt: application.submittedAt,
      createdAt: application.createdAt,
    };
  }
}
