"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianProfileController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
const technicianProfileMappers_1 = require("../../mappers/technicianProfileMappers");
class TechnicianProfileController {
    constructor(profileService, logger) {
        this.getProfile = async (req, res) => {
            const technicianId = req.user?.id;
            const context = {
                operation: 'getProfile',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technician profile', context);
                if (!technicianId) {
                    this._logger.warn('Get profile failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._profileService.getTechnicianProfile(technicianId);
                this._logger.info('Profile retrieved successfully', {
                    ...context,
                    profileStatus: result?.profile?.status,
                });
                this.handleServiceResponse(result, res, 'Profile retrieved successfully');
            }
            catch (error) {
                this._logger.error('Get profile controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.updatePersonalInfo = async (req, res) => {
            const technicianId = req.user?.id;
            const updateData = req.body;
            const context = {
                operation: 'updatePersonalInfo',
                technicianId,
                updateFields: Object.keys(updateData),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating personal information', context);
                if (!technicianId) {
                    this._logger.warn('Update personal info failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._profileService.updatePersonalInformation(technicianId, updateData);
                this._logger.info('Personal information updated successfully', {
                    ...context,
                    updatedFieldCount: Object.keys(updateData).length,
                });
                this.handleServiceResponse(result, res, 'Personal information updated successfully');
            }
            catch (error) {
                this._logger.error('Update personal info controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.uploadPhoto = [
            async (req, res) => {
                const technicianId = req.user?.id;
                const file = req.file;
                const context = {
                    operation: 'uploadPhoto',
                    technicianId,
                    fileName: file?.originalname,
                    fileSize: file?.size,
                    timestamp: new Date().toISOString(),
                };
                try {
                    this._logger.info('Uploading profile photo', context);
                    if (!technicianId) {
                        this._logger.warn('Upload photo failed - authentication required', context);
                        const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                        res
                            .status(unauthorizedResponse.statusCode)
                            .json(unauthorizedResponse);
                        return;
                    }
                    if (!file) {
                        this._logger.warn('Upload photo failed - no file uploaded', context);
                        const badRequestResponse = responseHelper_1.ResponseHelper.badRequest('No file uploaded');
                        res.status(badRequestResponse.statusCode).json(badRequestResponse);
                        return;
                    }
                    const result = await this._profileService.uploadPhoto(technicianId, file);
                    this._logger.info('Profile photo uploaded successfully', {
                        ...context,
                        uploadSuccess: result.success,
                    });
                    res.status(result.statusCode).json(result);
                }
                catch (error) {
                    this._logger.error('Upload photo controller error', {
                        ...context,
                        error: error instanceof Error ? error.message : undefined,
                        stack: error instanceof Error ? error.stack : undefined,
                    });
                    const errorResponse = responseHelper_1.ResponseHelper.error('Failed to upload photo');
                    res.status(errorResponse.statusCode).json(errorResponse);
                }
            },
        ];
        this.updateIdentityVerification = async (req, res) => {
            const technicianId = req.user?.id;
            const updateData = req.body;
            const context = {
                operation: 'updateIdentityVerification',
                technicianId,
                updateFields: Object.keys(updateData),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating identity verification', context);
                if (!technicianId) {
                    this._logger.warn('Update identity verification failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._profileService.updateIdentityVerification(technicianId, updateData);
                this._logger.info('Identity verification updated successfully', {
                    ...context,
                    verification: result?.profile?.identityVerification,
                });
                this.handleServiceResponse(result, res, 'Identity verification updated successfully');
            }
            catch (error) {
                this._logger.error('Update identity verification controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.updateSkillsServices = async (req, res) => {
            const technicianId = req.user?.id;
            const updateData = req.body;
            const context = {
                operation: 'updateSkillsServices',
                technicianId,
                updateFields: Object.keys(updateData),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating skills and services', context);
                if (!technicianId) {
                    this._logger.warn('Update skills services failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._profileService.updateSkillsServices(technicianId, updateData);
                this._logger.info('Skills and services updated successfully', {
                    ...context,
                    servicesCount: result?.profile?.services?.length,
                });
                this.handleServiceResponse(result, res, 'Skills and services updated successfully');
            }
            catch (error) {
                this._logger.error('Update skills services controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.updateAvailability = async (req, res) => {
            const technicianId = req.user?.id;
            const updateData = req.body;
            const context = {
                operation: 'updateAvailability',
                technicianId,
                updateFields: Object.keys(updateData),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating availability preferences', context);
                if (!technicianId) {
                    this._logger.warn('Update availability failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._profileService.updateAvailabilityPreferences(technicianId, updateData);
                this._logger.info('Availability updated successfully', {
                    ...context,
                    isAvailable: result?.profile?.availabilityPreferences?.isAvailable,
                });
                this.handleServiceResponse(result, res, 'Availability updated successfully');
            }
            catch (error) {
                this._logger.error('Update availability controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.updateBankPayment = async (req, res) => {
            const technicianId = req.user?.id;
            const updateData = req.body;
            const context = {
                operation: 'updateBankPayment',
                technicianId,
                updateFields: Object.keys(updateData),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating bank and payment details', context);
                if (!technicianId) {
                    this._logger.warn('Update bank payment failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._profileService.updateBankPaymentDetails(technicianId, updateData);
                this._logger.info('Bank and payment details updated successfully', context);
                this.handleServiceResponse(result, res, 'Bank and payment details updated successfully');
            }
            catch (error) {
                this._logger.error('Update bank payment controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.updatePassword = async (req, res) => {
            const technicianId = req.user?.id;
            const updateData = req.body;
            const context = {
                operation: 'updatePassword',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating password', context);
                if (!technicianId) {
                    this._logger.warn('Update password failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._profileService.updatePassword(technicianId, updateData);
                this._logger.info('Password updated successfully', context);
                this.handleServiceResponse(result, res, 'Password updated successfully');
            }
            catch (error) {
                this._logger.error('Update password controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.uploadDocument = [
            async (req, res) => {
                const technicianId = req.user?.id;
                const documentType = req.body.type;
                const file = req.file;
                const context = {
                    operation: 'uploadDocument',
                    technicianId,
                    documentType,
                    fileName: file?.originalname,
                    fileSize: file?.size,
                    timestamp: new Date().toISOString(),
                };
                try {
                    this._logger.info('Uploading document', context);
                    if (!technicianId) {
                        this._logger.warn('Upload document failed - authentication required', context);
                        const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                        res
                            .status(unauthorizedResponse.statusCode)
                            .json(unauthorizedResponse);
                        return;
                    }
                    if (!file) {
                        this._logger.warn('Upload document failed - no file uploaded', context);
                        const badRequestResponse = responseHelper_1.ResponseHelper.badRequest('No file uploaded');
                        res.status(badRequestResponse.statusCode).json(badRequestResponse);
                        return;
                    }
                    if (!documentType) {
                        this._logger.warn('Upload document failed - document type required', context);
                        const badRequestResponse = responseHelper_1.ResponseHelper.badRequest('Document type is required');
                        res.status(badRequestResponse.statusCode).json(badRequestResponse);
                        return;
                    }
                    const result = await this._profileService.uploadDocument(technicianId, file, documentType);
                    this._logger.info('Document uploaded successfully', {
                        ...context,
                        uploadSuccess: result.success,
                    });
                    res.status(result.statusCode).json(result);
                }
                catch (error) {
                    this._logger.error('Upload document controller error', {
                        ...context,
                        error: error instanceof Error ? error.message : undefined,
                        stack: error instanceof Error ? error.stack : undefined,
                    });
                    const errorResponse = responseHelper_1.ResponseHelper.error('Failed to upload document');
                    res.status(errorResponse.statusCode).json(errorResponse);
                }
            },
        ];
        this.getStaticData = async (req, res) => {
            const context = {
                operation: 'getStaticData',
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching static data', context);
                const staticData = (0, technicianProfileMappers_1.toStaticDataDto)();
                this._logger.info('Static data retrieved successfully', context);
                const successResponse = responseHelper_1.ResponseHelper.success('Static data retrieved successfully', staticData);
                res.status(successResponse.statusCode).json(successResponse);
            }
            catch (error) {
                this._logger.error('Get static data error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to fetch static data');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.deactivateProfile = async (req, res) => {
            const technicianId = req.user?.id;
            const context = {
                operation: 'deactivateProfile',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Deactivating profile', context);
                if (!technicianId) {
                    this._logger.warn('Deactivate profile failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._profileService.updateAvailabilityPreferences(technicianId, {
                    availability: {
                        isAvailable: false,
                    },
                });
                this._logger.info('Profile deactivated successfully', context);
                this.handleServiceResponse(result, res, 'Profile deactivated successfully');
            }
            catch (error) {
                this._logger.error('Deactivate profile error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to deactivate profile');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.deleteAccount = async (req, res) => {
            const technicianId = req.user?.id;
            const context = {
                operation: 'deleteAccount',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Processing account deletion request', context);
                if (!technicianId) {
                    this._logger.warn('Delete account failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                this._logger.info('Account deletion request received', context);
                const successResponse = responseHelper_1.ResponseHelper.success('Account deletion request received. This action will be processed within 24 hours.');
                res.status(successResponse.statusCode).json(successResponse);
            }
            catch (error) {
                this._logger.error('Delete account error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to process account deletion');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getSlotRules = async (req, res) => {
            const technicianId = req.user?.id;
            const context = {
                operation: 'getSlotRules',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching slot rules', context);
                if (!technicianId) {
                    this._logger.warn('Get slot rules failed - authentication required', context);
                    res.status(401).json({ success: false, message: 'Unauthorized' });
                    return;
                }
                const result = await this._profileService.getSlotRules(technicianId);
                this._logger.info('Slot rules retrieved successfully', {
                    ...context,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get slot rules controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this.getTechnicianAvailability = async (req, res) => {
            const technicianId = req.user?.id;
            const context = {
                operation: 'getTechnicianAvailability',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technician availability', context);
                if (!technicianId) {
                    this._logger.warn('Get technician availability failed - authentication required', context);
                    res.status(401).json({ success: false, message: 'Unauthorized' });
                    return;
                }
                const result = await this._profileService.getTechnicianAvailability(technicianId);
                this._logger.info('Technician availability retrieved successfully', {
                    ...context,
                    isAvailable: result.profile?.availabilityPreferences?.isAvailable,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get technician availability controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this._profileService = profileService;
        this._logger = logger;
    }
    // Helper method to handle service responses
    handleServiceResponse(result, res, successMessage) {
        // Check if result already has statusCode (is a response object)
        if (result && 'statusCode' in result) {
            res.status(result.statusCode).json(result);
        }
        else {
            // If it's a raw data object, wrap it in a success response
            const successResponse = responseHelper_1.ResponseHelper.success(successMessage || 'Operation completed successfully', result);
            res.status(successResponse.statusCode).json(successResponse);
        }
    }
}
exports.TechnicianProfileController = TechnicianProfileController;
