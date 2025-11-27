import { Response } from 'express';
import { ISubscriptionService } from '../../interfaces/services/admin/ISubscriptionManagementService';
import { ResponseHelper } from '../../utils/responseHelper';
import {
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
} from '../../interfaces/dtos/subscriptionDtos';
import { ILogger } from '../../interfaces/utils/ILogger';
import { SUBSCRIPTION_MESSAGES } from '../../constants';
import { AuthRequest } from '../../types/express';

export class SubscriptionManagementController {
  private _subscriptionService: ISubscriptionService;
  private _logger: ILogger;

  constructor(subscriptionService: ISubscriptionService, logger: ILogger) {
    this._subscriptionService = subscriptionService;
    this._logger = logger;
  }

  createSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const context = {
      operation: 'createSubscription',
      body: req.body,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Creating new subscription plan', context);

      const createDto: CreateSubscriptionDto = req.body;

      // Validation
      if (!createDto.name?.trim()) {
        const response = ResponseHelper.badRequest(
          SUBSCRIPTION_MESSAGES.NAME_REQUIRED
        );
        res.status(response.statusCode).json(response);
        return;
      }

      if (createDto.price === undefined || createDto.price < 0) {
        const response = ResponseHelper.badRequest(
          SUBSCRIPTION_MESSAGES.PRICE_REQUIRED
        );
        res.status(response.statusCode).json(response);
        return;
      }

      if (!createDto.durationMonths || createDto.durationMonths < 1) {
        const response = ResponseHelper.badRequest(
          SUBSCRIPTION_MESSAGES.DURATION_REQUIRED
        );
        res.status(response.statusCode).json(response);
        return;
      }

      const subscription =
        await this._subscriptionService.createSubscription(createDto);

      this._logger.info('Subscription created successfully', {
        ...context,
        subscriptionId: subscription.id,
        subscriptionName: subscription.name,
      });

      const response = ResponseHelper.success(
        SUBSCRIPTION_MESSAGES.SUBSCRIPTION_CREATED,
        { subscription }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : SUBSCRIPTION_MESSAGES.FAILED_CREATE_SUBSCRIPTION;
      this._logger.error('Create subscription controller error', {
        ...context,
        error: errorMessage,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

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

      const subscription =
        await this._subscriptionService.getSubscriptionById(id);

      const response = ResponseHelper.success(
        SUBSCRIPTION_MESSAGES.SUBSCRIPTION_RETRIEVED,
        { subscription }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND;
      this._logger.error('Get subscription by ID controller error', {
        ...context,
        error: errorMessage,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getSubscriptionBySlug = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { slug } = req.params;
    const context = {
      operation: 'getSubscriptionBySlug',
      slug,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching subscription by slug', context);

      const subscription =
        await this._subscriptionService.getSubscriptionBySlug(slug);

      const response = ResponseHelper.success(
        SUBSCRIPTION_MESSAGES.SUBSCRIPTION_RETRIEVED,
        { subscription }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND;
      this._logger.error('Get subscription by slug controller error', {
        ...context,
        error: errorMessage,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getAllSubscriptions = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const context = {
      operation: 'getAllSubscriptions',
      page,
      limit,
      search,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching all subscriptions', context);

      const result = await this._subscriptionService.getAllSubscriptions(
        page,
        limit,
        search
      );

      const response = ResponseHelper.success(
        SUBSCRIPTION_MESSAGES.SUBSCRIPTIONS_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : SUBSCRIPTION_MESSAGES.FAILED_FETCH_SUBSCRIPTIONS;
      this._logger.error('Get all subscriptions controller error', {
        ...context,
        error: errorMessage,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  updateSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const updateDto: UpdateSubscriptionDto = req.body;

    const context = {
      operation: 'updateSubscription',
      subscriptionId: id,
      updateFields: Object.keys(updateDto),
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Updating subscription', context);

      const subscription = await this._subscriptionService.updateSubscription(
        id,
        updateDto
      );

      const response = ResponseHelper.success(
        SUBSCRIPTION_MESSAGES.SUBSCRIPTION_UPDATED,
        { subscription }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : SUBSCRIPTION_MESSAGES.FAILED_UPDATE_SUBSCRIPTION;
      this._logger.error('Update subscription controller error', {
        ...context,
        error: errorMessage,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  deleteSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'deleteSubscription',
      subscriptionId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Deleting subscription', context);

      await this._subscriptionService.deleteSubscription(id);

      const response = ResponseHelper.success(
        SUBSCRIPTION_MESSAGES.SUBSCRIPTION_DELETED
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : SUBSCRIPTION_MESSAGES.FAILED_DELETE_SUBSCRIPTION;
      this._logger.error('Delete subscription controller error', {
        ...context,
        error: errorMessage,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  searchSubscriptions = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;

    const context = {
      operation: 'searchSubscriptions',
      query: q,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Searching subscriptions', context);

      if (!q || typeof q !== 'string') {
        const response = ResponseHelper.badRequest('Search query is required');
        res.status(response.statusCode).json(response);
        return;
      }

      const subscriptions = await this._subscriptionService.searchSubscriptions(
        q,
        limit
      );

      const response = ResponseHelper.success(
        'Subscriptions search completed',
        {
          subscriptions,
        }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      this._logger.error('Search subscriptions controller error', {
        ...context,
        error:
          error instanceof Error
            ? error.message
            : 'Error in searching subscriptions',
      });

      const response = ResponseHelper.error('Failed to search subscriptions');
      res.status(response.statusCode).json(response);
    }
  };
}
