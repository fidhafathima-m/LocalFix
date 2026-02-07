"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class TechnicianOrderController {
    constructor(orderService, logger) {
        this.getTechnicianOrders = async (req, res) => {
            const technicianId = req.user?.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const context = {
                operation: 'getTechnicianOrders',
                technicianId,
                page,
                limit,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technician orders', context);
                if (!technicianId) {
                    this._logger.warn('Get technician orders failed - authentication required', context);
                    const errorResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                const result = await this._orderService.getTechnicianOrders(technicianId, page, limit);
                this._logger.info('Technician orders retrieved successfully', {
                    ...context,
                    orderCount: result.data?.orders?.length || 0,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get technician orders controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getTechnicianOrderById = async (req, res) => {
            const technicianId = req.user?.id;
            const { orderId } = req.params;
            const context = {
                operation: 'getTechnicianOrderById',
                technicianId,
                orderId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technician order by ID', context);
                if (!technicianId) {
                    this._logger.warn('Get technician order failed - authentication required', context);
                    const errorResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                const result = await this._orderService.getTechnicianOrderById(technicianId, orderId);
                this._logger.info('Technician order retrieved successfully', {
                    ...context,
                    orderFound: !!result,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get technician order by ID controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.updateOrderStatus = async (req, res) => {
            const technicianId = req.user?.id;
            const { orderId } = req.params;
            const { status, reason } = req.body;
            const context = {
                operation: 'updateOrderStatus',
                technicianId,
                orderId,
                status,
                reason,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating order status', context);
                if (!technicianId) {
                    this._logger.warn('Update order status failed - authentication required', context);
                    const errorResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                if (!status) {
                    this._logger.warn('Update order status failed - status required', context);
                    const badRequestResponse = responseHelper_1.ResponseHelper.badRequest('Status is required');
                    res.status(badRequestResponse.statusCode).json(badRequestResponse);
                    return;
                }
                const result = await this._orderService.updateOrderStatus(orderId, status, 'technician', reason);
                this._logger.info('Order status updated successfully', context);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Update order status controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getTechnicianOrderStats = async (req, res) => {
            const technicianId = req.user?.id;
            const context = {
                operation: 'getTechnicianOrderStats',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technician order stats', context);
                if (!technicianId) {
                    this._logger.warn('Get technician order stats failed - authentication required', context);
                    const errorResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                const result = await this._orderService.getTechnicianOrderStats(technicianId);
                this._logger.info('Technician order stats retrieved successfully', context);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get technician order stats controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this._orderService = orderService;
        this._logger = logger;
    }
}
exports.default = TechnicianOrderController;
