"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderManagementService = void 0;
const constants_1 = require("../constants");
const mongoose_1 = require("mongoose");
const orderMapper_1 = require("../mappers/orderMapper");
class OrderManagementService {
    constructor(orderRepository, logger) {
        this._orderRepository = orderRepository;
        this._logger = logger;
    }
    // In OrderManagementService - update getOrders method
    async getOrders(page = 1, limit = 10, search, status) {
        const context = {
            operation: 'getOrders',
            page,
            limit,
            search,
            status,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching orders', context);
            const skip = (page - 1) * limit;
            // Build filter
            const filter = {};
            if (status && status !== 'all') {
                filter.status = status;
            }
            let orders;
            let total;
            if (search) {
                this._logger.debug('Searching orders with query', {
                    ...context,
                    searchQuery: search,
                });
                orders = await this._orderRepository.search(search, limit, status);
                total = orders.length;
            }
            else {
                this._logger.debug('Fetching orders with filter', {
                    ...context,
                    filter,
                });
                orders = await this._orderRepository.findAll(filter, skip, limit);
                total = await this._orderRepository.count(filter);
            }
            this._logger.info('Orders retrieved successfully', {
                ...context,
                ordersCount: orders.length,
                totalOrders: total,
            });
            return (0, orderMapper_1.toOrderListResponseDto)(orders, total, page, limit);
        }
        catch (error) {
            this._logger.error('Get orders error', {
                ...context,
                error: error instanceof Error ? error.message : 'Error in getting orders',
            });
            throw new Error(constants_1.ORDER_MESSAGES.FAILED_FETCH_ORDERS);
        }
    }
    async getOrderById(orderId) {
        const context = {
            operation: 'getOrderById',
            orderId,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching order by ID', context);
            if (!mongoose_1.Types.ObjectId.isValid(orderId)) {
                this._logger.warn('Invalid order ID provided', context);
                throw new Error(constants_1.ORDER_MESSAGES.INVALID_ORDER_ID);
            }
            const order = await this._orderRepository.findById(orderId);
            if (!order) {
                this._logger.warn('Order not found', context);
                throw new Error(constants_1.ORDER_MESSAGES.ORDER_NOT_FOUND);
            }
            this._logger.info('Order retrieved successfully', {
                ...context,
                orderCode: order.orderCode,
            });
            return (0, orderMapper_1.toOrderResponseDto)(order);
        }
        catch (error) {
            this._logger.error('Get order by ID error', {
                ...context,
                error: error instanceof Error
                    ? error.message
                    : 'Error in getting order by Id',
            });
            throw error;
        }
    }
    async getOrderStats() {
        const context = {
            operation: 'getOrderStats',
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching order statistics', context);
            const stats = await this._orderRepository.getOrderStats();
            this._logger.info('Order statistics retrieved successfully', {
                ...context,
                totalOrders: stats.totalOrders,
                totalRevenue: stats.totalRevenue,
            });
            return (0, orderMapper_1.toOrderStatsDto)(stats);
        }
        catch (error) {
            this._logger.error('Get order stats error', {
                ...context,
                error: error instanceof Error
                    ? error.message
                    : 'Error in getting order stats',
            });
            throw new Error(constants_1.ORDER_MESSAGES.FAILED_FETCH_STATS);
        }
    }
    async updateOrderStatus(orderId, updateData) {
        const context = {
            operation: 'updateOrderStatus',
            orderId,
            newStatus: updateData.status,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Updating order status', context);
            if (!mongoose_1.Types.ObjectId.isValid(orderId)) {
                this._logger.warn('Invalid order ID provided', context);
                throw new Error(constants_1.ORDER_MESSAGES.INVALID_ORDER_ID);
            }
            // Validate status
            const validStatuses = [
                'pending',
                'accepted',
                'confirmed',
                'in_progress',
                'on_the_way',
                'completed',
                'cancelled',
                'refunded',
            ];
            if (!validStatuses.includes(updateData.status)) {
                this._logger.warn('Invalid order status provided', {
                    ...context,
                    providedStatus: updateData.status,
                });
                throw new Error('Invalid order status');
            }
            // Check if order exists
            const existingOrder = await this._orderRepository.findById(orderId);
            if (!existingOrder) {
                this._logger.warn('Order not found for status update', context);
                throw new Error(constants_1.ORDER_MESSAGES.ORDER_NOT_FOUND);
            }
            // Prepare update data with history
            const updatePayload = {
                status: updateData.status,
                $push: {
                    history: {
                        status: updateData.status,
                        description: updateData.reason ||
                            `Status updated to ${updateData.status} by admin`,
                        updatedBy: 'admin',
                        timestamp: new Date(),
                    },
                },
            };
            this._logger.debug('Updating order status in repository', {
                ...context,
                updatePayload,
            });
            const updatedOrder = await this._orderRepository.update(orderId, updatePayload);
            if (!updatedOrder) {
                this._logger.error('Order status update failed - repository returned null', context);
                throw new Error(constants_1.ORDER_MESSAGES.FAILED_UPDATE_STATUS);
            }
            this._logger.info('Order status updated successfully', {
                ...context,
                orderCode: updatedOrder.orderCode,
                oldStatus: existingOrder.status,
                newStatus: updatedOrder.status,
            });
            return (0, orderMapper_1.toOrderResponseDto)(updatedOrder);
        }
        catch (error) {
            this._logger.error('Update order status error', {
                ...context,
                error: error instanceof Error
                    ? error.message
                    : 'Error in updating order status',
            });
            throw error;
        }
    }
    async getOrdersByTechnician(technicianId, page = 1, limit = 100) {
        const context = {
            operation: 'getOrdersByTechnician',
            technicianId,
            page,
            limit,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching orders by technician', context);
            if (!mongoose_1.Types.ObjectId.isValid(technicianId)) {
                this._logger.warn('Invalid technician ID provided', context);
                throw new Error('Invalid technician ID');
            }
            const skip = (page - 1) * limit;
            const filter = {
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
            };
            const [orders, total] = await Promise.all([
                this._orderRepository.findAll(filter, skip, limit),
                this._orderRepository.count(filter),
            ]);
            this._logger.info('Technician orders retrieved successfully', {
                ...context,
                ordersCount: orders.length,
                totalOrders: total,
            });
            return (0, orderMapper_1.toOrderListResponseDto)(orders, total, page, limit);
        }
        catch (error) {
            this._logger.error('Get technician orders error', {
                ...context,
                error: error instanceof Error
                    ? error.message
                    : 'Error in getting order by technician',
            });
            throw new Error('Failed to fetch technician orders');
        }
    }
}
exports.OrderManagementService = OrderManagementService;
