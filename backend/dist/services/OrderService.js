"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const responseHelper_1 = require("../utils/responseHelper");
class OrderService {
    constructor(orderRepository, technicianRepository, socketService, messageService, logger) {
        this._logger = logger;
        this._orderRepository = orderRepository;
        this._technicianRepository = technicianRepository;
        this._socketService = socketService;
        this._messageService = messageService;
    }
    async getUserOrders(userId, page = 1, limit = 10) {
        const context = {
            operation: 'getUserOrders',
            data: { userId, page, limit },
        };
        try {
            this._logger.info('Fetching user orders', context);
            const result = await this._orderRepository.findByUserId(userId, page, limit);
            this._logger.info('User orders retrieved successfully', {
                ...context,
                orderCount: result.orders.length,
                total: result.total,
            });
            const orderDtos = result.orders.map((order) => this.mapToDto(order));
            return responseHelper_1.ResponseHelper.success('Orders retrieved successfully', {
                orders: orderDtos,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    pages: Math.ceil(result.total / limit),
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching user orders', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch orders');
        }
    }
    async getOrderById(userId, orderId) {
        const context = {
            operation: 'getOrderById',
            data: { userId, orderId },
        };
        try {
            this._logger.info('Fetching order by ID', context);
            const order = await this._orderRepository.findById(orderId);
            if (!order) {
                this._logger.warn('Order not found', context);
                return responseHelper_1.ResponseHelper.notFound('Order not found');
            }
            this._logger.debug('Order user ID vs requesting user ID', {
                orderUserId: order.userId.toString(),
                requestingUserId: userId,
                match: order.userId.toString() === userId,
            });
            const realOrderId = order.userId?._id?.toString() || order.userId?.toString();
            // Check if user has access to this order
            if (realOrderId !== userId) {
                this._logger.warn('User not authorized to access this order', {
                    ...context,
                    orderUserId: order.userId.toString(),
                    requestingUserId: userId,
                });
                return responseHelper_1.ResponseHelper.forbidden('Not authorized to access this order');
            }
            this._logger.info('Order retrieved successfully', context);
            const orderDto = this.mapToDto(order);
            return responseHelper_1.ResponseHelper.success('Order retrieved successfully', orderDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching order', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch order');
        }
    }
    async createOrderFromBooking(bookingId, paymentData) {
        const context = {
            operation: 'createOrderFromBooking',
            data: { bookingId, ...paymentData },
        };
        try {
            this._logger.info('Creating/updating order from booking', context);
            const existingOrder = await this._orderRepository.findByBookingId(bookingId);
            let order;
            if (existingOrder) {
                this._logger.info('Updating existing order for payment retry', {
                    ...context,
                    existingOrderId: existingOrder._id.toString(),
                });
                order = await this._orderRepository.updatePaymentDetails(existingOrder._id.toString(), paymentData);
                if (!order) {
                    this._logger.error('Failed to update existing order', context);
                    return responseHelper_1.ResponseHelper.error('Failed to update order for payment retry');
                }
                this._logger.info('Existing order updated successfully', {
                    ...context,
                    orderId: order._id.toString(),
                });
            }
            else {
                // CREATE new order - even for failed payments
                this._logger.info('Creating new order from booking', context);
                order = await this._orderRepository.createFromBooking(bookingId, paymentData);
                if (!order) {
                    this._logger.error('Failed to create order from booking', context);
                    return responseHelper_1.ResponseHelper.error('Failed to create order');
                }
                this._logger.info('New order created successfully', {
                    ...context,
                    orderId: order._id.toString(),
                    orderCode: order.orderCode,
                    paymentStatus: paymentData.status,
                });
                try {
                    this._logger.info('🔄 Initializing chat room for new order', {
                        orderId: order._id.toString(),
                        userId: order.userId.toString(),
                        technicianId: order.technicianId.toString(),
                    });
                    await this._messageService.initializeChatRoom(order._id.toString(), // Use orderId as the chat room identifier
                    order.userId.toString(), order.technicianId.toString());
                    this._logger.info('✅ Chat room initialized successfully for new order');
                }
                catch (chatError) {
                    this._logger.error('❌ Failed to initialize chat room for new order', {
                        error: chatError instanceof Error
                            ? chatError.message
                            : 'Unknown error',
                        orderId: order._id.toString(),
                    });
                    // Don't fail order creation if chat room initialization fails
                }
                // Only send notifications for successful payments
                if (paymentData.status === 'paid') {
                    await this.notifyUserAboutOrderStatusChange(order, 'pending');
                    await this.notifyTechnicianAboutNewOrder(order);
                }
                else if (paymentData.status === 'failed') {
                    // Send failure notification
                    await this.notifyUserAboutPayment(order, 'failed');
                }
            }
            const orderDto = this.mapToDto(order);
            this._logger.debug('Order dto: ', orderDto);
            return responseHelper_1.ResponseHelper.created(existingOrder
                ? 'Order updated successfully'
                : 'Order created successfully', orderDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error creating/updating order from booking', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to process order');
        }
    }
    async cancelOrder(userId, orderId, reason) {
        const context = {
            operation: 'cancelOrder',
            data: { userId, orderId, reason },
        };
        try {
            this._logger.info('Cancelling order', context);
            const order = await this._orderRepository.findById(orderId);
            if (!order) {
                this._logger.warn('Order not found for cancellation', context);
                return responseHelper_1.ResponseHelper.notFound('Order not found');
            }
            const realOrderId = order.userId?._id?.toString() || order.userId?.toString();
            // Check if user owns the order
            if (realOrderId !== userId) {
                this._logger.warn('User not authorized to cancel this order', context);
                return responseHelper_1.ResponseHelper.forbidden('Not authorized to cancel this order');
            }
            // Check if order can be cancelled
            if (['cancelled', 'completed', 'refunded'].includes(order.status)) {
                this._logger.warn('Order cannot be cancelled in current status', {
                    ...context,
                    currentStatus: order.status,
                });
                return responseHelper_1.ResponseHelper.badRequest(`Order cannot be cancelled in ${order.status} status`);
            }
            const updatedOrder = await this._orderRepository.updateStatus(orderId, 'cancelled', 'user', reason);
            if (!updatedOrder) {
                this._logger.error('Failed to cancel order', context);
                return responseHelper_1.ResponseHelper.error('Failed to cancel order');
            }
            this._logger.info('Order cancelled successfully', context);
            const orderDto = this.mapToDto(updatedOrder);
            return responseHelper_1.ResponseHelper.success('Order cancelled successfully', orderDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error cancelling order', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to cancel order');
        }
    }
    mapToDto(order) {
        let userInfo = {};
        if (order.userId && typeof order.userId === 'object') {
            // If userId is a populated object
            userInfo = {
                _id: order.userId._id?.toString() || order.userId.toString(),
                fullName: order.userId.fullName || order.userId.name || 'Customer',
                email: order.userId.email || '',
                phone: order.userId.phone || '',
            };
        }
        else {
            userInfo = {
                _id: order.userId?.toString() || '',
                fullName: 'Customer',
                email: '',
                phone: '',
            };
        }
        return {
            _id: order._id.toString(),
            orderCode: order.orderCode,
            bookingId: order.bookingId.toString(),
            userId: userInfo,
            technicianId: {
                _id: order.technicianId._id?.toString() || order.technicianId.toString(),
                displayName: order.technicianId.displayName,
                profilePictureUrl: order.technicianId.profilePictureUrl,
                averageRating: order.technicianId.averageRating,
                ratingCount: order.technicianId.ratingCount,
                skills: order.technicianId.skills || order.technicianId.services || [],
            },
            serviceId: order.serviceId?.toString(),
            serviceName: order.serviceName,
            problemDescription: order.problemDescription,
            scheduledAt: order.scheduledAt.toISOString(),
            timeSlot: order.timeSlot,
            address: order.address,
            status: order.status,
            payment: {
                method: order.payment.method,
                amount: order.payment.amount,
                status: order.payment.status,
                transactionId: order.payment.transactionId,
                paidAt: order.payment.paidAt?.toISOString(),
            },
            orderItems: order.orderItems.map((item) => ({
                _id: item._id.toString(),
                customName: item.customName,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                status: item.status,
            })),
            totalAmount: order.totalAmount,
            technicianRating: order.technicianRating,
            userReview: order.userReview,
            history: order.history.map((h) => ({
                status: h.status,
                description: h.description,
                updatedBy: h.updatedBy,
                timestamp: h.timestamp.toISOString(),
            })),
            createdAt: order.createdAt.toISOString(),
            updatedAt: order.updatedAt.toISOString(),
        };
    }
    async getTechnicianOrders(userId, page = 1, limit = 10) {
        const context = {
            operation: 'getTechnicianOrders',
            data: { userId, page, limit },
        };
        try {
            this._logger.info('Fetching technician orders for user', context);
            // Get the actual technician ID from user ID
            const technicianId = await this.getTechnicianIdByUserId(userId);
            if (!technicianId) {
                this._logger.warn('No technician profile found for user', { userId });
                // Return empty orders instead of error if no technician profile exists
                return responseHelper_1.ResponseHelper.success('No orders found', {
                    orders: [],
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        pages: 0,
                    },
                });
            }
            this._logger.debug('Resolved technician ID', {
                userId,
                technicianId,
            });
            const result = await this._orderRepository.findByTechnicianId(technicianId, page, limit);
            this._logger.info('Technician orders retrieved successfully', {
                ...context,
                technicianId,
                orderCount: result.orders.length,
                total: result.total,
            });
            const orderDtos = result.orders.map((order) => this.mapToDto(order));
            return responseHelper_1.ResponseHelper.success('Orders retrieved successfully', {
                orders: orderDtos,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    pages: Math.ceil(result.total / limit),
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching technician orders', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch orders');
        }
    }
    async getTechnicianOrderById(technicianId, orderId) {
        const context = {
            operation: 'getTechnicianOrderById',
            data: { technicianId, orderId },
        };
        try {
            this._logger.info('Fetching technician order by ID', context);
            const order = await this._orderRepository.findById(orderId);
            if (!order) {
                this._logger.warn('Order not found', context);
                return responseHelper_1.ResponseHelper.notFound('Order not found');
            }
            // Check if technician has access to this order
            const orderTechnicianId = order.technicianId?._id?.toString() || order.technicianId?.toString();
            if (orderTechnicianId !== technicianId) {
                this._logger.warn('Technician not authorized to access this order', {
                    ...context,
                    orderTechnicianId,
                    requestingTechnicianId: technicianId,
                });
                return responseHelper_1.ResponseHelper.forbidden('Not authorized to access this order');
            }
            this._logger.info('Technician order retrieved successfully', context);
            const orderDto = this.mapToDto(order);
            return responseHelper_1.ResponseHelper.success('Order retrieved successfully', orderDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching technician order', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch order');
        }
    }
    // In your backend OrderService.ts - update the updateOrderStatus method
    async updateOrderStatus(orderId, status, updatedBy, reason) {
        const context = {
            operation: 'updateOrderStatus',
            data: { orderId, status, updatedBy, reason },
        };
        try {
            this._logger.info('=== UPDATE ORDER STATUS START ===', context);
            const updatedOrder = await this._orderRepository.updateStatus(orderId, status, updatedBy, reason);
            if (!updatedOrder) {
                this._logger.warn('Order not found for status update', context);
                return responseHelper_1.ResponseHelper.notFound('Order not found');
            }
            // ✅ CRITICAL: Update the chat room with new order status
            try {
                // Import your message service in the OrderService
                await this._messageService.syncOrderStatusWithRoom(orderId);
                this._logger.info('Chat room status synced successfully');
            }
            catch (syncError) {
                this._logger.error('Failed to sync chat room status:', syncError);
                // Don't fail the order update if room sync fails
            }
            this._logger.info('Order updated successfully, now triggering notifications');
            // Notify via socket about order status change
            await this._socketService.notifyOrderStatusChange(orderId, status);
            await this.notifyUserAboutOrderStatusChange(updatedOrder, status);
            if (updatedBy === 'technician') {
                await this.notifyTechnicianAboutOrderStatusChange(updatedOrder, status);
            }
            this._logger.info('=== UPDATE ORDER STATUS COMPLETE ===', {
                orderId,
                status,
                userNotified: true,
                technicianNotified: updatedBy === 'technician',
            });
            const orderDto = this.mapToDto(updatedOrder);
            return responseHelper_1.ResponseHelper.success('Order status updated successfully', orderDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error updating order status', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to update order status');
        }
    }
    async getTechnicianOrderStats(technicianId) {
        const context = {
            operation: 'getTechnicianOrderStats',
            data: { technicianId },
        };
        try {
            this._logger.info('Fetching technician order stats', context);
            const stats = await this._orderRepository.getTechnicianStats(technicianId);
            this._logger.info('Technician order stats retrieved successfully', context);
            return responseHelper_1.ResponseHelper.success('Order stats retrieved successfully', stats);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching technician order stats', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch order stats');
        }
    }
    async checkTechnicianAvailability(technicianId, date, timeSlot, excludeOrderId) {
        try {
            const conflictingOrders = await this._orderRepository.findConflictingOrders(technicianId, date, timeSlot, excludeOrderId);
            return conflictingOrders.length === 0;
        }
        catch (error) {
            this._logger.error('Error checking technician availability', {
                technicianId,
                date,
                timeSlot,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return false;
        }
    }
    async rescheduleOrder(userId, orderId, newDate, newTimeSlot) {
        const context = {
            operation: 'rescheduleOrder',
            data: { userId, orderId, newDate, newTimeSlot },
        };
        try {
            this._logger.info('Rescheduling order', context);
            const order = await this._orderRepository.findById(orderId);
            if (!order) {
                this._logger.warn('Order not found for rescheduling', context);
                return responseHelper_1.ResponseHelper.notFound('Order not found');
            }
            const realOrderId = order.userId?._id?.toString() || order.userId?.toString();
            // Check if user owns the order
            if (realOrderId !== userId) {
                this._logger.warn('User not authorized to reschedule this order', context);
                return responseHelper_1.ResponseHelper.forbidden('Not authorized to reschedule this order');
            }
            // Check if order can be rescheduled
            if (!this.canOrderBeRescheduled(order.status)) {
                this._logger.warn('Order cannot be rescheduled in current status', {
                    ...context,
                    currentStatus: order.status,
                });
                return responseHelper_1.ResponseHelper.badRequest(`Order cannot be rescheduled in ${order.status} status`);
            }
            // Validate new date is at least 4 hours in the future
            const scheduledAt = new Date(newDate);
            const now = new Date();
            const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);
            if (scheduledAt < fourHoursFromNow) {
                this._logger.warn('Reschedule date must be at least 4 hours in advance', {
                    ...context,
                    scheduledAt,
                    fourHoursFromNow,
                });
                return responseHelper_1.ResponseHelper.badRequest('New date must be at least 4 hours from now');
            }
            // Check technician availability - FIX: Pass the orderId to exclude
            const isAvailable = await this.checkTechnicianAvailability(order.technicianId.toString(), newDate, newTimeSlot, orderId);
            if (!isAvailable) {
                this._logger.warn('Technician not available for the selected slot', context);
                return responseHelper_1.ResponseHelper.badRequest('Technician is not available for the selected date and time');
            }
            const updatedOrder = await this._orderRepository.rescheduleOrder(orderId, newDate, newTimeSlot, 'user');
            if (!updatedOrder) {
                this._logger.error('Failed to reschedule order in repository', context);
                return responseHelper_1.ResponseHelper.error('Failed to reschedule order');
            }
            this._logger.info('Order rescheduled successfully', {
                ...context,
                oldDate: order.scheduledAt,
                oldTimeSlot: order.timeSlot,
            });
            const orderDto = this.mapToDto(updatedOrder);
            return responseHelper_1.ResponseHelper.success('Order rescheduled successfully', orderDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error rescheduling order', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to reschedule order');
        }
    }
    canOrderBeRescheduled(status) {
        const reschedulableStatuses = ['pending', 'confirmed', 'accepted'];
        return reschedulableStatuses.includes(status);
    }
    async getTechnicianIdByUserId(userId) {
        try {
            this._logger.debug('Looking up technician ID for user', { userId });
            const technician = await this._technicianRepository.findByUserId(userId);
            if (!technician) {
                this._logger.warn('No technician found for user', { userId });
                return null;
            }
            this._logger.debug('Found technician profile', {
                userId,
                technicianId: technician._id.toString(),
            });
            return technician._id.toString();
        }
        catch (error) {
            this._logger.error('Error finding technician by user ID', {
                userId,
                error: error instanceof Error ? error.message : 'Unknown error',
            });
            return null;
        }
    }
    async getOrderByBookingId(userId, bookingId) {
        const context = {
            operation: 'getOrderByBookingId',
            data: { userId, bookingId },
        };
        try {
            this._logger.info('Fetching order by booking ID', context);
            const order = await this._orderRepository.findByBookingId(bookingId);
            if (!order) {
                this._logger.warn('Order not found for booking', context);
                return responseHelper_1.ResponseHelper.notFound('Order not found for this booking');
            }
            const realOrderId = order.userId?._id?.toString() || order.userId?.toString();
            // Check if user has access to this order
            if (realOrderId !== userId) {
                this._logger.warn('User not authorized to access this order', {
                    ...context,
                    orderUserId: order.userId.toString(),
                    requestingUserId: userId,
                });
                return responseHelper_1.ResponseHelper.forbidden('Not authorized to access this order');
            }
            this._logger.info('Order retrieved successfully by booking ID', context);
            const orderDto = this.mapToDto(order);
            return responseHelper_1.ResponseHelper.success('Order retrieved successfully', orderDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching order by booking ID', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch order');
        }
    }
    async updateOrderPayment(orderId, paymentData) {
        const context = {
            operation: 'updateOrderPayment',
            data: { orderId, ...paymentData },
        };
        try {
            this._logger.info('Updating order payment', context);
            const updatedOrder = await this._orderRepository.updatePaymentDetails(orderId, paymentData);
            if (!updatedOrder) {
                this._logger.error('Failed to update order payment', context);
                return responseHelper_1.ResponseHelper.error('Failed to update order payment');
            }
            await this.notifyUserAboutPayment(updatedOrder, paymentData.status);
            this._logger.info('Order payment updated successfully', context);
            const orderDto = this.mapToDto(updatedOrder);
            return responseHelper_1.ResponseHelper.success('Order payment updated successfully', orderDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error updating order payment', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to update order payment');
        }
    }
    async notifyTechnicianAboutNewOrder(order) {
        try {
            const context = {
                operation: 'notifyTechnicianAboutNewOrder',
                orderId: order._id.toString(),
                technicianId: order.technicianId.toString(),
            };
            this._logger.info('Sending new order notification to technician', context);
            // Get technician details for personalized notification
            const technician = await this._technicianRepository.findById(order.technicianId.toString());
            if (!technician) {
                this._logger.warn('Technician not found for notification', context);
                return;
            }
            await this._socketService.notifyNewBookingToTechnician(order.technicianId.toString(), order._id.toString(), order.serviceName);
            this._logger.info('New order notification sent successfully', {
                ...context,
                technicianName: technician.displayName,
                serviceType: order.serviceName,
            });
        }
        catch (error) {
            // Don't fail the order creation if notification fails
            this._logger.error('Failed to send notification to technician', {
                orderId: order._id.toString(),
                technicianId: order.technicianId.toString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async notifyTechnicianAboutOrderStatusChange(order, newStatus) {
        try {
            const context = {
                operation: 'notifyTechnicianAboutOrderStatusChange',
                orderId: order._id.toString(),
                technicianId: order.technicianId.toString(),
                newStatus,
            };
            this._logger.info('Sending order status change notification to technician', context);
            // Get technician details
            const technician = await this._technicianRepository.findById(order.technicianId.toString());
            if (!technician) {
                this._logger.warn('Technician not found for status change notification', context);
                return;
            }
            let notificationTitle = '';
            let notificationMessage = '';
            switch (newStatus) {
                case 'accepted':
                    notificationTitle = 'Order Accepted';
                    notificationMessage = `You have accepted the ${order.serviceName} order.`;
                    break;
                case 'in_progress':
                    notificationTitle = 'Order In Progress';
                    notificationMessage = `You have started working on the ${order.serviceName} order.`;
                    break;
                case 'completed':
                    notificationTitle = 'Order Completed';
                    notificationMessage = `You have completed the ${order.serviceName} order. Payment will be processed shortly.`;
                    break;
                case 'cancelled':
                    notificationTitle = 'Order Cancelled';
                    notificationMessage = `The ${order.serviceName} order has been cancelled.`;
                    break;
                default:
                    return; // Don't send notification for other status changes
            }
            await this._socketService.sendLiveNotification(technician._id.toString(), {
                userId: technician._id.toString(),
                userType: 'technician',
                type: 'order_update',
                title: notificationTitle,
                message: notificationMessage,
                priority: 'medium',
                data: {
                    orderId: order._id.toString(),
                    serviceType: order.serviceName,
                    newStatus,
                },
            });
            this._logger.info('Order status change notification sent successfully', context);
        }
        catch (error) {
            // Don't fail the order update if notification fails
            this._logger.error('Failed to send status change notification to technician', {
                orderId: order._id.toString(),
                technicianId: order.technicianId.toString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async notifyUserAboutOrderStatusChange(order, newStatus) {
        try {
            const context = {
                operation: 'notifyUserAboutOrderStatusChange',
                orderId: order._id.toString(),
                userId: order.userId.toString(),
                newStatus,
            };
            this._logger.info('=== NOTIFY USER START ===', context);
            let notificationTitle = '';
            let notificationMessage = '';
            let notificationType = '';
            let actionUrl = '';
            let priority = 'medium';
            switch (newStatus) {
                case 'confirmed':
                    notificationTitle = 'Booking Confirmed!';
                    notificationMessage = `Your ${order.serviceName} booking has been confirmed.`;
                    notificationType = 'booking_confirmed';
                    break;
                case 'accepted':
                    notificationTitle = 'Technician Assigned';
                    notificationMessage = `A technician has been assigned to your ${order.serviceName} service.`;
                    notificationType = 'technician_assigned';
                    break;
                case 'on_the_way':
                    notificationTitle = 'Technician is on the way!';
                    notificationMessage = `Your technician is coming to your location.`;
                    notificationType = 'on_the_way';
                    actionUrl = `/tracking/${order.orderId}`;
                    priority = 'high';
                    break;
                case 'in_progress':
                    notificationTitle = 'Service In Progress';
                    notificationMessage = `Your ${order.serviceName} service has started.`;
                    notificationType = 'service_in_progress';
                    break;
                case 'completed':
                    notificationTitle = 'Service Completed';
                    notificationMessage = `Your ${order.serviceName} service has been completed successfully.`;
                    notificationType = 'service_completed';
                    break;
                case 'cancelled':
                    notificationTitle = 'Booking Cancelled';
                    notificationMessage = `Your ${order.serviceName} booking has been cancelled.`;
                    notificationType = 'booking_cancelled';
                    break;
                default:
                    this._logger.info('No notification for status:', newStatus);
                    return;
            }
            this._logger.info('Creating user notification:', {
                title: notificationTitle,
                message: notificationMessage,
                type: notificationType,
                actionUrl,
            });
            await this._socketService.notifyOrderStatusUpdate(order.userId.toString(), order._id.toString(), newStatus, order.serviceName);
            this._logger.info('=== NOTIFICATION CREATED SUCCESSFULLY ===', {
                userId: order.userId.toString(),
            });
        }
        catch (error) {
            this._logger.error('=== NOTIFICATION CREATION FAILED ===', {
                orderId: order._id.toString(),
                userId: order.userId.toString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async notifyUserAboutPayment(order, paymentStatus) {
        try {
            const context = {
                operation: 'notifyUserAboutPayment',
                orderId: order._id.toString(),
                userId: order.userId.toString(),
                paymentStatus,
            };
            this._logger.info('=== PAYMENT NOTIFICATION START ===', context);
            let notificationTitle = '';
            let notificationMessage = '';
            if (paymentStatus === 'paid') {
                notificationTitle = 'Payment Successful!';
                notificationMessage = `Your payment of ₹${order.payment.amount} for ${order.serviceName} has been processed successfully.`;
            }
            else if (paymentStatus === 'failed') {
                notificationTitle = 'Payment Failed';
                notificationMessage = `Your payment for ${order.serviceName} failed. Please try again.`;
            }
            else {
                this._logger.info('No payment notification for status:', paymentStatus);
                return;
            }
            this._logger.info('Creating payment notification:', {
                title: notificationTitle,
                message: notificationMessage,
            });
            if (paymentStatus === 'paid') {
                await this._socketService.notifyPaymentSuccess(order.userId.toString(), order.payment.amount, order.serviceName);
            }
            this._logger.info('=== PAYMENT NOTIFICATION CREATED SUCCESSFULLY ===');
        }
        catch (error) {
            this._logger.error('=== PAYMENT NOTIFICATION FAILED ===', {
                orderId: order._id.toString(),
                userId: order.userId.toString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }
    async getOrdersByTechnicianAndDate(technicianId, date) {
        const context = {
            operation: 'getOrdersByTechnicianAndDate',
            data: { technicianId, date },
        };
        try {
            this._logger.info('Fetching orders by technician and date', context);
            const orders = await this._orderRepository.getOrdersByTechnicianAndDate(technicianId, date);
            this._logger.info('Orders retrieved successfully', {
                ...context,
                orderCount: orders.length,
            });
            return orders;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching orders by technician and date', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return [];
        }
    }
}
exports.OrderService = OrderService;
