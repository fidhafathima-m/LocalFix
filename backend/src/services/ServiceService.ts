// services/user/ServiceService.ts
import { IUserServiceService } from '../interfaces/services/user/IServiceService';
import { IServiceRepository } from '../interfaces/repository/admin/IServiceRepository';
import {
  ServiceResponseDto,
  ServiceListResponseDto,
} from '../interfaces/dtos/serviceDtos';
import { SERVICE_MESSAGES } from '../constants';
import { Types } from 'mongoose';
import { ILogger } from '@/interfaces/utils/ILogger';
import {
  toServiceListResponseDto,
  toServiceResponseDto,
} from '../mappers/serviceMapper';

export class UserServiceService implements IUserServiceService {
  private _serviceRepository: IServiceRepository;
  private _logger: ILogger;

  constructor(serviceRepository: IServiceRepository, logger: ILogger) {
    this._serviceRepository = serviceRepository;
    this._logger = logger;
  }

  async getServiceById(serviceId: string): Promise<ServiceResponseDto> {
    const context = {
      operation: 'UserServiceService.getServiceById',
      data: { serviceId },
    };

    try {
      this._logger.info('Fetching service by ID for user', context);

      const service = await this._serviceRepository.findById(serviceId);

      if (!service) {
        this._logger.warn('Service not found by ID', context);
        throw new Error(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
      }

      // Check if service is active
      if (service.status !== 'active') {
        this._logger.warn('Service is not active', {
          ...context,
          status: service.status,
        });
        throw new Error(SERVICE_MESSAGES.SERVICE_NOT_AVAILABLE);
      }

      this._logger.info('Service retrieved successfully for user', {
        ...context,
        serviceId: service._id?.toString(),
        serviceName: service.name,
      });

      return toServiceResponseDto(service);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Get service by ID operation failed for user', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async getServiceBySlug(slug: string): Promise<ServiceResponseDto> {
    const context = {
      operation: 'UserServiceService.getServiceBySlug',
      data: { slug },
    };

    try {
      this._logger.info('Fetching service by slug for user', context);

      const service = await this._serviceRepository.findBySlug(slug);

      if (!service) {
        this._logger.warn('Service not found by slug', context);
        throw new Error(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
      }

      // Check if service is active
      if (service.status !== 'active') {
        this._logger.warn('Service is not active', {
          ...context,
          status: service.status,
        });
        throw new Error(SERVICE_MESSAGES.SERVICE_NOT_AVAILABLE);
      }

      this._logger.info('Service retrieved successfully by slug for user', {
        ...context,
        serviceId: service._id?.toString(),
        serviceName: service.name,
      });

      return toServiceResponseDto(service);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Get service by slug operation failed for user', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
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
      operation: 'UserServiceService.getAllServices',
      data: {
        page,
        limit,
        hasSearch: !!search,
        searchQuery: search,
        sortBy,
        sortOrder,
      },
    };

    try {
      this._logger.info('Fetching all active services for user', context);

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
        case 'popular':
          sortOptions.popular = sortOrder === 'desc' ? -1 : 1;
          break;
        case 'name':
        default:
          sortOptions.name = sortOrder === 'desc' ? -1 : 1;
          break;
      }

      // Only fetch active services for users
      const filter = { status: 'active' };

      if (search) {
        this._logger.debug('Performing search for active services', {
          ...context,
          searchQuery: search,
        });

        services = await this._serviceRepository.search(
          search,
          limit,
          sortOptions
        );
        // Filter only active services from search results
        services = services.filter(service => service.status === 'active');
        total = services.length;

        this._logger.debug('Search completed for active services', {
          ...context,
          servicesFound: services.length,
        });
      } else {
        this._logger.debug('Fetching all active services with pagination', {
          ...context,
          skip,
          limit,
          sortOptions,
        });

        services = await this._serviceRepository.findAll(
          filter,
          skip,
          limit,
          sortOptions
        );
        total = await this._serviceRepository.count(filter);

        this._logger.debug('Active services retrieved from repository', {
          ...context,
          servicesCount: services.length,
          totalCount: total,
        });
      }

      const result = toServiceListResponseDto(services, total, page, limit);

      this._logger.info('All active services retrieved successfully for user', {
        ...context,
        totalServices: total,
        returnedServices: result.services.length,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Get all services operation failed for user', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
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
      operation: 'UserServiceService.getServicesByCategoryId',
      data: {
        categoryId,
        page,
        limit,
        hasSearch: !!search,
        searchQuery: search,
      },
    };

    try {
      this._logger.info(
        'Fetching active services by category ID for user',
        context
      );

      this._logger.debug('Validating category ID', {
        ...context,
        categoryId,
      });

      if (!Types.ObjectId.isValid(categoryId)) {
        this._logger.warn('Invalid category ID provided', context);
        throw new Error(SERVICE_MESSAGES.INVALID_CATEGORY_ID);
      }

      const skip = (page - 1) * limit;
      let services: any[];
      let total: number;

      // Only fetch active services for the category
      const baseFilter = {
        categoryId: new Types.ObjectId(categoryId),
        status: 'active',
      };

      if (search) {
        this._logger.debug('Performing search for services in category', {
          ...context,
          searchQuery: search,
        });

        services = await this._serviceRepository.searchByCategory(
          categoryId,
          search,
          limit
        );
        // Filter only active services from search results
        services = services.filter(service => service.status === 'active');
        total = services.length;

        this._logger.debug('Category search completed for active services', {
          ...context,
          servicesFound: services.length,
        });
      } else {
        this._logger.debug(
          'Fetching all active services in category with pagination',
          {
            ...context,
            skip,
            limit,
          }
        );

        services = await this._serviceRepository.findAll(
          baseFilter,
          skip,
          limit
        );
        total = await this._serviceRepository.count(baseFilter);

        this._logger.debug('Active services retrieved from repository', {
          ...context,
          servicesCount: services.length,
          totalCount: total,
        });
      }

      const result = toServiceListResponseDto(services, total, page, limit);

      this._logger.info(
        'Active services by category retrieved successfully for user',
        {
          ...context,
          totalServices: total,
          returnedServices: result.services.length,
        }
      );

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Get services by category operation failed for user', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async searchServices(
    query: string,
    limit: number = 10
  ): Promise<ServiceResponseDto[]> {
    const context = {
      operation: 'UserServiceService.searchServices',
      data: {
        query,
        limit,
      },
    };

    try {
      this._logger.info('Searching active services for user', context);

      this._logger.debug('Performing search in repository', context);

      const services = await this._serviceRepository.search(query, limit);

      // Filter only active services
      const activeServices = services.filter(
        service => service.status === 'active'
      );

      this._logger.info('Service search completed successfully for user', {
        ...context,
        servicesFound: activeServices.length,
      });

      return activeServices.map(service => toServiceResponseDto(service));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Search services operation failed for user', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
