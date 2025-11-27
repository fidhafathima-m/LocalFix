import { IUserServiceService } from '../../interfaces/services/user/IServiceService';
import { ResponseHelper } from '../../utils/responseHelper';
import { SERVICE_MESSAGES } from '../../constants';
import { ILogger } from '../../interfaces/utils/ILogger';
import { AuthRequest } from '../../middleware/authMiddleware';
import { Response } from 'express';

export class UserServiceController {
  private _userServiceService: IUserServiceService;
  private _logger: ILogger;

  constructor(userServiceService: IUserServiceService, logger: ILogger) {
    this._userServiceService = userServiceService;
    this._logger = logger;
  }

  getServiceById = async (req: AuthRequest, res: Response): Promise<void> => {
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

      const response = ResponseHelper.success(
        SERVICE_MESSAGES.SERVICE_RETRIEVED,
        { service }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : SERVICE_MESSAGES.SERVICE_NOT_FOUND;
      this._logger.error('Get service by ID controller error for user', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getServiceBySlug = async (req: AuthRequest, res: Response): Promise<void> => {
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

      const response = ResponseHelper.success(
        SERVICE_MESSAGES.SERVICE_RETRIEVED,
        { service }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : SERVICE_MESSAGES.SERVICE_NOT_FOUND;
      this._logger.error('Get service by slug controller error for user', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getServicesByCategoryId = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

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

      const result = await this._userServiceService.getServicesByCategoryId(
        categoryId,
        page,
        limit,
        search
      );

      this._logger.info(
        'Services by category retrieved successfully for user',
        {
          ...context,
          totalServices: result.total,
        }
      );

      const response = ResponseHelper.success(
        SERVICE_MESSAGES.SERVICES_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : SERVICE_MESSAGES.FAILED_FETCH_SERVICES;
      this._logger.error('Get services by category controller error for user', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getAllServices = async (req: AuthRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || 'name';
    const sortOrder = (req.query.sortOrder as string) || 'asc';

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

      const result = await this._userServiceService.getAllServices(
        page,
        limit,
        search,
        sortBy,
        sortOrder
      );

      this._logger.info('All active services retrieved successfully for user', {
        ...context,
        totalServices: result.total,
      });

      const response = ResponseHelper.success(
        SERVICE_MESSAGES.SERVICES_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : SERVICE_MESSAGES.FAILED_FETCH_SERVICES;
      this._logger.error('Get all services controller error for user', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  searchServices = async (req: AuthRequest, res: Response): Promise<void> => {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;

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
        const response = ResponseHelper.badRequest('Search query is required');
        res.status(response.statusCode).json(response);
        return;
      }

      const services = await this._userServiceService.searchServices(q, limit);

      this._logger.info('Services search completed successfully for user', {
        ...context,
        resultsCount: services.length,
      });

      const response = ResponseHelper.success('Services search completed', {
        services,
      });
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      this._logger.error('Search services controller error for user', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error('Failed to search services');
      res.status(response.statusCode).json(response);
    }
  };
}
