"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianManagementController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class TechnicianManagementController {
    constructor(technicianService, logger) {
        // ========== PUBLIC ROUTES ==========
        this.getPublicTechnicians = async (req, res) => {
            const { service, page, limit, search, location, sortBy } = req.query;
            const context = {
                operation: 'getPublicTechnicians',
                serviceFilter: service,
                page,
                limit,
                search,
                location,
                sortBy,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching public technicians', context);
                const filters = {
                    status: 'approved',
                    ...(service && { service: service }),
                    ...(page && { page: Number(page) }),
                    ...(limit && { limit: Number(limit) }),
                    ...(search && { search: search }),
                    ...(location && { location: location }),
                    ...(sortBy && { sortBy: sortBy }),
                };
                const result = await this._technicianService.getPublicTechnicians(filters);
                this._logger.info('Public technicians retrieved successfully', {
                    ...context,
                    count: result.data?.technicians?.length,
                    total: result.data?.pagination?.total,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get public technicians controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getTechniciansByService = async (req, res) => {
            const { service } = req.params;
            const context = {
                operation: 'getTechniciansByService',
                service,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technicians by service', context);
                const filters = {
                    status: 'approved',
                    service: service,
                };
                const result = await this._technicianService.getPublicTechnicians(filters);
                this._logger.info('Technicians by service retrieved successfully', {
                    ...context,
                    count: result.data?.technicians?.length,
                    total: result.data?.pagination?.total,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get technicians by service controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getPublicTechnicianById = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'getPublicTechnicianById',
                technicianId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching public technician by ID', context);
                const result = await this._technicianService.getPublicTechnicianById(id);
                this._logger.info('Public technician retrieved successfully', {
                    ...context,
                    technicianName: result.data?.technician?.displayName,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get public technician controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        // ========== ADMIN ROUTES ==========
        this.getAllTechnicians = async (req, res) => {
            const { search, status, service, page, limit } = req.query;
            const context = {
                operation: 'getAllTechnicians',
                search,
                status,
                service,
                page,
                limit,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching all technicians with filters', context);
                const filters = {
                    page: page ? Number(page) : 1,
                    limit: limit ? Number(limit) : 10,
                    ...(search && { search: search }),
                    ...(status && status !== 'All Status' && { status: status }),
                    ...(service &&
                        service !== 'All Services' && { service: service }),
                };
                const result = await this._technicianService.getAllTechnicians(filters);
                this._logger.info('Technicians retrieved successfully with filters', {
                    ...context,
                    count: result.data?.technicians?.length,
                    total: result.data?.pagination?.total,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get technicians controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getTechnicianById = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'getTechnicianById',
                technicianId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technician by ID (admin)', context);
                const result = await this._technicianService.getTechnicianById(id);
                this._logger.info('Technician retrieved successfully (admin)', {
                    ...context,
                    technicianName: result.data?.technician?.displayName,
                    status: result.data?.technician?.status,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get technician controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.updateTechnicianStatus = async (req, res) => {
            const { id } = req.params;
            const statusData = req.body;
            const adminUserId = req.user?.id;
            const context = {
                operation: 'updateTechnicianStatus',
                technicianId: id,
                newStatus: statusData.status,
                adminUserId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating technician status', context);
                const result = await this._technicianService.updateTechnicianStatus(id, statusData);
                this._logger.info('Technician status updated successfully', {
                    ...context,
                    technicianName: result.data?.technician?.displayName,
                    previousStatus: result.data?.technician?.status,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Update technician status controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getTechnicianStats = async (req, res) => {
            const context = {
                operation: 'getTechnicianStats',
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technician statistics', context);
                const result = await this._technicianService.getTechnicianStats();
                this._logger.info('Technician statistics retrieved successfully', {
                    ...context,
                    stats: result.data,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get technician stats controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getPendingApplications = async (req, res) => {
            const { search, service, page, limit } = req.query;
            const context = {
                operation: 'getPendingApplications',
                search,
                service,
                page,
                limit,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching pending applications with filters', context);
                const filters = {
                    page: page ? Number(page) : 1,
                    limit: limit ? Number(limit) : 10,
                    ...(search && { search: search }),
                    ...(service &&
                        service !== 'All Services' && { service: service }),
                };
                const result = await this._technicianService.getPendingApplications(filters);
                this._logger.info('Pending applications retrieved successfully', {
                    ...context,
                    count: result.data?.applications?.length,
                    total: result.data?.pagination?.total,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get pending applications controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.approveApplication = async (req, res) => {
            const { id } = req.params;
            const adminUserId = req.user?.id;
            const context = {
                operation: 'approveApplication',
                applicationId: id,
                adminUserId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Approving technician application', context);
                const result = await this._technicianService.approveApplication(id);
                this._logger.info('Application approved successfully', {
                    ...context,
                    technicianId: result.data?.applications?.[0]?.technicianId,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Approve application controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.rejectApplication = async (req, res) => {
            const { id } = req.params;
            const rejectData = req.body;
            const adminUserId = req.user?.id;
            const context = {
                operation: 'rejectApplication',
                applicationId: id,
                adminUserId,
                rejectionReason: rejectData.rejectionReason,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Rejecting technician application', context);
                if (!rejectData.rejectionReason) {
                    this._logger.warn('Rejection failed - reason required', context);
                    const badRequestResponse = responseHelper_1.ResponseHelper.badRequest('Rejection reason is required');
                    res.status(badRequestResponse.statusCode).json(badRequestResponse);
                    return;
                }
                const result = await this._technicianService.rejectApplication(id, rejectData);
                this._logger.info('Application rejected successfully', context);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Reject application controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getApplicationById = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'getApplicationById',
                applicationId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching application by ID', context);
                const result = await this._technicianService.getApplicationById(id);
                this._logger.info('Application retrieved successfully', {
                    ...context,
                    technicianId: result.data?.applications?.[0]?.technicianId,
                    status: result.data?.applications?.[0]?.status,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get application controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getApplicationStats = async (req, res) => {
            const context = {
                operation: 'getApplicationStats',
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching application statistics', context);
                const result = await this._technicianService.getApplicationStats();
                this._logger.info('Application statistics retrieved successfully', {
                    ...context,
                    stats: result.data,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get application stats controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getTechnicianByApplicationId = async (req, res) => {
            const { applicationId } = req.params;
            const context = {
                operation: 'getTechnicianByApplicationId',
                applicationId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technician by application ID', context);
                const result = await this._technicianService.getTechnicianByApplicationId(applicationId);
                this._logger.info('Technician by application retrieved successfully', {
                    ...context,
                    technicianId: result.data?.technicians?.[0]?._id,
                    technicianName: result.data?.technicians?.[0]?.displayName,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get technician by application controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getTechnicianSlotRules = async (req, res) => {
            try {
                const { id } = req.params;
                const result = await this._technicianService.getTechnicianSlotRules(id);
                if (!result.success) {
                    res.status(400).json(result);
                    return;
                }
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Get technician slot rules error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch slot rules',
                });
            }
        };
        this.getTechnicianAvailability = async (req, res) => {
            try {
                const { id } = req.params;
                const { startDate, endDate } = req.query;
                const result = await this._technicianService.getTechnicianAvailability(id, startDate, endDate);
                if (!result.success) {
                    res.status(400).json(result);
                    return;
                }
                res.status(200).json(result);
            }
            catch (error) {
                console.error('Get technician availability error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to fetch availability',
                });
            }
        };
        this.getTechnicianPublicAvailability = async (req, res) => {
            const { technicianId } = req.params;
            const { startDate, endDate } = req.query;
            const context = {
                operation: 'getTechnicianPublicAvailability',
                technicianId,
                startDate,
                endDate,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching public technician availability', context);
                const result = await this._technicianService.getTechnicianPublicAvailability(technicianId, startDate, endDate);
                this._logger.info('Public technician availability retrieved successfully', {
                    ...context,
                    availabilityCount: result.data?.availability?.length,
                });
                res.status(result.statusCode || 200).json(result);
            }
            catch (error) {
                this._logger.error('Get technician public availability controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to fetch technician availability');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this._technicianService = technicianService;
        this._logger = logger;
    }
}
exports.TechnicianManagementController = TechnicianManagementController;
