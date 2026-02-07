"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const responseHelper_1 = require("../utils/responseHelper");
class NotificationController {
    constructor(notificationService, logger) {
        this.getNotificationsByUser = async (req, res) => {
            const { userId } = req.query;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const context = {
                operation: 'getNotificationsByUser',
                userId,
                page,
                limit,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching notifications for user', context);
                if (!userId || typeof userId !== 'string') {
                    const response = responseHelper_1.ResponseHelper.badRequest('User ID is required');
                    res.status(response.statusCode).json(response);
                    return;
                }
                const result = await this._notificationService.getNotificationsByUser(userId, page, limit);
                this._logger.info('Notifications retrieved successfully', {
                    ...context,
                    count: result.notifications.length,
                });
                const response = responseHelper_1.ResponseHelper.success('Notifications retrieved successfully', result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                this._logger.error('Get notifications controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to retrieve notifications');
                res.status(response.statusCode).json(response);
            }
        };
        this.markAsRead = async (req, res) => {
            const { notificationId } = req.params;
            const context = {
                operation: 'markAsRead',
                notificationId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Marking notification as read', context);
                const result = await this._notificationService.markAsRead(notificationId);
                this._logger.info('Notification marked as read successfully', context);
                const response = responseHelper_1.ResponseHelper.success('Notification marked as read', {
                    notification: result,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                this._logger.error('Mark as read controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to mark notification as read');
                res.status(response.statusCode).json(response);
            }
        };
        this.markAllAsRead = async (req, res) => {
            const { userId } = req.body;
            const context = {
                operation: 'markAllAsRead',
                userId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Marking all notifications as read', context);
                if (!userId) {
                    const response = responseHelper_1.ResponseHelper.badRequest('User ID is required');
                    res.status(response.statusCode).json(response);
                    return;
                }
                const result = await this._notificationService.markAllAsRead(userId);
                const response = result.success
                    ? responseHelper_1.ResponseHelper.success(result.message)
                    : responseHelper_1.ResponseHelper.error(result.message);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                this._logger.error('Mark all as read controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to mark all notifications as read');
                res.status(response.statusCode).json(response);
            }
        };
        this.getUnreadCount = async (req, res) => {
            const { userId } = req.query;
            const context = {
                operation: 'getUnreadCount',
                userId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Getting unread notification count', context);
                if (!userId || typeof userId !== 'string') {
                    const response = responseHelper_1.ResponseHelper.badRequest('User ID is required');
                    res.status(response.statusCode).json(response);
                    return;
                }
                const result = await this._notificationService.getUnreadCount(userId);
                const response = result.success
                    ? responseHelper_1.ResponseHelper.success('Unread count retrieved', {
                        count: result.count,
                    })
                    : responseHelper_1.ResponseHelper.error(result.message || 'Failed to get unread count');
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                this._logger.error('Get unread count controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to get unread count');
                res.status(response.statusCode).json(response);
            }
        };
        this._notificationService = notificationService;
        this._logger = logger;
    }
}
exports.NotificationController = NotificationController;
