"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianSubscriptionController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
const LoggerService_1 = require("../../services/LoggerService");
class TechnicianSubscriptionController {
    constructor(subscriptionService, technicianSubscriptionService) {
        this.getActiveSubscriptions = async (req, res) => {
            const context = {
                operation: 'getActiveSubscriptions',
                timestamp: new Date().toISOString(),
            };
            try {
                this.logger.info('Fetching active subscriptions for technicians', context);
                // Get all subscriptions but filter only active ones
                const result = await this.subscriptionService.getAllSubscriptions(1, 50);
                // Filter only active subscriptions
                const activeSubscriptions = result.subscriptions.filter(sub => sub.status === 'active');
                this.logger.info('Active subscriptions retrieved successfully', {
                    ...context,
                    activeCount: activeSubscriptions.length,
                    totalCount: result.subscriptions.length,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTIONS_RETRIEVED, {
                    subscriptions: activeSubscriptions,
                    total: activeSubscriptions.length,
                    page: 1,
                    limit: activeSubscriptions.length,
                    totalPages: 1,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SUBSCRIPTION_MESSAGES.FAILED_FETCH_SUBSCRIPTIONS;
                this.logger.error('Get active subscriptions controller error', {
                    ...context,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getSubscriptionById = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'getSubscriptionById',
                subscriptionId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this.logger.info('Fetching subscription by ID for technician', context);
                const subscription = await this.subscriptionService.getSubscriptionById(id);
                // Check if subscription is active
                if (subscription.status !== 'active') {
                    this.logger.warn('Inactive subscription accessed by technician', context);
                    const response = responseHelper_1.ResponseHelper.error(constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND);
                    res.status(response.statusCode).json(response);
                    return;
                }
                const response = responseHelper_1.ResponseHelper.success(constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTION_RETRIEVED, { subscription });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND;
                this.logger.error('Get subscription by ID controller error', {
                    ...context,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getSubscriptionBySlug = async (req, res) => {
            const { slug } = req.params;
            const context = {
                operation: 'getSubscriptionBySlug',
                slug,
                timestamp: new Date().toISOString(),
            };
            try {
                this.logger.info('Fetching subscription by slug for technician', context);
                const subscription = await this.subscriptionService.getSubscriptionBySlug(slug);
                // Check if subscription is active
                if (subscription.status !== 'active') {
                    this.logger.warn('Inactive subscription accessed by technician', context);
                    const response = responseHelper_1.ResponseHelper.error(constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND);
                    res.status(response.statusCode).json(response);
                    return;
                }
                const response = responseHelper_1.ResponseHelper.success(constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTION_RETRIEVED, { subscription });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND;
                this.logger.error('Get subscription by slug controller error', {
                    ...context,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        // Get current active subscription for technician
        this.getCurrentSubscription = async (req, res) => {
            const userId = this.getUserId(req);
            const context = {
                operation: 'getCurrentSubscription',
                userId,
                timestamp: new Date().toISOString(),
            };
            try {
                this.logger.info('Fetching current subscription for technician', context);
                context.userId = userId;
                const currentSubscription = await this.technicianSubscriptionService.getCurrentSubscription(userId);
                this.logger.info('Current subscription retrieved successfully', {
                    ...context,
                    hasSubscription: !!currentSubscription,
                });
                const response = responseHelper_1.ResponseHelper.success('Current subscription retrieved successfully', { subscription: currentSubscription });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : 'Failed to get current subscription';
                this.logger.error('Get current subscription error', {
                    ...context,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        // Get subscription history for technician
        this.getSubscriptionHistory = async (req, res) => {
            const userId = this.getUserId(req);
            const context = {
                operation: 'getSubscriptionHistory',
                userId,
                timestamp: new Date().toISOString(),
            };
            try {
                this.logger.info('Fetching subscription history for technician', context);
                context.userId = userId;
                const subscriptionHistory = await this.technicianSubscriptionService.getSubscriptionHistory(userId);
                this.logger.info('Subscription history retrieved successfully', {
                    ...context,
                    historyCount: subscriptionHistory.length,
                });
                const response = responseHelper_1.ResponseHelper.success('Subscription history retrieved successfully', {
                    subscriptions: subscriptionHistory,
                    total: subscriptionHistory.length,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : 'Failed to get subscription history';
                this.logger.error('Get subscription history error', {
                    ...context,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        // Get subscription purchase by ID
        this.getSubscriptionPurchaseById = async (req, res) => {
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
                const subscriptionPurchase = await this.technicianSubscriptionService.getSubscriptionPurchaseById(purchaseId, userId);
                if (!subscriptionPurchase) {
                    const response = responseHelper_1.ResponseHelper.error('Subscription purchase not found');
                    res.status(response.statusCode).json(response);
                    return;
                }
                this.logger.info('Subscription purchase details retrieved successfully', context);
                const response = responseHelper_1.ResponseHelper.success('Subscription purchase details retrieved successfully', { subscription: subscriptionPurchase });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : 'Failed to get subscription purchase details';
                this.logger.error('Get subscription purchase error', {
                    ...context,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.createRazorpayOrder = async (req, res) => {
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
                const result = await this.technicianSubscriptionService.createRazorpayOrder(id, userId);
                this.logger.info('Razorpay order created successfully', context);
                const response = responseHelper_1.ResponseHelper.success('Razorpay order created successfully', result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : 'Failed to create Razorpay order';
                this.logger.error('Create Razorpay order error', {
                    operation: 'createRazorpayOrder',
                    subscriptionId: id,
                    error: errorMessage,
                    timestamp: new Date().toISOString(),
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.processWalletPayment = async (req, res) => {
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
                const result = await this.technicianSubscriptionService.processWalletPayment(id, userId);
                this.logger.info('Wallet payment processed successfully', context);
                const response = responseHelper_1.ResponseHelper.success('Subscription purchased successfully using wallet', result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : 'Failed to process wallet payment';
                this.logger.error('Wallet payment error', {
                    ...context,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.verifyPayment = async (req, res) => {
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature, subscriptionId, } = req.body;
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
                const result = await this.technicianSubscriptionService.verifyAndActivateSubscription(razorpay_payment_id, razorpay_order_id, razorpay_signature, subscriptionId, userId);
                this.logger.info('Payment verified and subscription activated', context);
                const response = responseHelper_1.ResponseHelper.success('Payment verified and subscription activated successfully', result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
                this.logger.error('Payment verification error', {
                    ...context,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.subscriptionService = subscriptionService;
        this.technicianSubscriptionService = technicianSubscriptionService;
        this.logger = new LoggerService_1.LoggerService();
    }
    // Helper method to get user ID with validation
    getUserId(req) {
        const userId = req.user?.id;
        if (!userId) {
            throw new Error('User authentication required');
        }
        return userId;
    }
}
exports.TechnicianSubscriptionController = TechnicianSubscriptionController;
