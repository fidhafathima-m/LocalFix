import { ITechnicianSubscriptionService } from '../interfaces/services/technician/ITechnicianSubscriptionService';
import { ISubscriptionService } from '../interfaces/services/admin/ISubscriptionManagementService';
import { ITechnicianSubscriptionRepository } from '../interfaces/repository/technician/ISubscriptionRepository';
import { ISubscriptionWalletService } from '../interfaces/services/technician/ISubscriptionWalletService';
import { ISubscriptionPaymentService } from '../interfaces/services/technician/ISubscriptionPaymentService';
import { ILogger } from '../interfaces/utils/ILogger';

export class TechnicianSubscriptionService
  implements ITechnicianSubscriptionService
{
  private _subscriptionService: ISubscriptionService;
  private _walletService: ISubscriptionWalletService;
  private _paymentService: ISubscriptionPaymentService;
  private _subscriptionRepository: ITechnicianSubscriptionRepository;
  private _logger: ILogger;

  constructor(
    subscriptionService: ISubscriptionService,
    subscriptionRepository: ITechnicianSubscriptionRepository,
    subscriptionWalletService: ISubscriptionWalletService,
    subscriptionPaymentService: ISubscriptionPaymentService,
    logger: ILogger
  ) {
    this._subscriptionService = subscriptionService;
    this._walletService = subscriptionWalletService;
    this._paymentService = subscriptionPaymentService;
    this._subscriptionRepository = subscriptionRepository;
    this._logger = logger;
  }

  async createRazorpayOrder(subscriptionId: string, userId: string) {
    const context = {
      operation: 'createRazorpayOrder',
      data: { subscriptionId, userId },
    };

    try {
      this._logger.info('Creating Razorpay order for subscription', context);

      // Get subscription details
      const subscription =
        await this._subscriptionService.getSubscriptionById(subscriptionId);

      if (subscription.status !== 'active') {
        throw new Error('Subscription is not active');
      }

      // Check if user already has an active subscription
      const activeSubscription =
        await this._subscriptionRepository.findActiveSubscription(userId);
      if (activeSubscription) {
        throw new Error('You already have an active subscription');
      }

      // Create Razorpay order using our subscription payment service
      const razorpayOrder = await this._paymentService.createRazorpayOrder({
        amount: subscription.price * 100, // Convert to paise
        currency: 'INR',
        receipt: `sub_${subscriptionId}_${Date.now()}`,
        notes: {
          subscriptionId,
          userId,
          type: 'subscription',
        },
      });

      this._logger.info('Razorpay order created successfully', {
        ...context,
        orderId: razorpayOrder.id,
      });

      return {
        razorpayOrder: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key: process.env.RAZORPAY_KEY_ID!,
        },
        subscription: {
          id: subscription.id,
          name: subscription.name,
          price: subscription.price,
          durationMonths: subscription.durationMonths,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Create Razorpay order operation failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }

  async processWalletPayment(subscriptionId: string, userId: string) {
    const context = {
      operation: 'processWalletPayment',
      data: { subscriptionId, userId },
    };

    try {
      this._logger.info('Processing wallet payment for subscription', context);

      // Get subscription details
      const subscription =
        await this._subscriptionService.getSubscriptionById(subscriptionId);

      if (subscription.status !== 'active') {
        throw new Error('Subscription is not active');
      }

      // Check if user already has an active subscription
      const activeSubscription =
        await this._subscriptionRepository.findActiveSubscription(userId);
      if (activeSubscription) {
        throw new Error('You already have an active subscription');
      }

      // Check wallet balance using our subscription wallet service
      const walletBalance = await this._walletService.getBalance(userId);
      if (walletBalance < subscription.price) {
        throw new Error('Insufficient wallet balance');
      }

      // Deduct amount from wallet using our subscription wallet service
      const debitResult = await this._walletService.debit(
        userId,
        subscription.price,
        'subscription_purchase',
        `Purchase of ${subscription.name} subscription`
      );

      if (!debitResult.success) {
        throw new Error('Wallet debit failed: ' + debitResult.message);
      }

      // Create subscription record
      const subscriptionRecord = await this._subscriptionRepository.create({
        technicianId: userId,
        subscriptionPlanId: subscriptionId,
        amount: subscription.price,
        durationMonths: subscription.durationMonths,
        commissionRate: subscription.commissionRate,
        paymentMethod: 'wallet',
        transactionId: debitResult.transactionId,
        status: 'active',
      });

      this._logger.info('Wallet payment processed successfully', {
        ...context,
        transactionId: debitResult.transactionId,
        newBalance: debitResult.newBalance,
      });

      return {
        success: true,
        subscription: subscriptionRecord,
        transaction: debitResult,
        newBalance: debitResult.newBalance,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Wallet payment operation failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }

  async verifyAndActivateSubscription(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string,
    subscriptionId: string,
    userId: string
  ) {
    const context = {
      operation: 'verifyAndActivateSubscription',
      data: {
        subscriptionId,
        userId,
        paymentId: razorpayPaymentId,
      },
    };

    try {
      this._logger.info(
        'Verifying payment and activating subscription',
        context
      );

      // Check if subscription already exists for this payment
      const existingSubscription =
        await this._subscriptionRepository.findByTransactionId(
          razorpayPaymentId
        );
      if (existingSubscription) {
        throw new Error('Subscription already activated for this payment');
      }

      // Check if user already has an active subscription
      const activeSubscription =
        await this._subscriptionRepository.findActiveSubscription(userId);
      if (activeSubscription) {
        throw new Error('You already have an active subscription');
      }

      // Verify payment with Razorpay using our subscription payment service
      const verificationResult = await this._paymentService.verifyPayment(
        razorpayPaymentId,
        razorpayOrderId,
        razorpaySignature
      );

      if (!verificationResult.isValid) {
        throw new Error('Payment verification failed');
      }

      // Get subscription details
      const subscription =
        await this._subscriptionService.getSubscriptionById(subscriptionId);

      // Create subscription record
      const subscriptionRecord = await this._subscriptionRepository.create({
        technicianId: userId,
        subscriptionPlanId: subscriptionId,
        amount: subscription.price,
        durationMonths: subscription.durationMonths,
        commissionRate: subscription.commissionRate,
        paymentMethod: 'razorpay',
        transactionId: razorpayPaymentId,
        status: 'active',
      });

      this._logger.info('Subscription activated successfully', {
        ...context,
        subscriptionId: subscriptionRecord.id,
      });

      return {
        success: true,
        subscription: subscriptionRecord,
        payment: verificationResult,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error(
        'Payment verification and subscription activation failed',
        {
          ...context,
          error: errorMessage,
        }
      );
      throw error;
    }
  }
  async checkSubscriptionEligibility(
    technicianId: string,
    subscriptionId: string
  ) {
    const [subscription, activeSubscription] = await Promise.all([
      this._subscriptionService.getSubscriptionById(subscriptionId),
      this._subscriptionRepository.findActiveSubscription(technicianId),
    ]);

    return {
      canSubscribe: !activeSubscription && subscription.status === 'active',
      activeSubscription,
      targetSubscription: subscription,
    };
  }
  async getCurrentSubscription(technicianId: string): Promise<any> {
    const context = {
      operation: 'getCurrentSubscription',
      data: { technicianId },
    };

    try {
      this._logger.info('Getting current subscription for technician', context);

      const currentSubscription =
        await this._subscriptionRepository.findActiveSubscription(technicianId);

      this._logger.info('Current subscription retrieved', {
        ...context,
        hasSubscription: !!currentSubscription,
      });

      return currentSubscription;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Get current subscription operation failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }

  async getSubscriptionHistory(technicianId: string): Promise<any[]> {
    const context = {
      operation: 'getSubscriptionHistory',
      data: { technicianId },
    };

    try {
      this._logger.info('Getting subscription history for technician', context);

      const subscriptionHistory =
        await this._subscriptionRepository.findByTechnicianId(technicianId);

      this._logger.info('Subscription history retrieved', {
        ...context,
        historyCount: subscriptionHistory.length,
      });

      return subscriptionHistory;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Get subscription history operation failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }

  async getSubscriptionPurchaseById(
    purchaseId: string,
    technicianId: string
  ): Promise<any> {
    const context = {
      operation: 'getSubscriptionPurchaseById',
      data: { purchaseId, technicianId },
    };

    try {
      this._logger.info('Getting subscription purchase by ID', context);

      const subscriptionPurchase =
        await this._subscriptionRepository.findById(purchaseId);

      // Verify that the purchase belongs to the technician
      if (
        subscriptionPurchase &&
        subscriptionPurchase.technicianId.toString() !== technicianId
      ) {
        throw new Error(
          'Access denied: This subscription does not belong to you'
        );
      }

      this._logger.info(
        'Subscription purchase retrieved successfully',
        context
      );

      return subscriptionPurchase;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Get subscription purchase by ID operation failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }
}
