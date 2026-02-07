"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceManagementController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class ServiceManagementController {
    constructor(serviceService, logger) {
        this.createService = async (req, res) => {
            const context = {
                operation: 'createService',
                body: req.body,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Creating new service', context);
                const createDto = req.body;
                // Validation
                if (!createDto.name?.trim()) {
                    this._logger.warn('Service creation failed - name required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.SERVICE_MESSAGES.NAME_REQUIRED);
                    res.status(response.statusCode).json(response);
                    return;
                }
                if (!createDto.description?.trim()) {
                    this._logger.warn('Service creation failed - description required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.SERVICE_MESSAGES.DESCRIPTION_REQUIRED);
                    res.status(response.statusCode).json(response);
                    return;
                }
                if (!createDto.categoryId?.trim()) {
                    this._logger.warn('Service creation failed - category ID required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.SERVICE_MESSAGES.CATEGORY_ID_REQUIRED);
                    res.status(response.statusCode).json(response);
                    return;
                }
                if (createDto.avgBasePrice === undefined || createDto.avgBasePrice < 0) {
                    this._logger.warn('Service creation failed - invalid base price', {
                        ...context,
                        providedPrice: createDto.avgBasePrice,
                    });
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.SERVICE_MESSAGES.INVALID_BASE_PRICE);
                    res.status(response.statusCode).json(response);
                    return;
                }
                const service = await this._serviceService.createService(createDto);
                this._logger.info('Service created successfully', {
                    ...context,
                    serviceId: service?.id,
                    serviceName: service?.name,
                    categoryId: service?.categoryId,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.SERVICE_MESSAGES.SERVICE_CREATED, { service });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SERVICE_MESSAGES.FAILED_CREATE_SERVICE;
                this._logger.error('Create service controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getServiceById = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'getServiceById',
                serviceId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching service by ID', context);
                const service = await this._serviceService.getServiceById(id);
                this._logger.info('Service retrieved successfully', {
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
                this._logger.error('Get service by ID controller error', {
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
                operation: 'getServiceBySlug',
                slug,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching service by slug', context);
                const service = await this._serviceService.getServiceBySlug(slug);
                this._logger.info('Service retrieved by slug successfully', {
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
                this._logger.error('Get service by slug controller error', {
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
            const status = req.query.status;
            const context = {
                operation: 'getServicesByCategoryId',
                categoryId,
                page,
                limit,
                search,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching services by category ID', context);
                const result = await this._serviceService.getServicesByCategoryId(categoryId, page, limit, search, status);
                this._logger.info('Services by category retrieved successfully', {
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
                this._logger.error('Get services by category controller error', {
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
            const status = req.query.status;
            const context = {
                operation: 'getAllServices',
                page,
                limit,
                search,
                sortBy,
                sortOrder,
                status,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching all services', context);
                const result = await this._serviceService.getAllServices(page, limit, search, sortBy, sortOrder, status);
                this._logger.info('All services retrieved successfully', {
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
                this._logger.error('Get all services controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.updateService = async (req, res) => {
            const { id } = req.params;
            const updateDto = req.body;
            const context = {
                operation: 'updateService',
                serviceId: id,
                updateFields: Object.keys(updateDto),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating service', context);
                const service = await this._serviceService.updateService(id, updateDto);
                this._logger.info('Service updated successfully', {
                    ...context,
                    serviceName: service.name,
                    updatedFields: Object.keys(updateDto),
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.SERVICE_MESSAGES.SERVICE_UPDATED, { service });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SERVICE_MESSAGES.FAILED_UPDATE_SERVICE;
                this._logger.error('Update service controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.deleteService = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'deleteService',
                serviceId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Deleting service', context);
                await this._serviceService.deleteService(id);
                this._logger.info('Service deleted successfully', context);
                const response = responseHelper_1.ResponseHelper.success(constants_1.SERVICE_MESSAGES.SERVICE_DELETED);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SERVICE_MESSAGES.FAILED_DELETE_SERVICE;
                this._logger.error('Delete service controller error', {
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
                operation: 'searchServices',
                query: q,
                limit,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Searching services', context);
                if (!q || typeof q !== 'string') {
                    this._logger.warn('Search services failed - query required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest('Search query is required');
                    res.status(response.statusCode).json(response);
                    return;
                }
                const services = await this._serviceService.searchServices(q, limit);
                this._logger.info('Services search completed successfully', {
                    ...context,
                    resultsCount: services.length,
                });
                const response = responseHelper_1.ResponseHelper.success('Services search completed', {
                    services,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                this._logger.error('Search services controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to search services');
                res.status(response.statusCode).json(response);
            }
        };
        this._serviceService = serviceService;
        this._logger = logger;
    }
}
exports.ServiceManagementController = ServiceManagementController;
