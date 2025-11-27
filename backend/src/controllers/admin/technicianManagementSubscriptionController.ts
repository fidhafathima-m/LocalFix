import { Response } from 'express';
import { AuthRequest } from '../../types/express';

import { ResponseHelper } from '../../utils/responseHelper';
import { ILogger } from '../../interfaces/utils/ILogger';
import { ITechnicianSubscriptionService } from '../../interfaces/services/admin/ITechicianSubscriptionService';

export class TechnicianManagementSubscriptionController {
  private _subscriptionService: ITechnicianSubscriptionService;
  private _logger: ILogger;

  constructor(
    subscriptionService: ITechnicianSubscriptionService,
    logger: ILogger
  ) {
    this._subscriptionService = subscriptionService;
    this._logger = logger;
  }

  // Admin: Get all technician subscriptions
  getTechnicianSubscriptions = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const context = {
      operation: 'getTechnicianSubscriptions',
      query: req.query,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technician subscriptions', context);

      const {
        page = 1,
        limit = 10,
        status,
        technicianId,
        subscriptionPlanId,
      } = req.query;

      const filters = {
        page: Number(page),
        limit: Number(limit),
        ...(status && { status: status as string }),
        ...(technicianId && { technicianId: technicianId as string }),
        ...(subscriptionPlanId && {
          subscriptionPlanId: subscriptionPlanId as string,
        }),
      };

      const result =
        await this._subscriptionService.getTechnicianSubscriptions(filters);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get technician subscriptions controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      const errorResponse = ResponseHelper.error(
        'Failed to fetch subscriptions'
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Admin: Get subscription statistics
  getSubscriptionStats = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const context = {
      operation: 'getSubscriptionStats',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching subscription statistics', context);

      const result = await this._subscriptionService.getSubscriptionStats();

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get subscription stats controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      const errorResponse = ResponseHelper.error(
        'Failed to fetch subscription statistics'
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Admin: Get subscription by ID
  getSubscriptionById = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'getSubscriptionById',
      subscriptionId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching subscription by ID', context);

      const result = await this._subscriptionService.getSubscriptionById(id);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get subscription by ID controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      const errorResponse = ResponseHelper.error(
        'Failed to fetch subscription'
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Admin: Get subscriptions by technician
  getSubscriptionsByTechnician = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { technicianId } = req.params;
    const context = {
      operation: 'getSubscriptionsByTechnician',
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching subscriptions by technician', context);

      const { page = 1, limit = 10 } = req.query;
      const result =
        await this._subscriptionService.getSubscriptionsByTechnician(
          technicianId,
          Number(page),
          Number(limit)
        );

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get subscriptions by technician controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      const errorResponse = ResponseHelper.error(
        'Failed to fetch technician subscriptions'
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Admin: Update subscription status
  updateSubscriptionStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const { status, reason } = req.body;
    const context = {
      operation: 'updateSubscriptionStatus',
      subscriptionId: id,
      newStatus: status,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Updating subscription status', context);

      const result = await this._subscriptionService.updateSubscriptionStatus(
        id,
        status,
        reason
      );

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Update subscription status controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      const errorResponse = ResponseHelper.error(
        'Failed to update subscription status'
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Technician: Get my subscriptions
  getMySubscriptions = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = (req as AuthRequest).user?.id;
    const context = {
      operation: 'getMySubscriptions',
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technician subscriptions', context);

      const { page = 1, limit = 10 } = req.query;

      const result =
        await this._subscriptionService.getSubscriptionsByTechnician(
          technicianId!,
          Number(page),
          Number(limit)
        );

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get my subscriptions controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      const errorResponse = ResponseHelper.error(
        'Failed to fetch your subscriptions'
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Technician: Get current active subscription
  getCurrentSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = (req as AuthRequest).user?.id;
    const context = {
      operation: 'getCurrentSubscription',
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching current subscription', context);

      const result = await this._subscriptionService.getCurrentSubscription(
        technicianId!
      );

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get current subscription controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      const errorResponse = ResponseHelper.error(
        'Failed to fetch current subscription'
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Admin: Get current subscription for a specific technician
  getTechnicianCurrentSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { technicianId } = req.params;
    const context = {
      operation: 'getTechnicianCurrentSubscription',
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technician current subscription', context);

      const result =
        await this._subscriptionService.getCurrentSubscription(technicianId);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error(
        'Get technician current subscription controller error',
        {
          ...context,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );

      const errorResponse = ResponseHelper.error(
        'Failed to fetch technician subscription'
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Technician: Create new subscription
  createSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = (req as AuthRequest).user?.id;
    const subscriptionData = req.body;
    const context = {
      operation: 'createSubscription',
      technicianId,
      subscriptionPlanId: subscriptionData.subscriptionPlanId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Creating new subscription', context);

      const result = await this._subscriptionService.createSubscription(
        technicianId!,
        subscriptionData
      );

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Create subscription controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      const errorResponse = ResponseHelper.error(
        'Failed to create subscription'
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Technician: Cancel subscription
  cancelSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = (req as AuthRequest).user?.id;
    const { subscriptionId, reason } = req.body;
    const context = {
      operation: 'cancelSubscription',
      technicianId,
      subscriptionId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Cancelling subscription', context);

      const result = await this._subscriptionService.cancelSubscription(
        technicianId!,
        subscriptionId,
        reason
      );

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Cancel subscription controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      const errorResponse = ResponseHelper.error(
        'Failed to cancel subscription'
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
