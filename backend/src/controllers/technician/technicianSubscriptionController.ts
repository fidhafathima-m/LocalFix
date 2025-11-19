import { Response } from 'express';
import { ISubscriptionService } from '../../interfaces/services/admin/ISubscriptionManagementService';
import { ResponseHelper } from '../../utils/responseHelper';
import { SUBSCRIPTION_MESSAGES } from '../../constants';
import { LoggerService } from '../../services/LoggerService';
import { ITechnicianSubscriptionService } from '../../interfaces/services/technician/ITechnicianSubscriptionService';
import { AuthRequest } from '../../middleware/authMiddleware';

export class TechnicianSubscriptionController {
  private subscriptionService: ISubscriptionService;
  private technicianSubscriptionService: ITechnicianSubscriptionService;
  private logger: LoggerService;

  constructor(
    subscriptionService: ISubscriptionService,
    technicianSubscriptionService: ITechnicianSubscriptionService
  ) {
    this.subscriptionService = subscriptionService;
    this.technicianSubscriptionService = technicianSubscriptionService;
    this.logger = new LoggerService();
  }

  // Helper method to get user ID with validation
  private getUserId(req: AuthRequest): string {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User authentication required');
    }
    return userId;
  }

  getActiveSubscriptions = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const context = {
      operation: 'getActiveSubscriptions',
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info(
        'Fetching active subscriptions for technicians',
        context
      );

      // Get all subscriptions but filter only active ones
      const result = await this.subscriptionService.getAllSubscriptions(1, 50);

      // Filter only active subscriptions
      const activeSubscriptions = result.subscriptions.filter(
        sub => sub.status === 'active'
      );

      this.logger.info('Active subscriptions retrieved successfully', {
        ...context,
        activeCount: activeSubscriptions.length,
        totalCount: result.subscriptions.length,
      });

      const response = ResponseHelper.success(
        SUBSCRIPTION_MESSAGES.SUBSCRIPTIONS_RETRIEVED,
        {
          subscriptions: activeSubscriptions,
          total: activeSubscriptions.length,
          page: 1,
          limit: activeSubscriptions.length,
          totalPages: 1,
        }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : SUBSCRIPTION_MESSAGES.FAILED_FETCH_SUBSCRIPTIONS;
      this.logger.error('Get active subscriptions controller error', {
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
      this.logger.info('Fetching subscription by ID for technician', context);

      const subscription =
        await this.subscriptionService.getSubscriptionById(id);

      // Check if subscription is active
      if (subscription.status !== 'active') {
        this.logger.warn(
          'Inactive subscription accessed by technician',
          context
        );
        const response = ResponseHelper.error(
          SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND
        );
        res.status(response.statusCode).json(response);
        return;
      }

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
      this.logger.error('Get subscription by ID controller error', {
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
      this.logger.info('Fetching subscription by slug for technician', context);

      const subscription =
        await this.subscriptionService.getSubscriptionBySlug(slug);

      // Check if subscription is active
      if (subscription.status !== 'active') {
        this.logger.warn(
          'Inactive subscription accessed by technician',
          context
        );
        const response = ResponseHelper.error(
          SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND
        );
        res.status(response.statusCode).json(response);
        return;
      }

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
      this.logger.error('Get subscription by slug controller error', {
        ...context,
        error: errorMessage,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  // Get current active subscription for technician
  getCurrentSubscription = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = this.getUserId(req);
    const context = {
      operation: 'getCurrentSubscription',
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info('Fetching current subscription for technician', context);

      context.userId = userId;

      const currentSubscription =
        await this.technicianSubscriptionService.getCurrentSubscription(userId);

      this.logger.info('Current subscription retrieved successfully', {
        ...context,
        hasSubscription: !!currentSubscription,
      });

      const response = ResponseHelper.success(
        'Current subscription retrieved successfully',
        { subscription: currentSubscription }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to get current subscription';
      this.logger.error('Get current subscription error', {
        ...context,
        error: errorMessage,
      });
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  // Get subscription history for technician
  getSubscriptionHistory = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = this.getUserId(req);
    const context = {
      operation: 'getSubscriptionHistory',
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info('Fetching subscription history for technician', context);

      context.userId = userId;

      const subscriptionHistory =
        await this.technicianSubscriptionService.getSubscriptionHistory(userId);

      this.logger.info('Subscription history retrieved successfully', {
        ...context,
        historyCount: subscriptionHistory.length,
      });

      const response = ResponseHelper.success(
        'Subscription history retrieved successfully',
        {
          subscriptions: subscriptionHistory,
          total: subscriptionHistory.length,
        }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to get subscription history';
      this.logger.error('Get subscription history error', {
        ...context,
        error: errorMessage,
      });
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  // Get subscription purchase by ID
  getSubscriptionPurchaseById = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { purchaseId } = req.params;
    const userId = this.getUserId(req);
    const context = {
      operation: 'getSubscriptionPurchaseById',
      purchaseId,
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info('Fetching subscription purchase details', context);

      context.userId = userId;

      const subscriptionPurchase =
        await this.technicianSubscriptionService.getSubscriptionPurchaseById(
          purchaseId,
          userId
        );

      if (!subscriptionPurchase) {
        const response = ResponseHelper.error(
          'Subscription purchase not found'
        );
        res.status(response.statusCode).json(response);
        return;
      }

      this.logger.info(
        'Subscription purchase details retrieved successfully',
        context
      );

      const response = ResponseHelper.success(
        'Subscription purchase details retrieved successfully',
        { subscription: subscriptionPurchase }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to get subscription purchase details';
      this.logger.error('Get subscription purchase error', {
        ...context,
        error: errorMessage,
      });
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  createRazorpayOrder = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;

    try {
      // Get user ID from auth middleware first
      const userId = this.getUserId(req);

      // Create context with all properties
      const context = {
        operation: 'createRazorpayOrder',
        subscriptionId: id,
        userId: userId,
        timestamp: new Date().toISOString(),
      };

      this.logger.info('Creating Razorpay order for subscription', context);

      const result =
        await this.technicianSubscriptionService.createRazorpayOrder(
          id,
          userId
        );

      this.logger.info('Razorpay order created successfully', context);

      const response = ResponseHelper.success(
        'Razorpay order created successfully',
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create Razorpay order';
      this.logger.error('Create Razorpay order error', {
        operation: 'createRazorpayOrder',
        subscriptionId: id,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  processWalletPayment = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const userId = this.getUserId(req);
    const context = {
      operation: 'processWalletPayment',
      subscriptionId: id,
      userId: userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info('Processing wallet payment for subscription', context);

      context.userId = userId;

      const result =
        await this.technicianSubscriptionService.processWalletPayment(
          id,
          userId
        );

      this.logger.info('Wallet payment processed successfully', context);

      const response = ResponseHelper.success(
        'Subscription purchased successfully using wallet',
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to process wallet payment';
      this.logger.error('Wallet payment error', {
        ...context,
        error: errorMessage,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      subscriptionId,
    } = req.body;
    const userId = this.getUserId(req);

    const context = {
      operation: 'verifyPayment',
      subscriptionId,
      paymentId: razorpay_payment_id,
      userId: userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info('Verifying Razorpay payment', context);

      context.userId = userId;

      const result =
        await this.technicianSubscriptionService.verifyAndActivateSubscription(
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          subscriptionId,
          userId
        );

      this.logger.info('Payment verified and subscription activated', context);

      const response = ResponseHelper.success(
        'Payment verified and subscription activated successfully',
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Payment verification failed';
      this.logger.error('Payment verification error', {
        ...context,
        error: errorMessage,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };
}
