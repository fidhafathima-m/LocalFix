"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notificationMapper_1 = require("../mappers/notificationMapper");
class NotificationService {
    constructor(notificationRepository, logger) {
        this._notificationRepository = notificationRepository;
        this._logger = logger;
    }
    async createNotification(createDto) {
        const context = {
            operation: 'createNotification',
            userId: createDto.userId,
            userType: createDto.userType,
            type: createDto.type,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Creating notification', context);
            const notification = await this._notificationRepository.create(createDto);
            const responseDto = (0, notificationMapper_1.toNotificationResponseDto)(notification);
            this._logger.info('Notification created successfully', {
                ...context,
                notificationId: responseDto._id,
            });
            return responseDto;
        }
        catch (error) {
            this._logger.error('Create notification error', {
                ...context,
                error: error instanceof Error
                    ? error.message
                    : 'Error in creating notification',
            });
            throw new Error('Failed to create notification');
        }
    }
    async getNotificationsByUser(userId, page = 1, limit = 20) {
        const context = {
            operation: 'getNotificationsByUser',
            userId,
            page,
            limit,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching notifications for user', context);
            const skip = (page - 1) * limit;
            const [notifications, total] = await Promise.all([
                this._notificationRepository.findByUser(userId, skip, limit),
                this._notificationRepository.countByUser(userId),
            ]);
            const responseDto = (0, notificationMapper_1.toNotificationListResponseDto)(notifications, total, page, limit);
            this._logger.info('Notifications retrieved successfully', {
                ...context,
                count: notifications.length,
                total,
            });
            return responseDto;
        }
        catch (error) {
            this._logger.error('Get notifications error', {
                ...context,
                error: error instanceof Error
                    ? error.message
                    : 'Error in getting notification for user',
            });
            throw new Error('Failed to retrieve notifications');
        }
    }
    async markAsRead(notificationId) {
        const context = {
            operation: 'markAsRead',
            notificationId,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Marking notification as read', context);
            const notification = await this._notificationRepository.markAsRead(notificationId);
            if (!notification) {
                this._logger.warn('Notification not found', context);
                throw new Error('Notification not found');
            }
            const responseDto = (0, notificationMapper_1.toNotificationResponseDto)(notification);
            this._logger.info('Notification marked as read successfully', context);
            return responseDto;
        }
        catch (error) {
            this._logger.error('Mark as read error', {
                ...context,
                error: error instanceof Error ? error.message : 'Error in marking as read',
            });
            throw error;
        }
    }
    async markAllAsRead(userId) {
        const context = {
            operation: 'markAllAsRead',
            userId,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Marking all notifications as read', context);
            const success = await this._notificationRepository.markAllAsRead(userId);
            this._logger.info('All notifications marked as read', {
                ...context,
                success,
            });
            return {
                success: true,
                message: 'All notifications marked as read',
            };
        }
        catch (error) {
            this._logger.error('Mark all as read error', {
                ...context,
                error: error instanceof Error
                    ? error.message
                    : 'Error in marking all as read',
            });
            return {
                success: false,
                message: 'Failed to mark all notifications as read',
            };
        }
    }
    async getUnreadCount(userId) {
        const context = {
            operation: 'getUnreadCount',
            userId,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Getting unread notification count', context);
            const count = await this._notificationRepository.countUnreadByUser(userId);
            this._logger.info('Unread count retrieved', {
                ...context,
                count,
            });
            return {
                success: true,
                count,
            };
        }
        catch (error) {
            this._logger.error('Get unread count error', {
                ...context,
                error: error instanceof Error
                    ? error.message
                    : 'Error in getting unread notifications count',
            });
            return {
                success: false,
                count: 0,
                message: 'Failed to get unread count',
            };
        }
    }
    // Helper methods for common notification types
    async createApplicationApprovedNotification(technicianId, technicianName) {
        return this.createNotification({
            userId: technicianId,
            userType: 'technician',
            type: 'application_approved',
            title: 'Application Approved!',
            message: `Congratulations ${technicianName}! Your technician application has been approved. You can now start accepting orders.`,
            priority: 'high',
            data: {
                applicationStatus: 'approved',
            },
        });
    }
    async createNewBookingNotification(technicianId, orderId, serviceType) {
        return this.createNotification({
            userId: technicianId,
            userType: 'technician',
            type: 'new_booking',
            title: 'New Booking Request',
            message: `You have a new ${serviceType} service request. Please review and accept the order.`,
            priority: 'high',
            data: {
                orderId,
                serviceType,
            },
        });
    }
    async createRatingReceivedNotification(technicianId, rating, customerName) {
        return this.createNotification({
            userId: technicianId,
            userType: 'technician',
            type: 'rating_received',
            title: 'New Rating Received',
            message: `${customerName} gave you a ${rating}-star rating. Keep up the good work!`,
            priority: 'medium',
            data: {
                rating,
                customerName,
            },
        });
    }
    async createPaymentSuccessNotification(technicianId, amount, paymentId) {
        return this.createNotification({
            userId: technicianId,
            userType: 'technician',
            type: 'payment_success',
            title: 'Payment Received',
            message: `₹${amount} has been credited to your account for completed service.`,
            priority: 'medium',
            data: {
                amount,
                paymentId,
            },
        });
    }
    async createBookingConfirmedNotification(userId, serviceType, date) {
        return this.createNotification({
            userId,
            userType: 'customer',
            type: 'booking_confirmed',
            title: 'Booking Confirmed!',
            message: `Your ${serviceType} booking for ${date} has been confirmed.`,
            priority: 'medium',
            data: {
                serviceType,
                date,
            },
        });
    }
    async createServiceReminderNotification(userId, serviceType, date) {
        return this.createNotification({
            userId,
            userType: 'customer',
            type: 'reminder',
            title: 'Service Reminder',
            message: `Reminder: Your ${serviceType} service is scheduled for tomorrow (${date}).`,
            priority: 'medium',
            data: {
                serviceType,
                date,
            },
        });
    }
    async createTechnicianUnavailableNotification(customerId, technicianName, serviceType, scheduledDate, orderId) {
        return this.createNotification({
            userId: customerId,
            userType: 'customer',
            type: 'technician_unavailable',
            title: 'Service Cancelled',
            message: `Your ${serviceType} service with ${technicianName} on ${scheduledDate} has been cancelled due to technician unavailability. We will contact you to reschedule.`,
            priority: 'high',
            data: {
                orderId,
                serviceType,
                scheduledDate,
                technicianName,
                reason: 'technician_unavailable',
            },
        });
    }
    async createAvailabilityChangeImpactNotification(technicianId, cancelledOrdersCount, date) {
        return this.createNotification({
            userId: technicianId,
            userType: 'technician',
            type: 'availability_change_impact',
            title: 'Orders Cancelled',
            message: `${cancelledOrdersCount} order(s) for ${date} have been cancelled due to your unavailability. Customers have been notified.`,
            priority: 'medium',
            data: {
                cancelledOrdersCount,
                date,
            },
        });
    }
}
exports.NotificationService = NotificationService;
