"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianManagementSubscriptionController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
class TechnicianManagementSubscriptionController {
    constructor(subscriptionService, logger) {
        // Admin: Get all technician subscriptions
        this.getTechnicianSubscriptions = async (req, res) => {
            const context = {
                operation: 'getTechnicianSubscriptions',
                query: req.query,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technician subscriptions', context);
                const { page = 1, limit = 10, status, technicianId, subscriptionPlanId, } = req.query;
                const filters = {
                    page: Number(page),
                    limit: Number(limit),
                    ...(status && { status: status }),
                    ...(technicianId && { technicianId: technicianId }),
                    ...(subscriptionPlanId && {
                        subscriptionPlanId: subscriptionPlanId,
                    }),
                };
                const result = await this._subscriptionService.getTechnicianSubscriptions(filters);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get technician subscriptions controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to fetch subscriptions');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        // Admin: Get subscription statistics
        this.getSubscriptionStats = async (req, res) => {
            const context = {
                operation: 'getSubscriptionStats',
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching subscription statistics', context);
                const result = await this._subscriptionService.getSubscriptionStats();
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get subscription stats controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to fetch subscription statistics');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        // Admin: Get subscription by ID
        this.getSubscriptionById = async (req, res) => {
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
            }
            catch (error) {
                this._logger.error('Get subscription by ID controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to fetch subscription');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        // Admin: Get subscriptions by technician
        this.getSubscriptionsByTechnician = async (req, res) => {
            const { technicianId } = req.params;
            const context = {
                operation: 'getSubscriptionsByTechnician',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching subscriptions by technician', context);
                const { page = 1, limit = 10 } = req.query;
                const result = await this._subscriptionService.getSubscriptionsByTechnician(technicianId, Number(page), Number(limit));
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get subscriptions by technician controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to fetch technician subscriptions');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        // Admin: Update subscription status
        this.updateSubscriptionStatus = async (req, res) => {
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
                const result = await this._subscriptionService.updateSubscriptionStatus(id, status, reason);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Update subscription status controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to update subscription status');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        // Technician: Get my subscriptions
        this.getMySubscriptions = async (req, res) => {
            const technicianId = req.user?.id;
            const context = {
                operation: 'getMySubscriptions',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technician subscriptions', context);
                const { page = 1, limit = 10 } = req.query;
                const result = await this._subscriptionService.getSubscriptionsByTechnician(technicianId, Number(page), Number(limit));
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get my subscriptions controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to fetch your subscriptions');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        // Technician: Get current active subscription
        this.getCurrentSubscription = async (req, res) => {
            const technicianId = req.user?.id;
            const context = {
                operation: 'getCurrentSubscription',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching current subscription', context);
                const result = await this._subscriptionService.getCurrentSubscription(technicianId);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get current subscription controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to fetch current subscription');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        // Admin: Get current subscription for a specific technician
        this.getTechnicianCurrentSubscription = async (req, res) => {
            const { technicianId } = req.params;
            const context = {
                operation: 'getTechnicianCurrentSubscription',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technician current subscription', context);
                const result = await this._subscriptionService.getCurrentSubscription(technicianId);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get technician current subscription controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to fetch technician subscription');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        // Technician: Create new subscription
        this.createSubscription = async (req, res) => {
            const technicianId = req.user?.id;
            const subscriptionData = req.body;
            const context = {
                operation: 'createSubscription',
                technicianId,
                subscriptionPlanId: subscriptionData.subscriptionPlanId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Creating new subscription', context);
                const result = await this._subscriptionService.createSubscription(technicianId, subscriptionData);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Create subscription controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to create subscription');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        // Technician: Cancel subscription
        this.cancelSubscription = async (req, res) => {
            const technicianId = req.user?.id;
            const { subscriptionId, reason } = req.body;
            const context = {
                operation: 'cancelSubscription',
                technicianId,
                subscriptionId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Cancelling subscription', context);
                const result = await this._subscriptionService.cancelSubscription(technicianId, subscriptionId, reason);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Cancel subscription controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to cancel subscription');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this._subscriptionService = subscriptionService;
        this._logger = logger;
    }
}
exports.TechnicianManagementSubscriptionController = TechnicianManagementSubscriptionController;
