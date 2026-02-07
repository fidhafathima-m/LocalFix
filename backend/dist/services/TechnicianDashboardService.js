"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianDashboardService = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const constants_1 = require("../constants");
const technicianDashboardMappers_1 = require("../mappers/technicianDashboardMappers");
class TechnicianDashboardService {
    constructor(technicianRepository, userRepository, userAddressRepository, logger) {
        this._technicianRepository = technicianRepository;
        this._userRepository = userRepository;
        this._userAddressRepository = userAddressRepository;
        this._logger = logger;
    }
    async getDashboardOverview(technicianId) {
        const context = {
            operation: 'getDashboardOverview',
            data: { technicianId },
        };
        try {
            this._logger.info('Fetching dashboard overview for technician', context);
            const technician = await this._technicianRepository.findByUserId(technicianId);
            if (!technician) {
                this._logger.warn('Technician not found for dashboard overview', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.DASHBOARD_MESSAGES.TECHNICIAN_NOT_FOUND);
            }
            this._logger.debug('Technician found, generating overview data', {
                ...context,
                technicianRecordId: technician._id?.toString(),
                displayName: technician.displayName,
                status: technician.status,
            });
            const overviewDto = (0, technicianDashboardMappers_1.toDashboardOverviewDto)(technician);
            this._logger.info('Dashboard overview generated successfully', {
                ...context,
                // overviewData: {
                //   totalBookings: overviewDto.totalBookings,
                //   completedBookings: overviewDto.completedBookings,
                //   pendingBookings: overviewDto.pendingBookings,
                //   totalEarnings: overviewDto.totalEarnings,
                //   averageRating: overviewDto.averageRating,
                //   ratingCount: overviewDto.ratingCount
                // }
            });
            return responseHelper_1.ResponseHelper.success(constants_1.DASHBOARD_MESSAGES.DASHBOARD_OVERVIEW_RETRIEVED, {
                overview: overviewDto,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Get dashboard overview operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.DASHBOARD_MESSAGES.FAILED_FETCH_OVERVIEW);
        }
    }
    async getTechnicianProfile(technicianId) {
        const context = {
            operation: 'getTechnicianProfile',
            data: { technicianId },
        };
        try {
            this._logger.info('Fetching technician profile', context);
            const technician = await this._technicianRepository.findByUserId(technicianId);
            if (!technician) {
                this._logger.warn('Technician record not found', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.DASHBOARD_MESSAGES.TECHNICIAN_PROFILE_NOT_FOUND);
            }
            this._logger.debug('Technician found, fetching user data', {
                ...context,
                technicianRecordId: technician._id?.toString(),
                userId: technician.userId?.toString(),
            });
            const user = await this._userRepository.findById(technicianId);
            if (!user) {
                this._logger.warn('User record not found for technician', {
                    ...context,
                    technicianId,
                });
                return responseHelper_1.ResponseHelper.notFound(constants_1.DASHBOARD_MESSAGES.TECHNICIAN_PROFILE_NOT_FOUND);
            }
            this._logger.debug('User found, fetching address data', {
                ...context,
                userId: user._id?.toString(),
                userEmail: user.email,
            });
            let userAddress = null;
            if (technician.userId) {
                userAddress = await this._userAddressRepository.findByUserId(technician.userId);
                if (userAddress) {
                    this._logger.debug('User address found', {
                        ...context,
                        addressId: userAddress._id?.toString(),
                        hasLocation: !!userAddress.location,
                    });
                }
                else {
                    this._logger.debug('No user address found', context);
                }
            }
            else {
                this._logger.warn('No userId found in technician record', {
                    ...context,
                    technicianRecordId: technician._id?.toString(),
                });
            }
            this._logger.debug('Generating profile DTO from collected data', {
                ...context,
                hasTechnicianData: !!technician,
                hasUserData: !!user,
                hasAddressData: !!userAddress,
            });
            const profileDto = (0, technicianDashboardMappers_1.toTechnicianProfileDto)(technician, user, userAddress);
            this._logger.info('Technician profile generated successfully', {
                ...context,
                profileData: {
                    displayName: profileDto.displayName,
                    email: profileDto.email,
                    experienceYears: profileDto.experienceYears,
                    servicesCount: profileDto.services?.length || 0,
                    workAreasCount: profileDto.workAreas?.length || 0,
                },
            });
            return responseHelper_1.ResponseHelper.success(constants_1.DASHBOARD_MESSAGES.TECHNICIAN_PROFILE_RETRIEVED, {
                profile: profileDto,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Get technician profile operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.DASHBOARD_MESSAGES.FAILED_FETCH_PROFILE);
        }
    }
}
exports.TechnicianDashboardService = TechnicianDashboardService;
