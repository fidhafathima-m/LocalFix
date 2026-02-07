"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderManagementController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class OrderManagementController {
    constructor(orderService, logger) {
        this.getOrders = async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const status = req.query.status;
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
                const result = await this._orderService.getOrders(page, limit, search, status);
                this._logger.info('Orders retrieved successfully', {
                    ...context,
                    totalOrders: result.total,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.ORDER_MESSAGES.ORDERS_RETRIEVED, result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.ORDER_MESSAGES.FAILED_FETCH_ORDERS;
                this._logger.error('Get orders controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getOrderById = async (req, res) => {
            const { orderId } = req.params;
            const context = {
                operation: 'getOrderById',
                orderId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching order by ID', context);
                const order = await this._orderService.getOrderById(orderId);
                this._logger.info('Order retrieved successfully', {
                    ...context,
                    orderCode: order.orderCode,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.ORDER_MESSAGES.ORDER_RETRIEVED, {
                    order,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : constants_1.ORDER_MESSAGES.ORDER_NOT_FOUND;
                this._logger.error('Get order by ID controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getOrderStats = async (req, res) => {
            const context = {
                operation: 'getOrderStats',
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching order statistics', context);
                const stats = await this._orderService.getOrderStats();
                this._logger.info('Order statistics retrieved successfully', context);
                const response = responseHelper_1.ResponseHelper.success(constants_1.ORDER_MESSAGES.STATS_RETRIEVED, {
                    stats,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.ORDER_MESSAGES.FAILED_FETCH_STATS;
                this._logger.error('Get order stats controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.updateOrderStatus = async (req, res) => {
            const { orderId } = req.params;
            const updateDto = req.body;
            const context = {
                operation: 'updateOrderStatus',
                orderId,
                newStatus: updateDto.status,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating order status', context);
                // Validation
                if (!updateDto.status) {
                    this._logger.warn('Order status update failed - status required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.ORDER_MESSAGES.STATUS_REQUIRED);
                    res.status(response.statusCode).json(response);
                    return;
                }
                const validStatuses = [
                    'pending',
                    'confirmed',
                    'in_progress',
                    'completed',
                    'cancelled',
                    'refunded',
                ];
                if (!validStatuses.includes(updateDto.status)) {
                    this._logger.warn('Order status update failed - invalid status', {
                        ...context,
                        providedStatus: updateDto.status,
                    });
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.ORDER_MESSAGES.INVALID_STATUS);
                    res.status(response.statusCode).json(response);
                    return;
                }
                const order = await this._orderService.updateOrderStatus(orderId, updateDto);
                this._logger.info('Order status updated successfully', {
                    ...context,
                    orderCode: order.orderCode,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.ORDER_MESSAGES.STATUS_UPDATED, {
                    order,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.ORDER_MESSAGES.FAILED_UPDATE_STATUS;
                this._logger.error('Update order status controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getOrdersByTechnician = async (req, res) => {
            const { technicianId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 100;
            const context = {
                operation: 'getOrdersByTechnician',
                technicianId,
                page,
                limit,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching orders by technician', context);
                if (!technicianId) {
                    this._logger.warn('Technician ID is required', context);
                    const response = responseHelper_1.ResponseHelper.badRequest('Technician ID is required');
                    res.status(response.statusCode).json(response);
                    return;
                }
                const result = await this._orderService.getOrdersByTechnician(technicianId, page, limit);
                this._logger.info('Technician orders retrieved successfully', {
                    ...context,
                    totalOrders: result.total,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.ORDER_MESSAGES.ORDERS_RETRIEVED, result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.ORDER_MESSAGES.FAILED_FETCH_ORDERS;
                this._logger.error('Get technician orders controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this._orderService = orderService;
        this._logger = logger;
    }
}
exports.OrderManagementController = OrderManagementController;
