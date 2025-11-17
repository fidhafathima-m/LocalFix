import { ISubscriptionService } from '../interfaces/services/admin/ISubscriptionManagementService';
import { ISubscriptionRepository } from '../interfaces/repository/admin/ISubscriptionRepository';
import {
  SubscriptionResponseDto,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionListResponseDto,
} from '../interfaces/dtos/subscriptionDtos';
import { LoggerService } from '../services/LoggerService';
import { SubscriptionMapper } from '../mappers/subscriptionMapper';
import { SUBSCRIPTION_MESSAGES } from '../constants';

export class SubscriptionService implements ISubscriptionService {
  private subscriptionRepository: ISubscriptionRepository;
  private subscriptionMapper: SubscriptionMapper;
  private logger: LoggerService;

  constructor(subscriptionRepository: ISubscriptionRepository) {
    this.subscriptionRepository = subscriptionRepository;
    this.subscriptionMapper = new SubscriptionMapper();
    this.logger = new LoggerService();
  }

  async createSubscription(
    createDto: CreateSubscriptionDto
  ): Promise<SubscriptionResponseDto> {
    const context = {
      operation: 'createSubscription',
      data: {
        subscriptionName: createDto.name,
        price: createDto.price,
        duration: createDto.durationMonths,
      },
    };

    try {
      this.logger.info('Creating new subscription plan', context);

      // Check if subscription with same name already exists
      const existingSubscription = await this.subscriptionRepository.findByName(
        createDto.name
      );

      if (existingSubscription) {
        this.logger.warn(
          'Subscription creation failed - subscription already exists',
          context
        );
        throw new Error(SUBSCRIPTION_MESSAGES.SUBSCRIPTION_ALREADY_EXISTS);
      }

      const subscription = await this.subscriptionRepository.create(createDto);

      this.logger.info('Subscription created successfully', {
        ...context,
        subscriptionId: subscription._id?.toString(),
      });

      return this.subscriptionMapper.toSubscriptionResponseDto(subscription);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Create subscription operation failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }

  async getSubscriptionById(
    subscriptionId: string
  ): Promise<SubscriptionResponseDto> {
    const context = {
      operation: 'getSubscriptionById',
      data: { subscriptionId },
    };

    try {
      this.logger.info('Fetching subscription by ID', context);

      const subscription =
        await this.subscriptionRepository.findById(subscriptionId);

      if (!subscription) {
        this.logger.warn('Subscription not found by ID', context);
        throw new Error(SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND);
      }

      this.logger.info('Subscription retrieved successfully', {
        ...context,
        subscriptionName: subscription.name,
      });

      return this.subscriptionMapper.toSubscriptionResponseDto(subscription);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Get subscription by ID operation failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }

  async getSubscriptionBySlug(slug: string): Promise<SubscriptionResponseDto> {
    const context = {
      operation: 'getSubscriptionBySlug',
      data: { slug },
    };

    try {
      this.logger.info('Fetching subscription by slug', context);

      const subscription = await this.subscriptionRepository.findBySlug(slug);

      if (!subscription) {
        this.logger.warn('Subscription not found by slug', context);
        throw new Error(SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND);
      }

      this.logger.info('Subscription retrieved successfully by slug', context);
      return this.subscriptionMapper.toSubscriptionResponseDto(subscription);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Get subscription by slug operation failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }

  async getAllSubscriptions(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<SubscriptionListResponseDto> {
    const context = {
      operation: 'getAllSubscriptions',
      data: {
        page,
        limit,
        hasSearch: !!search,
        searchQuery: search,
      },
    };

    try {
      this.logger.info('Fetching all subscriptions', context);

      const skip = (page - 1) * limit;
      let subscriptions: any[];
      let total: number;

      if (search) {
        subscriptions = await this.subscriptionRepository.search(search, limit);
        total = subscriptions.length;
      } else {
        subscriptions = await this.subscriptionRepository.findAll(
          {},
          skip,
          limit
        );
        total = await this.subscriptionRepository.count();
      }

      const result = this.subscriptionMapper.toSubscriptionListResponseDto(
        subscriptions,
        total,
        page,
        limit
      );

      this.logger.info('All subscriptions retrieved successfully', {
        ...context,
        totalSubscriptions: total,
        returnedSubscriptions: result.subscriptions.length,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Get all subscriptions operation failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }

  async updateSubscription(
    subscriptionId: string,
    updateDto: UpdateSubscriptionDto
  ): Promise<SubscriptionResponseDto> {
    const context = {
      operation: 'updateSubscription',
      data: {
        subscriptionId,
        updateFields: Object.keys(updateDto),
      },
    };

    try {
      this.logger.info('Updating subscription', context);

      const existingSubscription =
        await this.subscriptionRepository.findById(subscriptionId);

      if (!existingSubscription) {
        this.logger.warn('Subscription not found for update', context);
        throw new Error(SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND);
      }

      // If name is being updated, check for duplicates
      if (updateDto.name && updateDto.name !== existingSubscription.name) {
        const duplicateSubscription =
          await this.subscriptionRepository.findByName(updateDto.name);

        if (
          duplicateSubscription &&
          duplicateSubscription._id.toString() !== subscriptionId
        ) {
          this.logger.warn(
            'Subscription update failed - duplicate name found',
            context
          );
          throw new Error(SUBSCRIPTION_MESSAGES.SUBSCRIPTION_ALREADY_EXISTS);
        }
      }

      const updatedSubscription = await this.subscriptionRepository.update(
        subscriptionId,
        updateDto
      );

      if (!updatedSubscription) {
        this.logger.error(
          'Subscription repository update returned null',
          context
        );
        throw new Error(SUBSCRIPTION_MESSAGES.FAILED_UPDATE_SUBSCRIPTION);
      }

      this.logger.info('Subscription updated successfully', context);
      return this.subscriptionMapper.toSubscriptionResponseDto(
        updatedSubscription
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Update subscription operation failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }

  async deleteSubscription(subscriptionId: string): Promise<void> {
    const context = {
      operation: 'deleteSubscription',
      data: { subscriptionId },
    };

    try {
      this.logger.info('Deleting subscription', context);

      const existingSubscription =
        await this.subscriptionRepository.findById(subscriptionId);

      if (!existingSubscription) {
        this.logger.warn('Subscription not found for deletion', context);
        throw new Error(SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND);
      }

      const deleted = await this.subscriptionRepository.delete(subscriptionId);

      if (!deleted) {
        this.logger.error(
          'Subscription repository deletion returned false',
          context
        );
        throw new Error(SUBSCRIPTION_MESSAGES.FAILED_DELETE_SUBSCRIPTION);
      }

      this.logger.info('Subscription deleted successfully', context);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Delete subscription operation failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }

  async searchSubscriptions(
    query: string,
    limit: number = 10
  ): Promise<SubscriptionResponseDto[]> {
    const context = {
      operation: 'searchSubscriptions',
      data: {
        query,
        limit,
      },
    };

    try {
      this.logger.info('Searching subscriptions', context);

      const subscriptions = await this.subscriptionRepository.search(
        query,
        limit
      );

      this.logger.info('Subscription search completed successfully', {
        ...context,
        subscriptionsFound: subscriptions.length,
      });

      return subscriptions.map(subscription =>
        this.subscriptionMapper.toSubscriptionResponseDto(subscription)
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error('Search subscriptions operation failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }
}
