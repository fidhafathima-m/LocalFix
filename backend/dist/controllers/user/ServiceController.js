"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServiceController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class UserServiceController {
    constructor(userServiceService, logger) {
        this.getServiceById = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'UserServiceController.getServiceById',
                serviceId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching service by ID for user', context);
                const service = await this._userServiceService.getServiceById(id);
                this._logger.info('Service retrieved successfully for user', {
                    ...context,
                    serviceName: service.name,
                    categoryId: service.categoryId,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.SERVICE_MESSAGES.SERVICE_RETRIEVED, { service });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SERVICE_MESSAGES.SERVICE_NOT_FOUND;
                this._logger.error('Get service by ID controller error for user', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getServiceBySlug = async (req, res) => {
            const { slug } = req.params;
            const context = {
                operation: 'UserServiceController.getServiceBySlug',
                slug,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching service by slug for user', context);
                const service = await this._userServiceService.getServiceBySlug(slug);
                this._logger.info('Service retrieved by slug successfully for user', {
                    ...context,
                    serviceId: service.id,
                    serviceName: service.name,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.SERVICE_MESSAGES.SERVICE_RETRIEVED, { service });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SERVICE_MESSAGES.SERVICE_NOT_FOUND;
                this._logger.error('Get service by slug controller error for user', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getServicesByCategoryId = async (req, res) => {
            const { categoryId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const context = {
                operation: 'UserServiceController.getServicesByCategoryId',
                categoryId,
                page,
                limit,
                search,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching services by category ID for user', context);
                const result = await this._userServiceService.getServicesByCategoryId(categoryId, page, limit, search);
                this._logger.info('Services by category retrieved successfully for user', {
                    ...context,
                    totalServices: result.total,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.SERVICE_MESSAGES.SERVICES_RETRIEVED, result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SERVICE_MESSAGES.FAILED_FETCH_SERVICES;
                this._logger.error('Get services by category controller error for user', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getAllServices = async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const sortBy = req.query.sortBy || 'name';
            const sortOrder = req.query.sortOrder || 'asc';
            const context = {
                operation: 'UserServiceController.getAllServices',
                page,
                limit,
                search,
                sortBy,
                sortOrder,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching all active services for user', context);
                const result = await this._userServiceService.getAllServices(page, limit, search, sortBy, sortOrder);
                this._logger.info('All active services retrieved successfully for user', {
                    ...context,
                    totalServices: result.total,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.SERVICE_MESSAGES.SERVICES_RETRIEVED, result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SERVICE_MESSAGES.FAILED_FETCH_SERVICES;
                this._logger.error('Get all services controller error for user', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.searchServices = async (req, res) => {
            const { q } = req.query;
            const limit = parseInt(req.query.limit) || 10;
            const context = {
                operation: 'UserServiceController.searchServices',
                query: q,
                limit,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Searching active services for user', context);
                if (!q || typeof q !== 'string') {
                    this._logger.warn('Search services failed - query required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest('Search query is required');
                    res.status(response.statusCode).json(response);
                    return;
                }
                const services = await this._userServiceService.searchServices(q, limit);
                this._logger.info('Services search completed successfully for user', {
                    ...context,
                    resultsCount: services.length,
                });
                const response = responseHelper_1.ResponseHelper.success('Services search completed', {
                    services,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                this._logger.error('Search services controller error for user', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to search services');
                res.status(response.statusCode).json(response);
            }
        };
        this._userServiceService = userServiceService;
        this._logger = logger;
    }
}
exports.UserServiceController = UserServiceController;
