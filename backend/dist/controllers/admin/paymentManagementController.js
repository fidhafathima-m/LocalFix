"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentManagementController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class PaymentManagementController {
    constructor(paymentService, logger) {
        this.getPayments = async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const status = req.query.status;
            const startDate = req.query.startDate;
            const endDate = req.query.endDate;
            const context = {
                operation: 'getPayments',
                page,
                limit,
                search,
                status,
                startDate,
                endDate,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching payments', context);
                const result = await this._paymentService.getPayments(page, limit, search, status, startDate, endDate);
                this._logger.info('Payments retrieved successfully', {
                    ...context,
                    totalPayments: result.total,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.PAYMENT_MESSAGES.PAYMENTS_RETRIEVED, result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.PAYMENT_MESSAGES.FAILED_FETCH_PAYMENTS;
                this._logger.error('Get payments controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getPaymentById = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'getPaymentById',
                paymentId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching payment by ID', context);
                if (!id) {
                    const response = responseHelper_1.ResponseHelper.badRequest(constants_1.PAYMENT_MESSAGES.PAYMENT_ID_REQUIRED);
                    res.status(response.statusCode).json(response);
                    return;
                }
                const payment = await this._paymentService.getPaymentById(id);
                this._logger.info('Payment retrieved successfully', {
                    ...context,
                    paymentId: payment.id,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.PAYMENT_MESSAGES.PAYMENT_RETRIEVED, {
                    payment,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.PAYMENT_MESSAGES.PAYMENT_NOT_FOUND;
                this._logger.error('Get payment by ID controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getPaymentStats = async (req, res) => {
            const context = {
                operation: 'getPaymentStats',
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching payment statistics', context);
                const stats = await this._paymentService.getPaymentStats();
                this._logger.info('Payment stats retrieved successfully', {
                    ...context,
                    stats,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.PAYMENT_MESSAGES.STATS_RETRIEVED, { stats });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.PAYMENT_MESSAGES.FAILED_FETCH_STATS;
                this._logger.error('Get payment stats controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.processRefund = async (req, res) => {
            try {
                const { paymentId } = req.params;
                const { reason } = req.body;
                if (!paymentId) {
                    return res.status(400).json({
                        success: false,
                        message: 'Payment ID is required',
                    });
                }
                await this._paymentService.processRefund(paymentId, { reason });
                return res.status(200).json({
                    success: true,
                    message: "Refund processed successfully and amount credited to user's wallet",
                });
            }
            catch (error) {
                console.error('Process refund error:', error);
                return res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to process refund',
                });
            }
        };
        this.exportPayments = async (req, res) => {
            const format = req.query.format || 'csv';
            const filters = req.query;
            const context = {
                operation: 'exportPayments',
                format,
                filters,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Exporting payments', context);
                const { data, filename } = await this._paymentService.exportPayments(format, filters);
                res.setHeader('Content-Type', format === 'csv'
                    ? 'text/csv'
                    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
                res.send(data);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.PAYMENT_MESSAGES.FAILED_EXPORT_PAYMENTS;
                this._logger.error('Export payments controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this._paymentService = paymentService;
        this._logger = logger;
    }
}
exports.PaymentManagementController = PaymentManagementController;
