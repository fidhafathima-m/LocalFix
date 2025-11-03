import { Request, Response } from "express";
import { IServiceService } from "../../interfaces/services/admin/IServiceManagementService";
import { ResponseHelper } from "../../utils/responseHelper";
import { SERVICE_MESSAGES } from "../../constants";
import {
  CreateServiceDto,
  UpdateServiceDto,
} from "../../interfaces/dtos/serviceDtos";
import { LoggerService } from "../../services/LoggerService";

export class ServiceController {
  private serviceService: IServiceService;
  private logger: LoggerService;

  constructor(serviceService: IServiceService) {
    this.serviceService = serviceService;
    this.logger = new LoggerService();
  }

  createService = async (req: Request, res: Response): Promise<void> => {
    const context = {
      operation: 'createService',
      body: req.body,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Creating new service', context);

      const createDto: CreateServiceDto = req.body;

      // Validation
      if (!createDto.name?.trim()) {
        this.logger.warn('Service creation failed - name required', context);
        const response = ResponseHelper.badRequest(
          SERVICE_MESSAGES.NAME_REQUIRED
        );
        res.status(response.statusCode).json(response);
        return;
      }

      if (!createDto.description?.trim()) {
        this.logger.warn('Service creation failed - description required', context);
        const response = ResponseHelper.badRequest(
          SERVICE_MESSAGES.DESCRIPTION_REQUIRED
        );
        res.status(response.statusCode).json(response);
        return;
      }

      if (!createDto.categoryId?.trim()) {
        this.logger.warn('Service creation failed - category ID required', context);
        const response = ResponseHelper.badRequest(
          SERVICE_MESSAGES.CATEGORY_ID_REQUIRED
        );
        res.status(response.statusCode).json(response);
        return;
      }

      if (createDto.avgBasePrice === undefined || createDto.avgBasePrice < 0) {
        this.logger.warn('Service creation failed - invalid base price', {
          ...context,
          providedPrice: createDto.avgBasePrice
        });
        const response = ResponseHelper.badRequest(
          SERVICE_MESSAGES.INVALID_BASE_PRICE
        );
        res.status(response.statusCode).json(response);
        return;
      }

      this.logger.debug('Calling service service to create service', {
        ...context,
        serviceName: createDto.name,
        categoryId: createDto.categoryId,
        basePrice: createDto.avgBasePrice
      });

      const service = await this.serviceService.createService(createDto);
      
      this.logger.info('Service created successfully', {
        ...context,
        serviceId: service?.id,
        serviceName: service?.name,
        categoryId: service?.categoryId
      });

      const response = ResponseHelper.success(
        SERVICE_MESSAGES.SERVICE_CREATED,
        { service }
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || SERVICE_MESSAGES.FAILED_CREATE_SERVICE;
      this.logger.error('Create service controller error', {
        ...context,
        error: errorMessage,
        stack: error.stack
      });
      
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getServiceById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'getServiceById',
      serviceId: id,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching service by ID', context);

      const service = await this.serviceService.getServiceById(id);
      
      this.logger.info('Service retrieved successfully', {
        ...context,
        serviceName: service.name,
        categoryId: service.categoryId
      });

      const response = ResponseHelper.success(
        SERVICE_MESSAGES.SERVICE_RETRIEVED,
        { service }
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || SERVICE_MESSAGES.SERVICE_NOT_FOUND;
      this.logger.error('Get service by ID controller error', {
        ...context,
        error: errorMessage,
        stack: error.stack
      });
      
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getServiceBySlug = async (req: Request, res: Response): Promise<void> => {
    const { slug } = req.params;
    const context = {
      operation: 'getServiceBySlug',
      slug,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching service by slug', context);

      const service = await this.serviceService.getServiceBySlug(slug);
      
      this.logger.info('Service retrieved by slug successfully', {
        ...context,
        serviceId: service.id,
        serviceName: service.name
      });

      const response = ResponseHelper.success(
        SERVICE_MESSAGES.SERVICE_RETRIEVED,
        { service }
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || SERVICE_MESSAGES.SERVICE_NOT_FOUND;
      this.logger.error('Get service by slug controller error', {
        ...context,
        error: errorMessage,
        stack: error.stack
      });
      
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getServicesByCategoryId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    const context = {
      operation: 'getServicesByCategoryId',
      categoryId,
      page,
      limit,
      search,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching services by category ID', context);

      const result = await this.serviceService.getServicesByCategoryId(
        categoryId,
        page,
        limit,
        search
      );
      
      this.logger.info('Services by category retrieved successfully', {
        ...context,
        totalServices: result.total,
      });

      const response = ResponseHelper.success(
        SERVICE_MESSAGES.SERVICES_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || SERVICE_MESSAGES.FAILED_FETCH_SERVICES;
      this.logger.error('Get services by category controller error', {
        ...context,
        error: errorMessage,
        stack: error.stack
      });
      
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getAllServices = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    const context = {
      operation: 'getAllServices',
      page,
      limit,
      search,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching all services', context);

      const result = await this.serviceService.getAllServices(
        page,
        limit,
        search
      );
      
      this.logger.info('All services retrieved successfully', {
        ...context,
        totalServices: result.total,
      });

      const response = ResponseHelper.success(
        SERVICE_MESSAGES.SERVICES_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || SERVICE_MESSAGES.FAILED_FETCH_SERVICES;
      this.logger.error('Get all services controller error', {
        ...context,
        error: errorMessage,
        stack: error.stack
      });
      
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  updateService = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateDto: UpdateServiceDto = req.body;
    
    const context = {
      operation: 'updateService',
      serviceId: id,
      updateFields: Object.keys(updateDto),
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Updating service', context);

      const service = await this.serviceService.updateService(id, updateDto);
      
      this.logger.info('Service updated successfully', {
        ...context,
        serviceName: service.name,
        updatedFields: Object.keys(updateDto)
      });

      const response = ResponseHelper.success(
        SERVICE_MESSAGES.SERVICE_UPDATED,
        { service }
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || SERVICE_MESSAGES.FAILED_UPDATE_SERVICE;
      this.logger.error('Update service controller error', {
        ...context,
        error: errorMessage,
        stack: error.stack
      });
      
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  deleteService = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'deleteService',
      serviceId: id,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Deleting service', context);

      await this.serviceService.deleteService(id);
      
      this.logger.info('Service deleted successfully', context);

      const response = ResponseHelper.success(SERVICE_MESSAGES.SERVICE_DELETED);
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || SERVICE_MESSAGES.FAILED_DELETE_SERVICE;
      this.logger.error('Delete service controller error', {
        ...context,
        error: errorMessage,
        stack: error.stack
      });
      
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  searchServices = async (req: Request, res: Response): Promise<void> => {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const context = {
      operation: 'searchServices',
      query: q,
      limit,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Searching services', context);

      if (!q || typeof q !== "string") {
        this.logger.warn('Search services failed - query required', context);
        const response = ResponseHelper.badRequest("Search query is required");
        res.status(response.statusCode).json(response);
        return;
      }

      const services = await this.serviceService.searchServices(q, limit);
      
      this.logger.info('Services search completed successfully', {
        ...context,
        resultsCount: services.length
      });

      const response = ResponseHelper.success("Services search completed", {
        services,
      });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      this.logger.error('Search services controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const response = ResponseHelper.error("Failed to search services");
      res.status(response.statusCode).json(response);
    }
  };
}