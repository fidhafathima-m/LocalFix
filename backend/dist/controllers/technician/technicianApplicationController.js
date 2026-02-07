"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianApplicationController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class TechnicianApplicationController {
    constructor(applicationService, logger) {
        this.startApplication = async (req, res) => {
            const requestData = req.body;
            const context = {
                operation: 'startApplication',
                userEmail: requestData.email,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Starting new technician application', context);
                const result = await this._applicationService.startApplication(requestData);
                this._logger.info('Application started successfully', {
                    ...context,
                    applicationId: result.data?.application?._id,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Start application controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.saveStep = async (req, res) => {
            const requestData = req.body;
            const userId = req.user?.id;
            const files = this.convertExpressFiles(req.files);
            const context = {
                operation: 'saveStep',
                userId,
                applicationId: requestData.applicationId,
                step: requestData.step,
                fileCount: this.countFiles(files),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Saving application step', context);
                const result = await this._applicationService.saveStep(requestData, files);
                this._logger.info('Application step saved successfully', {
                    ...context,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Save step controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getApplication = async (req, res) => {
            const { applicationId } = req.params;
            const context = {
                operation: 'getApplication',
                applicationId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching application', context);
                const result = await this._applicationService.getApplication(applicationId);
                this._logger.info('Application retrieved successfully', {
                    ...context,
                    status: result.data?.application?.status,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get application controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.submitApplication = async (req, res) => {
            const requestData = req.body;
            const userId = req.user?.id;
            const context = {
                operation: 'submitApplication',
                userId,
                applicationId: requestData.applicationId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Submitting application', context);
                if (!userId) {
                    this._logger.warn('Submit application failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._applicationService.submitApplication(requestData.applicationId, userId);
                this._logger.info('Application submitted successfully', {
                    ...context,
                    newStatus: result.data?.application?.status,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Submit application controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getApplicationStatus = async (req, res) => {
            const { applicationId } = req.params;
            const context = {
                operation: 'getApplicationStatus',
                applicationId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching application status', context);
                const result = await this._applicationService.getApplicationStatus(applicationId);
                this._logger.info('Application status retrieved successfully', {
                    ...context,
                    status: result.data?.application?.status,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get application status controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getUserApplications = async (req, res) => {
            const userId = req.user?.id;
            const context = {
                operation: 'getUserApplications',
                userId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching user applications', context);
                if (!userId) {
                    this._logger.warn('Get user applications failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._applicationService.getUserApplications(userId);
                this._logger.info('User applications retrieved successfully', {
                    ...context,
                    applicationCount: result.data?.applications?.length,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get user applications controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.resubmitApplication = async (req, res) => {
            const { applicationId } = req.params;
            const userId = req.user?.id;
            const context = {
                operation: 'resubmitApplication',
                userId,
                applicationId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Resubmitting application', context);
                if (!userId) {
                    this._logger.warn('Resubmit application failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._applicationService.resubmitApplication(applicationId, userId);
                this._logger.info('Application resubmitted successfully', {
                    ...context,
                    newStatus: result.data?.application?.status,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Resubmit application controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.startNewAfterRejection = async (req, res) => {
            const requestData = req.body;
            const userId = req.user?.id;
            const context = {
                operation: 'startNewAfterRejection',
                userId,
                userEmail: requestData.email,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Starting new application after rejection', context);
                if (!userId || !requestData.email) {
                    this._logger.warn('Start new after rejection failed - missing required fields', context);
                    const badRequestResponse = responseHelper_1.ResponseHelper.badRequest('User ID and email are required');
                    res.status(badRequestResponse.statusCode).json(badRequestResponse);
                    return;
                }
                const result = await this._applicationService.startNewApplicationAfterRejection(userId, requestData.email);
                this._logger.info('New application started after rejection successfully', {
                    ...context,
                    newApplicationId: result.data?.application?._id,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Start new after rejection controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getApplicationForEdit = async (req, res) => {
            const { applicationId } = req.params;
            const userId = req.user?.id;
            const context = {
                operation: 'getApplicationForEdit',
                userId,
                applicationId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching application for editing', context);
                if (!userId) {
                    this._logger.warn('Get application for edit failed - authentication required', context);
                    const unauthorizedResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
                    return;
                }
                const result = await this._applicationService.getApplicationForEdit(applicationId, userId);
                this._logger.info('Application for edit retrieved successfully', {
                    ...context,
                    status: result.data?.application?.status,
                    isEditable: result.data?.application?.status === 'draft',
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get application for edit controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this._applicationService = applicationService;
        this._logger = logger;
    }
    countFiles(files) {
        if (!files)
            return 0;
        return Object.values(files).reduce((total, fileArray) => {
            return total + fileArray.length;
        }, 0);
    }
    convertExpressFiles(files) {
        if (!files)
            return {};
        const convertedFiles = {};
        for (const [fieldname, fileOrArray] of Object.entries(files)) {
            if (Array.isArray(fileOrArray)) {
                convertedFiles[fieldname] = fileOrArray.map((file) => this.convertExpressFile(file));
            }
            else {
                const file = fileOrArray;
                convertedFiles[fieldname] = [this.convertExpressFile(file)];
            }
        }
        return convertedFiles;
    }
    convertExpressFile(file) {
        return {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            buffer: file.buffer,
            size: file.size,
            stream: file.stream,
            destination: file.destination,
            filename: file.filename,
            path: file.path,
        };
    }
}
exports.TechnicianApplicationController = TechnicianApplicationController;
