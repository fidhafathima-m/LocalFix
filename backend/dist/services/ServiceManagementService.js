"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceService = void 0;
const constants_1 = require("../constants");
const mongoose_1 = require("mongoose");
const itemSchema_1 = require("../models/category/itemSchema");
const serviceMapper_1 = require("../mappers/serviceMapper");
class ServiceService {
    constructor(serviceRepository, logger) {
        this._serviceRepository = serviceRepository;
        this._logger = logger;
    }
    async createService(createDto) {
        const context = {
            operation: 'createService',
            data: {
                serviceName: createDto.name,
                categoryId: createDto.categoryId,
                hasDescription: !!createDto.description,
                hasImage: !!createDto.iconUrl,
                status: createDto.status || constants_1.ServiceStatus.ACTIVE,
            },
        };
        try {
            this._logger.info('Creating new service', context);
            // Check if service with same name already exists
            this._logger.debug('Checking for existing service with same name', {
                ...context,
                serviceName: createDto.name,
            });
            const existingService = await this._serviceRepository.findByName(createDto.name);
            if (existingService) {
                this._logger.warn('Service creation failed - service already exists', {
                    ...context,
                    existingServiceId: existingService._id?.toString(),
                });
                throw new Error(constants_1.SERVICE_MESSAGES.SERVICE_ALREADY_EXISTS);
            }
            // Validate category ID
            this._logger.debug('Validating category ID', {
                ...context,
                categoryId: createDto.categoryId,
            });
            if (!mongoose_1.Types.ObjectId.isValid(createDto.categoryId)) {
                this._logger.warn('Invalid category ID provided', {
                    ...context,
                    categoryId: createDto.categoryId,
                });
                throw new Error(constants_1.SERVICE_MESSAGES.INVALID_CATEGORY_ID);
            }
            const serviceData = {
                ...createDto,
                categoryId: new mongoose_1.Types.ObjectId(createDto.categoryId),
                status: createDto.status || constants_1.ServiceStatus.ACTIVE,
                rating: createDto.rating || 4.5,
                estimatedDuration: createDto.estimatedDuration || '2-4 hours',
                features: createDto.features || [],
                popular: createDto.popular || false,
            };
            this._logger.debug('Creating service with data', {
                ...context,
                serviceData: {
                    ...serviceData,
                    categoryId: serviceData.categoryId.toString(),
                    featuresCount: serviceData.features.length,
                },
            });
            const service = await this._serviceRepository.create(serviceData);
            this._logger.info('Service created successfully', {
                ...context,
                serviceId: service._id?.toString(),
            });
            return (0, serviceMapper_1.toServiceResponseDto)(service);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Create service operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    async getServiceById(serviceId) {
        const context = {
            operation: 'getServiceById',
            data: { serviceId },
        };
        try {
            this._logger.info('Fetching service by ID', context);
            const service = await this._serviceRepository.findById(serviceId);
            if (!service) {
                this._logger.warn('Service not found by ID', context);
                throw new Error(constants_1.SERVICE_MESSAGES.SERVICE_NOT_FOUND);
            }
            this._logger.debug('Service found, counting active items', {
                ...context,
                serviceName: service.name,
            });
            const itemCount = await itemSchema_1.Item.countDocuments({
                serviceId: service._id,
                isActive: true,
            });
            this._logger.debug('Item count retrieved', {
                ...context,
                itemCount,
            });
            const serviceWithCount = {
                ...service.toObject(),
                itemCount,
            };
            this._logger.info('Service retrieved successfully with item count', {
                ...context,
                serviceId: service._id?.toString(),
                itemCount,
            });
            return (0, serviceMapper_1.toServiceResponseDto)(serviceWithCount);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Get service by ID operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    async getServiceBySlug(slug) {
        const context = {
            operation: 'getServiceBySlug',
            data: { slug },
        };
        try {
            this._logger.info('Fetching service by slug', context);
            const service = await this._serviceRepository.findBySlug(slug);
            if (!service) {
                this._logger.warn('Service not found by slug', context);
                throw new Error(constants_1.SERVICE_MESSAGES.SERVICE_NOT_FOUND);
            }
            this._logger.info('Service retrieved successfully by slug', {
                ...context,
                serviceId: service._id?.toString(),
                serviceName: service.name,
            });
            return (0, serviceMapper_1.toServiceResponseDto)(service);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Get service by slug operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    async getServicesByCategoryId(categoryId, page = 1, limit = 10, search, status) {
        const context = {
            operation: 'getServicesByCategoryId',
            data: {
                categoryId,
                page,
                limit,
                hasSearch: !!search,
                searchQuery: search,
                hasStatusFilter: !!status && status !== 'All Status',
                statusFilter: status,
            },
        };
        try {
            this._logger.info('Fetching services by category ID', context);
            this._logger.debug('Validating category ID', {
                ...context,
                categoryId,
            });
            if (!mongoose_1.Types.ObjectId.isValid(categoryId)) {
                this._logger.warn('Invalid category ID provided', context);
                throw new Error(constants_1.SERVICE_MESSAGES.INVALID_CATEGORY_ID);
            }
            const skip = (page - 1) * limit;
            let services;
            let total;
            if (search) {
                this._logger.debug('Performing search for services in category', {
                    ...context,
                    searchQuery: search,
                });
                services = await this._serviceRepository.searchByCategory(categoryId, search, limit, { name: 1 }, status);
                total = services.length;
                this._logger.debug('Category search completed', {
                    ...context,
                    servicesFound: services.length,
                });
            }
            else {
                this._logger.debug('Fetching all services in category with pagination', {
                    ...context,
                    skip,
                    limit,
                });
                services = await this._serviceRepository.findAll({ categoryId: new mongoose_1.Types.ObjectId(categoryId) }, skip, limit, { name: 1 }, search, status);
                total = await this._serviceRepository.count({ categoryId: new mongoose_1.Types.ObjectId(categoryId) }, status, search);
                this._logger.debug('Services retrieved from repository', {
                    ...context,
                    servicesCount: services.length,
                    totalCount: total,
                });
            }
            this._logger.debug('Counting items for each service', {
                ...context,
                servicesToProcess: services.length,
            });
            const servicesWithCounts = await Promise.all(services.map(async (service) => {
                const itemCount = await itemSchema_1.Item.countDocuments({
                    serviceId: service._id,
                    isActive: true,
                });
                return {
                    ...service.toObject(),
                    itemCount,
                };
            }));
            this._logger.debug('Item counts calculated for all services', {
                ...context,
                processedServices: servicesWithCounts.length,
            });
            const result = (0, serviceMapper_1.toServiceListResponseDto)(servicesWithCounts, total, page, limit);
            this._logger.info('Services by category retrieved successfully', {
                ...context,
                totalServices: total,
                returnedServices: result.services.length,
            });
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Get services by category operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    async getAllServices(page = 1, limit = 10, search, sortBy = 'name', sortOrder = 'asc', status) {
        const context = {
            operation: 'getAllServices',
            data: {
                page,
                limit,
                hasSearch: !!search,
                searchQuery: search,
                sortBy,
                sortOrder,
                hasStatusFilter: !!status && status !== 'All Status',
                statusFilter: status,
            },
        };
        try {
            this._logger.info('Fetching all services', context);
            const skip = (page - 1) * limit;
            let services;
            let total;
            // Build sort object
            const sortOptions = {};
            switch (sortBy) {
                case 'price':
                    sortOptions.avgBasePrice = sortOrder === 'desc' ? -1 : 1;
                    break;
                case 'rating':
                    sortOptions.rating = sortOrder === 'desc' ? -1 : 1;
                    break;
                case 'name':
                default:
                    sortOptions.name = sortOrder === 'desc' ? -1 : 1;
                    break;
            }
            if (search) {
                this._logger.debug('Performing search for services', {
                    ...context,
                    searchQuery: search,
                });
                services = await this._serviceRepository.search(search, limit, sortOptions, status);
                total = services.length;
                this._logger.debug('Search completed', {
                    ...context,
                    servicesFound: services.length,
                });
            }
            else {
                this._logger.debug('Fetching all services with pagination', {
                    ...context,
                    skip,
                    limit,
                    sortOptions,
                });
                services = await this._serviceRepository.findAll({}, skip, limit, sortOptions, search, status);
                total = await this._serviceRepository.count({}, status, search);
                this._logger.debug('Services retrieved from repository', {
                    ...context,
                    servicesCount: services.length,
                    totalCount: total,
                });
            }
            const result = (0, serviceMapper_1.toServiceListResponseDto)(services, total, page, limit);
            this._logger.info('All services retrieved successfully', {
                ...context,
                totalServices: total,
                returnedServices: result.services.length,
            });
            return result;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Get all services operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    async updateService(serviceId, updateDto) {
        const context = {
            operation: 'updateService',
            data: {
                serviceId,
                updateFields: Object.keys(updateDto),
            },
        };
        try {
            this._logger.info('Updating service', context);
            // Check if service exists
            this._logger.debug('Checking if service exists', context);
            const existingService = await this._serviceRepository.findById(serviceId);
            if (!existingService) {
                this._logger.warn('Service not found for update', context);
                throw new Error(constants_1.SERVICE_MESSAGES.SERVICE_NOT_FOUND);
            }
            this._logger.debug('Service found, checking for name changes', {
                ...context,
                currentName: existingService.name,
                newName: updateDto.name,
            });
            // If name is being updated, check for duplicates
            if (updateDto.name && updateDto.name !== existingService.name) {
                this._logger.debug('Service name is being changed, checking for duplicates', {
                    ...context,
                    newName: updateDto.name,
                });
                const duplicateService = await this._serviceRepository.findByName(updateDto.name);
                if (duplicateService &&
                    duplicateService._id.toString() !== serviceId) {
                    this._logger.warn('Service update failed - duplicate name found', {
                        ...context,
                        duplicateServiceId: duplicateService._id?.toString(),
                    });
                    throw new Error(constants_1.SERVICE_MESSAGES.SERVICE_ALREADY_EXISTS);
                }
                this._logger.debug('No duplicate name found, proceeding with update', context);
            }
            const updatePayload = { ...updateDto };
            // Handle optional fields
            if (updatePayload.rating === undefined) {
                delete updatePayload.rating;
                this._logger.debug('Rating field removed from update payload as it was undefined', context);
            }
            // Handle category ID conversion
            if (updatePayload.categoryId &&
                mongoose_1.Types.ObjectId.isValid(updatePayload.categoryId)) {
                updatePayload.categoryId = new mongoose_1.Types.ObjectId(updatePayload.categoryId);
                this._logger.debug('Category ID converted to ObjectId', {
                    ...context,
                    categoryId: updatePayload.categoryId.toString(),
                });
            }
            this._logger.debug('Performing service update in repository', {
                ...context,
                updatePayload: {
                    ...updatePayload,
                    categoryId: updatePayload.categoryId?.toString(),
                },
            });
            const updatedService = await this._serviceRepository.update(serviceId, updatePayload);
            if (!updatedService) {
                this._logger.error('Service repository update returned null', context);
                throw new Error(constants_1.SERVICE_MESSAGES.FAILED_UPDATE_SERVICE);
            }
            this._logger.info('Service updated successfully', {
                ...context,
                serviceId: updatedService._id?.toString(),
            });
            return (0, serviceMapper_1.toServiceResponseDto)(updatedService);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Update service operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    async deleteService(serviceId) {
        const context = {
            operation: 'deleteService',
            data: { serviceId },
        };
        try {
            this._logger.info('Deleting service', context);
            // Check if service exists
            this._logger.debug('Checking if service exists for deletion', context);
            const existingService = await this._serviceRepository.findById(serviceId);
            if (!existingService) {
                this._logger.warn('Service not found for deletion', context);
                throw new Error(constants_1.SERVICE_MESSAGES.SERVICE_NOT_FOUND);
            }
            this._logger.debug('Service found, proceeding with deletion', {
                ...context,
                serviceName: existingService.name,
            });
            const deleted = await this._serviceRepository.delete(serviceId);
            if (!deleted) {
                this._logger.error('Service repository deletion returned false', context);
                throw new Error(constants_1.SERVICE_MESSAGES.FAILED_DELETE_SERVICE);
            }
            this._logger.info('Service deleted successfully', context);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Delete service operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    async searchServices(query, limit = 10) {
        const context = {
            operation: 'searchServices',
            data: {
                query,
                limit,
            },
        };
        try {
            this._logger.info('Searching services', context);
            this._logger.debug('Performing search in repository', context);
            const services = await this._serviceRepository.search(query, limit);
            this._logger.info('Service search completed successfully', {
                ...context,
                servicesFound: services.length,
            });
            return services.map(service => (0, serviceMapper_1.toServiceResponseDto)(service));
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Search services operation failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
}
exports.ServiceService = ServiceService;
