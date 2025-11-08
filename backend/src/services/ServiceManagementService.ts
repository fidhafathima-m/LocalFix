import { IServiceService } from "../interfaces/services/admin/IServiceManagementService";
import { IServiceRepository } from "../interfaces/repository/admin/IServiceRepository";
import {
  ServiceResponseDto,
  CreateServiceDto,
  UpdateServiceDto,
  ServiceListResponseDto,
} from "../interfaces/dtos/serviceDtos";
import { ServiceMapper } from "../mappers/serviceMapper";
import { SERVICE_MESSAGES, ServiceStatus } from "../constants";
import { Types } from "mongoose";
import { Item } from "../models/category/itemSchema";
import { LoggerService } from "../services/LoggerService";

export class ServiceService implements IServiceService {
  private serviceRepository: IServiceRepository;
  private serviceMapper: ServiceMapper;
  private logger: LoggerService;

  constructor(serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;
    this.serviceMapper = new ServiceMapper();
    this.logger = new LoggerService();
  }

  async createService(
    createDto: CreateServiceDto
  ): Promise<ServiceResponseDto> {
    const context = {
      operation: 'createService',
      data: { 
        serviceName: createDto.name,
        categoryId: createDto.categoryId,
        hasDescription: !!createDto.description,
        hasImage: !!createDto.iconUrl,
        status: createDto.status || ServiceStatus.ACTIVE
      }
    };

    try {
      this.logger.info('Creating new service', context);

      // Check if service with same name already exists
      this.logger.debug('Checking for existing service with same name', {
        ...context,
        serviceName: createDto.name
      });

      const existingService = await this.serviceRepository.findByName(
        createDto.name
      );
      
      if (existingService) {
        this.logger.warn('Service creation failed - service already exists', {
          ...context,
          existingServiceId: existingService._id?.toString()
        });
        throw new Error(SERVICE_MESSAGES.SERVICE_ALREADY_EXISTS);
      }

      // Validate category ID
      this.logger.debug('Validating category ID', {
        ...context,
        categoryId: createDto.categoryId
      });

      if (!Types.ObjectId.isValid(createDto.categoryId)) {
        this.logger.warn('Invalid category ID provided', {
          ...context,
          categoryId: createDto.categoryId
        });
        throw new Error(SERVICE_MESSAGES.INVALID_CATEGORY_ID);
      }

      const serviceData = {
        ...createDto,
        categoryId: new Types.ObjectId(createDto.categoryId),
        status: createDto.status || ServiceStatus.ACTIVE,
        rating: createDto.rating || 4.5,
        estimatedDuration: createDto.estimatedDuration || "2-4 hours",
        features: createDto.features || [],
        popular: createDto.popular || false,
      };

      this.logger.debug('Creating service with data', {
        ...context,
        serviceData: {
          ...serviceData,
          categoryId: serviceData.categoryId.toString(),
          featuresCount: serviceData.features.length
        }
      });

      const service = await this.serviceRepository.create(serviceData);
      
      this.logger.info('Service created successfully', {
        ...context,
        serviceId: service._id?.toString()
      });

      return this.serviceMapper.toServiceResponseDto(service);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Create service operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async getServiceById(serviceId: string): Promise<ServiceResponseDto> {
    const context = {
      operation: 'getServiceById',
      data: { serviceId }
    };

    try {
      this.logger.info('Fetching service by ID', context);

      const service = await this.serviceRepository.findById(serviceId);
      
      if (!service) {
        this.logger.warn('Service not found by ID', context);
        throw new Error(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
      }

      this.logger.debug('Service found, counting active items', {
        ...context,
        serviceName: service.name
      });

      const itemCount = await Item.countDocuments({
        serviceId: service._id,
        isActive: true,
      });

      this.logger.debug('Item count retrieved', {
        ...context,
        itemCount
      });

      const serviceWithCount = {
        ...service.toObject(),
        itemCount,
      };

      this.logger.info('Service retrieved successfully with item count', {
        ...context,
        serviceId: service._id?.toString(),
        itemCount
      });

      return this.serviceMapper.toServiceResponseDto(serviceWithCount);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Get service by ID operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async getServiceBySlug(slug: string): Promise<ServiceResponseDto> {
    const context = {
      operation: 'getServiceBySlug',
      data: { slug }
    };

    try {
      this.logger.info('Fetching service by slug', context);

      const service = await this.serviceRepository.findBySlug(slug);
      
      if (!service) {
        this.logger.warn('Service not found by slug', context);
        throw new Error(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
      }

      this.logger.info('Service retrieved successfully by slug', {
        ...context,
        serviceId: service._id?.toString(),
        serviceName: service.name
      });

      return this.serviceMapper.toServiceResponseDto(service);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Get service by slug operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async getServicesByCategoryId(
    categoryId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ServiceListResponseDto> {
    const context = {
      operation: 'getServicesByCategoryId',
      data: { 
        categoryId,
        page, 
        limit, 
        hasSearch: !!search,
        searchQuery: search 
      }
    };

    try {
      this.logger.info('Fetching services by category ID', context);

      this.logger.debug('Validating category ID', {
        ...context,
        categoryId
      });

      if (!Types.ObjectId.isValid(categoryId)) {
        this.logger.warn('Invalid category ID provided', context);
        throw new Error(SERVICE_MESSAGES.INVALID_CATEGORY_ID);
      }

      const skip = (page - 1) * limit;
      let services: any[];
      let total: number;

      if (search) {
        this.logger.debug('Performing search for services in category', {
          ...context,
          searchQuery: search
        });

        services = await this.serviceRepository.searchByCategory(
          categoryId,
          search,
          limit
        );
        total = services.length;

        this.logger.debug('Category search completed', {
          ...context,
          servicesFound: services.length
        });
      } else {
        this.logger.debug('Fetching all services in category with pagination', {
          ...context,
          skip,
          limit
        });

        services = await this.serviceRepository.findAll(
          { categoryId: new Types.ObjectId(categoryId) },
          skip,
          limit
        );
        total = await this.serviceRepository.count({ categoryId: new Types.ObjectId(categoryId) });

        this.logger.debug('Services retrieved from repository', {
          ...context,
          servicesCount: services.length,
          totalCount: total
        });
      }

      this.logger.debug('Counting items for each service', {
        ...context,
        servicesToProcess: services.length
      });

      const servicesWithCounts = await Promise.all(
        services.map(async (service) => {
          const itemCount = await Item.countDocuments({
            serviceId: service._id,
            isActive: true,
          });
          
          return {
            ...service.toObject(),
            itemCount,
          };
        })
      );

      this.logger.debug('Item counts calculated for all services', {
        ...context,
        processedServices: servicesWithCounts.length
      });

      const result = this.serviceMapper.toServiceListResponseDto(
        servicesWithCounts,
        total,
        page,
        limit
      );

      this.logger.info('Services by category retrieved successfully', {
        ...context,
        totalServices: total,
        returnedServices: result.services.length,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Get services by category operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async getAllServices(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = 'name',
    sortOrder: string = 'asc'
  ): Promise<ServiceListResponseDto> {
    const context = {
      operation: 'getAllServices',
      data: { 
        page, 
        limit, 
        hasSearch: !!search,
        searchQuery: search,
        sortBy,
        sortOrder
      }
    };

    try {
      this.logger.info('Fetching all services', context);

      const skip = (page - 1) * limit;
      let services: any[];
      let total: number;

      // Build sort object
      const sortOptions: any = {};
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
        this.logger.debug('Performing search for services', {
          ...context,
          searchQuery: search
        });

        services = await this.serviceRepository.search(search, limit, sortOptions);
        total = services.length;

        this.logger.debug('Search completed', {
          ...context,
          servicesFound: services.length
        });
      } else {
        this.logger.debug('Fetching all services with pagination', {
          ...context,
          skip,
          limit,
          sortOptions
        });

        services = await this.serviceRepository.findAll({}, skip, limit, sortOptions);
        total = await this.serviceRepository.count();

        this.logger.debug('Services retrieved from repository', {
          ...context,
          servicesCount: services.length,
          totalCount: total
        });
      }

      const result = this.serviceMapper.toServiceListResponseDto(
        services,
        total,
        page,
        limit
      );

      this.logger.info('All services retrieved successfully', {
        ...context,
        totalServices: total,
        returnedServices: result.services.length,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Get all services operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async updateService(
    serviceId: string,
    updateDto: UpdateServiceDto
  ): Promise<ServiceResponseDto> {
    const context = {
      operation: 'updateService',
      data: { 
        serviceId,
        updateFields: Object.keys(updateDto)
      }
    };

    try {
      this.logger.info('Updating service', context);

      // Check if service exists
      this.logger.debug('Checking if service exists', context);
      
      const existingService = await this.serviceRepository.findById(serviceId);
      
      if (!existingService) {
        this.logger.warn('Service not found for update', context);
        throw new Error(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
      }

      this.logger.debug('Service found, checking for name changes', {
        ...context,
        currentName: existingService.name,
        newName: updateDto.name
      });

      // If name is being updated, check for duplicates
      if (updateDto.name && updateDto.name !== existingService.name) {
        this.logger.debug('Service name is being changed, checking for duplicates', {
          ...context,
          newName: updateDto.name
        });

        const duplicateService = await this.serviceRepository.findByName(
          updateDto.name
        );
        
        if (
          duplicateService &&
          (duplicateService as any)._id.toString() !== serviceId
        ) {
          this.logger.warn('Service update failed - duplicate name found', {
            ...context,
            duplicateServiceId: (duplicateService as any)._id?.toString()
          });
          throw new Error(SERVICE_MESSAGES.SERVICE_ALREADY_EXISTS);
        }

        this.logger.debug('No duplicate name found, proceeding with update', context);
      }

      const updatePayload: any = { ...updateDto };

      // Handle optional fields
      if (updatePayload.rating === undefined) {
        delete updatePayload.rating;
        this.logger.debug('Rating field removed from update payload as it was undefined', context);
      }

      // Handle category ID conversion
      if (
        updatePayload.categoryId &&
        Types.ObjectId.isValid(updatePayload.categoryId)
      ) {
        updatePayload.categoryId = new Types.ObjectId(updatePayload.categoryId);
        this.logger.debug('Category ID converted to ObjectId', {
          ...context,
          categoryId: updatePayload.categoryId.toString()
        });
      }

      this.logger.debug('Performing service update in repository', {
        ...context,
        updatePayload: {
          ...updatePayload,
          categoryId: updatePayload.categoryId?.toString()
        }
      });

      const updatedService = await this.serviceRepository.update(
        serviceId,
        updatePayload as any
      );
      
      if (!updatedService) {
        this.logger.error('Service repository update returned null', context);
        throw new Error(SERVICE_MESSAGES.FAILED_UPDATE_SERVICE);
      }

      this.logger.info('Service updated successfully', {
        ...context,
        serviceId: updatedService._id?.toString()
      });

      return this.serviceMapper.toServiceResponseDto(updatedService);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Update service operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async deleteService(serviceId: string): Promise<void> {
    const context = {
      operation: 'deleteService',
      data: { serviceId }
    };

    try {
      this.logger.info('Deleting service', context);

      // Check if service exists
      this.logger.debug('Checking if service exists for deletion', context);
      
      const existingService = await this.serviceRepository.findById(serviceId);
      
      if (!existingService) {
        this.logger.warn('Service not found for deletion', context);
        throw new Error(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
      }

      this.logger.debug('Service found, proceeding with deletion', {
        ...context,
        serviceName: existingService.name
      });

      const deleted = await this.serviceRepository.delete(serviceId);
      
      if (!deleted) {
        this.logger.error('Service repository deletion returned false', context);
        throw new Error(SERVICE_MESSAGES.FAILED_DELETE_SERVICE);
      }

      this.logger.info('Service deleted successfully', context);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Delete service operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async searchServices(
    query: string,
    limit: number = 10
  ): Promise<ServiceResponseDto[]> {
    const context = {
      operation: 'searchServices',
      data: { 
        query, 
        limit 
      }
    };

    try {
      this.logger.info('Searching services', context);

      this.logger.debug('Performing search in repository', context);

      const services = await this.serviceRepository.search(query, limit);

      this.logger.info('Service search completed successfully', {
        ...context,
        servicesFound: services.length
      });

      return services.map((service) =>
        this.serviceMapper.toServiceResponseDto(service)
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error('Search services operation failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
}