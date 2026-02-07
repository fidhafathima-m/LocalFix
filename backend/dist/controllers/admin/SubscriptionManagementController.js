"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionManagementController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class SubscriptionManagementController {
    constructor(subscriptionService, logger) {
        this.createSubscription = async (req, res) => {
            const context = {
                operation: 'createSubscription',
                body: req.body,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Creating new subscription plan', context);
                const createDto = req.body;
                // Validation
                if (!createDto.name?.trim()) {
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.SUBSCRIPTION_MESSAGES.NAME_REQUIRED);
                    res.status(response.statusCode).json(response);
                    return;
                }
                if (createDto.price === undefined || createDto.price < 0) {
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.SUBSCRIPTION_MESSAGES.PRICE_REQUIRED);
                    res.status(response.statusCode).json(response);
                    return;
                }
                if (!createDto.durationMonths || createDto.durationMonths < 1) {
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.SUBSCRIPTION_MESSAGES.DURATION_REQUIRED);
                    res.status(response.statusCode).json(response);
                    return;
                }
                const subscription = await this._subscriptionService.createSubscription(createDto);
                this._logger.info('Subscription created successfully', {
                    ...context,
                    subscriptionId: subscription.id,
                    subscriptionName: subscription.name,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTION_CREATED, { subscription });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SUBSCRIPTION_MESSAGES.FAILED_CREATE_SUBSCRIPTION;
                this._logger.error('Create subscription controller error', {
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
                this._logger.info('Fetching subscription by ID', context);
                const subscription = await this._subscriptionService.getSubscriptionById(id);
                const response = responseHelper_1.ResponseHelper.success(constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTION_RETRIEVED, { subscription });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND;
                this._logger.error('Get subscription by ID controller error', {
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
                this._logger.info('Fetching subscription by slug', context);
                const subscription = await this._subscriptionService.getSubscriptionBySlug(slug);
                const response = responseHelper_1.ResponseHelper.success(constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTION_RETRIEVED, { subscription });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTION_NOT_FOUND;
                this._logger.error('Get subscription by slug controller error', {
                    ...context,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getAllSubscriptions = async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const context = {
                operation: 'getAllSubscriptions',
                page,
                limit,
                search,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching all subscriptions', context);
                const result = await this._subscriptionService.getAllSubscriptions(page, limit, search);
                const response = responseHelper_1.ResponseHelper.success(constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTIONS_RETRIEVED, result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SUBSCRIPTION_MESSAGES.FAILED_FETCH_SUBSCRIPTIONS;
                this._logger.error('Get all subscriptions controller error', {
                    ...context,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.updateSubscription = async (req, res) => {
            const { id } = req.params;
            const updateDto = req.body;
            const context = {
                operation: 'updateSubscription',
                subscriptionId: id,
                updateFields: Object.keys(updateDto),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating subscription', context);
                const subscription = await this._subscriptionService.updateSubscription(id, updateDto);
                const response = responseHelper_1.ResponseHelper.success(constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTION_UPDATED, { subscription });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SUBSCRIPTION_MESSAGES.FAILED_UPDATE_SUBSCRIPTION;
                this._logger.error('Update subscription controller error', {
                    ...context,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.deleteSubscription = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'deleteSubscription',
                subscriptionId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Deleting subscription', context);
                await this._subscriptionService.deleteSubscription(id);
                const response = responseHelper_1.ResponseHelper.success(constants_1.SUBSCRIPTION_MESSAGES.SUBSCRIPTION_DELETED);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.SUBSCRIPTION_MESSAGES.FAILED_DELETE_SUBSCRIPTION;
                this._logger.error('Delete subscription controller error', {
                    ...context,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.searchSubscriptions = async (req, res) => {
            const { q } = req.query;
            const limit = parseInt(req.query.limit) || 10;
            const context = {
                operation: 'searchSubscriptions',
                query: q,
                limit,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Searching subscriptions', context);
                if (!q || typeof q !== 'string') {
                    const response = responseHelper_1.ResponseHelper.badRequest('Search query is required');
                    res.status(response.statusCode).json(response);
                    return;
                }
                const subscriptions = await this._subscriptionService.searchSubscriptions(q, limit);
                const response = responseHelper_1.ResponseHelper.success('Subscriptions search completed', {
                    subscriptions,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                this._logger.error('Search subscriptions controller error', {
                    ...context,
                    error: error instanceof Error
                        ? error.message
                        : 'Error in searching subscriptions',
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to search subscriptions');
                res.status(response.statusCode).json(response);
            }
        };
        this._subscriptionService = subscriptionService;
        this._logger = logger;
    }
}
exports.SubscriptionManagementController = SubscriptionManagementController;
