import { Types } from 'mongoose';
import { SubscriptionRepository } from '../repositories/admin/SubscriptionRepository';
import { ResponseHelper } from '../utils/responseHelper';
import { ILogger } from '../interfaces/utils/ILogger';
import {
  ITechnicianSubscriptionRepository,
  SubscriptionFilters as RepositorySubscriptionFilters,
  CreateSubscriptionData as RepositoryCreateSubscriptionData,
} from '../interfaces/repository/admin/ITechnicianSubscriptionRepository';
import {
  SubscriptionListResponseDto,
  SubscriptionResponseDto,
  SubscriptionStatsResponseDto,
  SubscriptionDto,
  SubscriptionStatsDto,
  CreateSubscriptionRequestDto,
} from '../interfaces/dtos/technicianSubscriptionDtos';
import { ITechnicianSubscriptionService } from '../interfaces/services/admin/ITechicianSubscriptionService';
import { ITechnicianSubscription } from '../models/technician/TechnicianSubscriptionSchema';

interface ServiceSubscriptionFilters {
  page: number;
  limit: number;
  status?: string;
  technicianId?: string;
  subscriptionPlanId?: string;
}

export class TechnicianManagementSubscriptionService
  implements ITechnicianSubscriptionService
{
  private _subscriptionRepository: ITechnicianSubscriptionRepository;
  private _logger: ILogger;

  constructor(
    subscriptionRepository: ITechnicianSubscriptionRepository,
    logger: ILogger
  ) {
    this._subscriptionRepository = subscriptionRepository;
    this._logger = logger;
  }

  async getTechnicianSubscriptions(
    filters: ServiceSubscriptionFilters
  ): Promise<SubscriptionListResponseDto> {
    const context = {
      operation: 'getTechnicianSubscriptions',
      filters,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technician subscriptions', context);

      const repoFilters: RepositorySubscriptionFilters = {
        page: filters.page,
        limit: filters.limit,
        status: filters.status,
        technicianId: filters.technicianId,
        subscriptionPlanId: filters.subscriptionPlanId,
      };

      const { subscriptions, total } =
        await this._subscriptionRepository.findSubscriptions(repoFilters);

      const subscriptionDtos: SubscriptionDto[] = subscriptions.map(sub =>
        this.mapSubscriptionToDto(sub)
      );

      return ResponseHelper.success('Subscriptions retrieved successfully', {
        subscriptions: subscriptionDtos,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit),
          hasNext: filters.page < Math.ceil(total / filters.limit),
          hasPrev: filters.page > 1,
        },
      }) as SubscriptionListResponseDto;
    } catch (error: unknown) {
      this._logger.error('Failed to fetch technician subscriptions', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return ResponseHelper.error(
        'Failed to retrieve subscriptions'
      ) as SubscriptionListResponseDto;
    }
  }

  async getSubscriptionStats(): Promise<SubscriptionStatsResponseDto> {
    const context = {
      operation: 'getSubscriptionStats',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching subscription statistics', context);

      const stats: SubscriptionStatsDto =
        await this._subscriptionRepository.getSubscriptionStats();

      return ResponseHelper.success(
        'Subscription statistics retrieved successfully',
        {
          stats,
        }
      ) as SubscriptionStatsResponseDto;
    } catch (error: unknown) {
      this._logger.error('Failed to fetch subscription statistics', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return ResponseHelper.error(
        'Failed to retrieve subscription statistics'
      ) as SubscriptionStatsResponseDto;
    }
  }

  async getSubscriptionById(id: string): Promise<SubscriptionResponseDto> {
    const context = {
      operation: 'getSubscriptionById',
      subscriptionId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching subscription by ID', context);

      const subscription =
        await this._subscriptionRepository.findSubscriptionById(id);

      if (!subscription) {
        return ResponseHelper.notFound(
          'Subscription not found'
        ) as SubscriptionResponseDto;
      }

      const subscriptionDto: SubscriptionDto =
        this.mapSubscriptionToDto(subscription);

      return ResponseHelper.success('Subscription retrieved successfully', {
        subscription: subscriptionDto,
      }) as SubscriptionResponseDto;
    } catch (error: unknown) {
      this._logger.error('Failed to fetch subscription by ID', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return ResponseHelper.error(
        'Failed to retrieve subscription'
      ) as SubscriptionResponseDto;
    }
  }

  async getSubscriptionsByTechnician(
    technicianId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<SubscriptionListResponseDto> {
    const context = {
      operation: 'getSubscriptionsByTechnician',
      technicianId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info(
        '🔍 [SERVICE DEBUG] Fetching subscriptions by technician',
        context
      );

      // Handle the [object Object] case
      if (
        technicianId === '[object Object]' ||
        technicianId === '%5Bobject%20Object%5D'
      ) {
        this._logger.error(
          '[SERVICE DEBUG] Received [object Object] as technicianId',
          context
        );
        return ResponseHelper.badRequest(
          'Invalid technician ID format. Please refresh the page and try again.'
        ) as SubscriptionListResponseDto;
      }

      // Validate ObjectId format
      if (!Types.ObjectId.isValid(technicianId)) {
        this._logger.error('[SERVICE DEBUG] Invalid ObjectId format', {
          ...context,
          technicianId,
        });
        return ResponseHelper.badRequest(
          'Invalid technician ID format'
        ) as SubscriptionListResponseDto;
      }

      const { subscriptions, total } =
        await this._subscriptionRepository.findSubscriptionsByTechnician(
          technicianId,
          page,
          limit
        );

      const subscriptionDtos: SubscriptionDto[] = subscriptions.map(sub =>
        this.mapSubscriptionToDto(sub)
      );

      return ResponseHelper.success(
        'Technician subscriptions retrieved successfully',
        {
          subscriptions: subscriptionDtos,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
          },
        }
      ) as SubscriptionListResponseDto;
    } catch (error: unknown) {
      this._logger.error(
        '[SERVICE DEBUG] Failed to fetch subscriptions by technician',
        {
          ...context,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );

      return ResponseHelper.error(
        'Failed to retrieve technician subscriptions'
      ) as SubscriptionListResponseDto;
    }
  }

  async getCurrentSubscription(
    technicianId: string
  ): Promise<SubscriptionResponseDto> {
    const context = {
      operation: 'getCurrentSubscription',
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching current subscription', context);

      const subscription =
        await this._subscriptionRepository.findCurrentSubscription(
          technicianId
        );

      if (!subscription) {
        return ResponseHelper.success('No active subscription found', {
          subscription: null,
        }) as SubscriptionResponseDto;
      }

      const subscriptionDto: SubscriptionDto =
        this.mapSubscriptionToDto(subscription);

      return ResponseHelper.success(
        'Current subscription retrieved successfully',
        {
          subscription: subscriptionDto,
        }
      ) as SubscriptionResponseDto;
    } catch (error: unknown) {
      this._logger.error('Failed to fetch current subscription', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return ResponseHelper.error(
        'Failed to retrieve current subscription'
      ) as SubscriptionResponseDto;
    }
  }

  async createSubscription(
    technicianId: string,
    subscriptionData: CreateSubscriptionRequestDto
  ): Promise<SubscriptionResponseDto> {
    const context = {
      operation: 'createSubscription',
      technicianId,
      subscriptionData,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Creating new subscription', context);

      // Check if technician has active subscription
      const activeSubscription =
        await this._subscriptionRepository.findCurrentSubscription(
          technicianId
        );
      if (activeSubscription) {
        return ResponseHelper.badRequest(
          'You already have an active subscription'
        ) as SubscriptionResponseDto;
      }

      // Get subscription plan details
      const subscriptionPlan =
        await this._subscriptionRepository.findSubscriptionPlanById(
          subscriptionData.subscriptionPlanId
        );

      if (!subscriptionPlan) {
        return ResponseHelper.notFound(
          'Subscription plan not found'
        ) as SubscriptionResponseDto;
      }

      // Calculate end date based on duration
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + subscriptionPlan.durationMonths);

      const createData: RepositoryCreateSubscriptionData = {
        technicianId: new Types.ObjectId(technicianId),
        subscriptionPlanId: new Types.ObjectId(
          subscriptionData.subscriptionPlanId
        ),
        amount: subscriptionPlan.price,
        durationMonths: subscriptionPlan.durationMonths,
        commissionRate: subscriptionPlan.commissionRate,
        startDate,
        endDate,
        paymentMethod: subscriptionData.paymentMethod,
        transactionId: subscriptionData.transactionId,
        status: 'active',
      };

      const subscription =
        await this._subscriptionRepository.createSubscription(createData);

      const subscriptionDto: SubscriptionDto =
        this.mapSubscriptionToDto(subscription);

      return ResponseHelper.success('Subscription created successfully', {
        subscription: subscriptionDto,
      }) as SubscriptionResponseDto;
    } catch (error: unknown) {
      this._logger.error('Failed to create subscription', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return ResponseHelper.error(
        'Failed to create subscription'
      ) as SubscriptionResponseDto;
    }
  }

  async updateSubscriptionStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<SubscriptionResponseDto> {
    const context = {
      operation: 'updateSubscriptionStatus',
      subscriptionId: id,
      newStatus: status,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Updating subscription status', context);

      const subscription =
        await this._subscriptionRepository.updateSubscriptionStatus(
          id,
          status,
          reason
        );

      if (!subscription) {
        return ResponseHelper.notFound(
          'Subscription not found'
        ) as SubscriptionResponseDto;
      }

      const subscriptionDto: SubscriptionDto =
        this.mapSubscriptionToDto(subscription);

      return ResponseHelper.success(
        'Subscription status updated successfully',
        {
          subscription: subscriptionDto,
        }
      ) as SubscriptionResponseDto;
    } catch (error: unknown) {
      this._logger.error('Failed to update subscription status', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return ResponseHelper.error(
        'Failed to update subscription status'
      ) as SubscriptionResponseDto;
    }
  }

  async cancelSubscription(
    technicianId: string,
    subscriptionId: string,
    reason?: string
  ): Promise<SubscriptionResponseDto> {
    const context = {
      operation: 'cancelSubscription',
      technicianId,
      subscriptionId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Cancelling subscription', context);

      // Verify ownership
      const subscription =
        await this._subscriptionRepository.findSubscriptionById(subscriptionId);

      if (!subscription) {
        return ResponseHelper.notFound(
          'Subscription not found'
        ) as SubscriptionResponseDto;
      }

      if (subscription.technicianId.toString() !== technicianId) {
        return ResponseHelper.forbidden(
          'You can only cancel your own subscriptions'
        ) as SubscriptionResponseDto;
      }

      if (subscription.status !== 'active') {
        return ResponseHelper.badRequest(
          'Only active subscriptions can be cancelled'
        ) as SubscriptionResponseDto;
      }

      const updatedSubscription =
        await this._subscriptionRepository.updateSubscriptionStatus(
          subscriptionId,
          'cancelled',
          reason
        );

      const subscriptionDto: SubscriptionDto = this.mapSubscriptionToDto(
        updatedSubscription!
      );

      return ResponseHelper.success('Subscription cancelled successfully', {
        subscription: subscriptionDto,
      }) as SubscriptionResponseDto;
    } catch (error: unknown) {
      this._logger.error('Failed to cancel subscription', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return ResponseHelper.error(
        'Failed to cancel subscription'
      ) as SubscriptionResponseDto;
    }
  }

  // Method to update expired subscriptions (can be called by a cron job)
  async updateExpiredSubscriptions(): Promise<void> {
    const context = {
      operation: 'updateExpiredSubscriptions',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Updating expired subscriptions', context);
      await this._subscriptionRepository.updateExpiredSubscriptions();
    } catch (error: unknown) {
      this._logger.error('Failed to update expired subscriptions', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  private mapSubscriptionToDto(
    subscription: ITechnicianSubscription
  ): SubscriptionDto {
    return {
      _id: subscription._id.toString(),
      technicianId: subscription.technicianId.toString(),
      subscriptionPlanId: subscription.subscriptionPlanId.toString(),
      amount: subscription.amount,
      durationMonths: subscription.durationMonths,
      commissionRate: subscription.commissionRate,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      paymentMethod: subscription.paymentMethod,
      transactionId: subscription.transactionId,
      status: subscription.status,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
      // Populated fields
      technician: (subscription as any).technicianId
        ? {
            displayName: (subscription as any).technicianId.displayName,
            email: (subscription as any).technicianId.email,
            phone: (subscription as any).technicianId.phone,
            profilePictureUrl: (subscription as any).technicianId
              .profilePictureUrl,
          }
        : undefined,
      subscriptionPlan: (subscription as any).subscriptionPlanId
        ? {
            name: (subscription as any).subscriptionPlanId.name,
            description: (subscription as any).subscriptionPlanId.description,
            price: (subscription as any).subscriptionPlanId.price,
            durationMonths: (subscription as any).subscriptionPlanId
              .durationMonths,
            features: (subscription as any).subscriptionPlanId.features,
          }
        : undefined,
    };
  }
}
