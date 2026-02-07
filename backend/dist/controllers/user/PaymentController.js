"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
class PaymentController {
    constructor(paymentService, logger) {
        this.createPaymentOrder = async (req, res) => {
            const userId = req.user?.id;
            const { bookingId, amount, currency, type, sparePartId } = req.body;
            const context = {
                operation: 'createPaymentOrder',
                userId,
                bookingId,
                amount,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Creating payment order', context);
                if (!userId) {
                    this._logger.warn('Create payment order failed - authentication required', context);
                    const errorResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                if (!bookingId || !amount || !type) {
                    this._logger.warn('Create payment order failed - missing required fields', context);
                    const errorResponse = responseHelper_1.ResponseHelper.badRequest('Booking ID, amount and type are required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                const paymentData = {
                    bookingId,
                    userId,
                    amount,
                    currency: currency || 'INR',
                    type,
                    sparePartId,
                };
                const result = await this._paymentService.createPaymentOrder(paymentData);
                this._logger.info('Payment order created successfully', {
                    ...context,
                    orderId: result.data?.providerOrderId,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Create payment order controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to create payment order');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.verifyPayment = async (req, res) => {
            const userId = req.user?.id;
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
            const context = {
                operation: 'verifyPayment',
                userId,
                razorpayOrderId: razorpay_order_id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Verifying payment', context);
                if (!userId) {
                    this._logger.warn('Verify payment failed - authentication required', context);
                    const errorResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
                    this._logger.warn('Verify payment failed - missing payment data', context);
                    const errorResponse = responseHelper_1.ResponseHelper.badRequest('Payment verification data is required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                const result = await this._paymentService.verifyPayment(razorpay_payment_id, razorpay_order_id, razorpay_signature);
                this._logger.info('Payment verification completed', {
                    ...context,
                    status: result.data?.payment?.status,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Verify payment controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error('Failed to verify payment');
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.processWalletPayment = async (req, res) => {
            try {
                const { bookingId, amount } = req.body;
                const userId = req.user?.id;
                if (!userId) {
                    return res
                        .status(401)
                        .json(responseHelper_1.ResponseHelper.error('User authentication required'));
                }
                const result = await this._paymentService.processWalletPayment(userId, bookingId, amount);
                return res.status(result.success ? 200 : 400).json(result);
            }
            catch (error) {
                console.error('Wallet payment error:', error);
                return res
                    .status(500)
                    .json(responseHelper_1.ResponseHelper.error('Internal server error'));
            }
        };
        this.refundToWallet = async (req, res) => {
            try {
                const { bookingId, amount, reason } = req.body;
                const userId = req.user?.id;
                if (!userId) {
                    return res
                        .status(401)
                        .json(responseHelper_1.ResponseHelper.error('User authentication required'));
                }
                const result = await this._paymentService.refundToWallet(userId, bookingId, amount, reason);
                return res.status(result.success ? 200 : 400).json(result);
            }
            catch (error) {
                console.error('Wallet refund error:', error);
                return res
                    .status(500)
                    .json(responseHelper_1.ResponseHelper.error('Internal server error'));
            }
        };
        this.processSparePartsWalletPayment = async (req, res) => {
            const context = {
                operation: 'processSparePartsWalletPayment',
                userId: req.user?.id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Processing spare parts wallet payment', context);
                const { orderId, requestId, amount } = req.body;
                const userId = req.user?.id;
                if (!userId) {
                    this._logger.warn('User authentication required', context);
                    return res
                        .status(401)
                        .json(responseHelper_1.ResponseHelper.error('User authentication required'));
                }
                if (!orderId || !requestId || !amount) {
                    this._logger.warn('Missing required fields', {
                        ...context,
                        orderId,
                        requestId,
                        amount,
                    });
                    return res
                        .status(400)
                        .json(responseHelper_1.ResponseHelper.error('Order ID, request ID, and amount are required'));
                }
                const result = await this._paymentService.processSparePartsWalletPayment(userId, orderId, requestId, amount);
                this._logger.info('Spare parts wallet payment processed', {
                    ...context,
                    success: result.success,
                });
                return res.status(result.success ? 200 : 400).json(result);
            }
            catch (error) {
                this._logger.error('Spare parts wallet payment error', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                return res
                    .status(500)
                    .json(responseHelper_1.ResponseHelper.error('Internal server error'));
            }
        };
        this._paymentService = paymentService;
        this._logger = logger;
    }
}
exports.PaymentController = PaymentController;
