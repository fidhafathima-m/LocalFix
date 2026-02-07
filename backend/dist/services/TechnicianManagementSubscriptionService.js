"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianManagementSubscriptionService = void 0;
const mongoose_1 = require("mongoose");
const responseHelper_1 = require("../utils/responseHelper");
class TechnicianManagementSubscriptionService {
    constructor(subscriptionRepository, logger) {
        this._subscriptionRepository = subscriptionRepository;
        this._logger = logger;
    }
    async getTechnicianSubscriptions(filters) {
        const context = {
            operation: 'getTechnicianSubscriptions',
            filters,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching technician subscriptions', context);
            const repoFilters = {
                page: filters.page,
                limit: filters.limit,
                status: filters.status,
                technicianId: filters.technicianId,
                subscriptionPlanId: filters.subscriptionPlanId,
            };
            const { subscriptions, total } = await this._subscriptionRepository.findSubscriptions(repoFilters);
            const subscriptionDtos = subscriptions.map(sub => this.mapSubscriptionToDto(sub));
            return responseHelper_1.ResponseHelper.success('Subscriptions retrieved successfully', {
                subscriptions: subscriptionDtos,
                pagination: {
                    page: filters.page,
                    limit: filters.limit,
                    total,
                    pages: Math.ceil(total / filters.limit),
                    hasNext: filters.page < Math.ceil(total / filters.limit),
                    hasPrev: filters.page > 1,
                },
            });
        }
        catch (error) {
            this._logger.error('Failed to fetch technician subscriptions', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return responseHelper_1.ResponseHelper.error('Failed to retrieve subscriptions');
        }
    }
    async getSubscriptionStats() {
        const context = {
            operation: 'getSubscriptionStats',
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching subscription statistics', context);
            const stats = await this._subscriptionRepository.getSubscriptionStats();
            return responseHelper_1.ResponseHelper.success('Subscription statistics retrieved successfully', {
                stats,
            });
        }
        catch (error) {
            this._logger.error('Failed to fetch subscription statistics', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return responseHelper_1.ResponseHelper.error('Failed to retrieve subscription statistics');
        }
    }
    async getSubscriptionById(id) {
        const context = {
            operation: 'getSubscriptionById',
            subscriptionId: id,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching subscription by ID', context);
            const subscription = await this._subscriptionRepository.findSubscriptionById(id);
            if (!subscription) {
                return responseHelper_1.ResponseHelper.notFound('Subscription not found');
            }
            const subscriptionDto = this.mapSubscriptionToDto(subscription);
            return responseHelper_1.ResponseHelper.success('Subscription retrieved successfully', {
                subscription: subscriptionDto,
            });
        }
        catch (error) {
            this._logger.error('Failed to fetch subscription by ID', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return responseHelper_1.ResponseHelper.error('Failed to retrieve subscription');
        }
    }
    async getSubscriptionsByTechnician(technicianId, page = 1, limit = 10) {
        const context = {
            operation: 'getSubscriptionsByTechnician',
            technicianId,
            page,
            limit,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('🔍 [SERVICE DEBUG] Fetching subscriptions by technician', context);
            // Handle the [object Object] case
            if (technicianId === '[object Object]' ||
                technicianId === '%5Bobject%20Object%5D') {
                this._logger.error('[SERVICE DEBUG] Received [object Object] as technicianId', context);
                return responseHelper_1.ResponseHelper.badRequest('Invalid technician ID format. Please refresh the page and try again.');
            }
            // Validate ObjectId format
            if (!mongoose_1.Types.ObjectId.isValid(technicianId)) {
                this._logger.error('[SERVICE DEBUG] Invalid ObjectId format', {
                    ...context,
                    technicianId,
                });
                return responseHelper_1.ResponseHelper.badRequest('Invalid technician ID format');
            }
            const { subscriptions, total } = await this._subscriptionRepository.findSubscriptionsByTechnician(technicianId, page, limit);
            const subscriptionDtos = subscriptions.map(sub => this.mapSubscriptionToDto(sub));
            return responseHelper_1.ResponseHelper.success('Technician subscriptions retrieved successfully', {
                subscriptions: subscriptionDtos,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1,
                },
            });
        }
        catch (error) {
            this._logger.error('[SERVICE DEBUG] Failed to fetch subscriptions by technician', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return responseHelper_1.ResponseHelper.error('Failed to retrieve technician subscriptions');
        }
    }
    async getCurrentSubscription(technicianId) {
        const context = {
            operation: 'getCurrentSubscription',
            technicianId,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching current subscription', context);
            const subscription = await this._subscriptionRepository.findCurrentSubscription(technicianId);
            if (!subscription) {
                return responseHelper_1.ResponseHelper.success('No active subscription found', {
                    subscription: null,
                });
            }
            const subscriptionDto = this.mapSubscriptionToDto(subscription);
            return responseHelper_1.ResponseHelper.success('Current subscription retrieved successfully', {
                subscription: subscriptionDto,
            });
        }
        catch (error) {
            this._logger.error('Failed to fetch current subscription', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return responseHelper_1.ResponseHelper.error('Failed to retrieve current subscription');
        }
    }
    async createSubscription(technicianId, subscriptionData) {
        const context = {
            operation: 'createSubscription',
            technicianId,
            subscriptionData,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Creating new subscription', context);
            // Check if technician has active subscription
            const activeSubscription = await this._subscriptionRepository.findCurrentSubscription(technicianId);
            if (activeSubscription) {
                return responseHelper_1.ResponseHelper.badRequest('You already have an active subscription');
            }
            // Get subscription plan details
            const subscriptionPlan = await this._subscriptionRepository.findSubscriptionPlanById(subscriptionData.subscriptionPlanId);
            if (!subscriptionPlan) {
                return responseHelper_1.ResponseHelper.notFound('Subscription plan not found');
            }
            // Calculate end date based on duration
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + subscriptionPlan.durationMonths);
            const createData = {
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
                subscriptionPlanId: new mongoose_1.Types.ObjectId(subscriptionData.subscriptionPlanId),
                amount: subscriptionPlan.price,
                durationMonths: subscriptionPlan.durationMonths,
                commissionRate: subscriptionPlan.commissionRate,
                startDate,
                endDate,
                paymentMethod: subscriptionData.paymentMethod,
                transactionId: subscriptionData.transactionId,
                status: 'active',
            };
            const subscription = await this._subscriptionRepository.createSubscription(createData);
            const subscriptionDto = this.mapSubscriptionToDto(subscription);
            return responseHelper_1.ResponseHelper.success('Subscription created successfully', {
                subscription: subscriptionDto,
            });
        }
        catch (error) {
            this._logger.error('Failed to create subscription', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return responseHelper_1.ResponseHelper.error('Failed to create subscription');
        }
    }
    async updateSubscriptionStatus(id, status, reason) {
        const context = {
            operation: 'updateSubscriptionStatus',
            subscriptionId: id,
            newStatus: status,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Updating subscription status', context);
            const subscription = await this._subscriptionRepository.updateSubscriptionStatus(id, status, reason);
            if (!subscription) {
                return responseHelper_1.ResponseHelper.notFound('Subscription not found');
            }
            const subscriptionDto = this.mapSubscriptionToDto(subscription);
            return responseHelper_1.ResponseHelper.success('Subscription status updated successfully', {
                subscription: subscriptionDto,
            });
        }
        catch (error) {
            this._logger.error('Failed to update subscription status', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return responseHelper_1.ResponseHelper.error('Failed to update subscription status');
        }
    }
    async cancelSubscription(technicianId, subscriptionId, reason) {
        const context = {
            operation: 'cancelSubscription',
            technicianId,
            subscriptionId,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Cancelling subscription', context);
            // Verify ownership
            const subscription = await this._subscriptionRepository.findSubscriptionById(subscriptionId);
            if (!subscription) {
                return responseHelper_1.ResponseHelper.notFound('Subscription not found');
            }
            if (subscription.technicianId.toString() !== technicianId) {
                return responseHelper_1.ResponseHelper.forbidden('You can only cancel your own subscriptions');
            }
            if (subscription.status !== 'active') {
                return responseHelper_1.ResponseHelper.badRequest('Only active subscriptions can be cancelled');
            }
            const updatedSubscription = await this._subscriptionRepository.updateSubscriptionStatus(subscriptionId, 'cancelled', reason);
            const subscriptionDto = this.mapSubscriptionToDto(updatedSubscription);
            return responseHelper_1.ResponseHelper.success('Subscription cancelled successfully', {
                subscription: subscriptionDto,
            });
        }
        catch (error) {
            this._logger.error('Failed to cancel subscription', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return responseHelper_1.ResponseHelper.error('Failed to cancel subscription');
        }
    }
    // Method to update expired subscriptions (can be called by a cron job)
    async updateExpiredSubscriptions() {
        const context = {
            operation: 'updateExpiredSubscriptions',
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Updating expired subscriptions', context);
            await this._subscriptionRepository.updateExpiredSubscriptions();
        }
        catch (error) {
            this._logger.error('Failed to update expired subscriptions', {
                ...context,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            throw error;
        }
    }
    mapSubscriptionToDto(subscription) {
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
            technician: subscription.technicianId
                ? {
                    displayName: subscription.technicianId.displayName,
                    email: subscription.technicianId.email,
                    phone: subscription.technicianId.phone,
                    profilePictureUrl: subscription.technicianId
                        .profilePictureUrl,
                }
                : undefined,
            subscriptionPlan: subscription.subscriptionPlanId
                ? {
                    name: subscription.subscriptionPlanId.name,
                    description: subscription.subscriptionPlanId.description,
                    price: subscription.subscriptionPlanId.price,
                    durationMonths: subscription.subscriptionPlanId
                        .durationMonths,
                    features: subscription.subscriptionPlanId.features,
                }
                : undefined,
        };
    }
}
exports.TechnicianManagementSubscriptionService = TechnicianManagementSubscriptionService;
