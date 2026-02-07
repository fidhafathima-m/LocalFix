"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPaymentService = void 0;
class SubscriptionPaymentService {
    constructor(logger) {
        this._logger = logger;
    }
    // Helper method to generate shorter receipt IDs
    generateReceiptId(subscriptionId) {
        // Use shorter format: sub_<short_sub_id>_<timestamp>
        const shortSubId = subscriptionId.substring(0, 8); // Use first 8 chars of subscription ID
        const timestamp = Date.now().toString().slice(-6); // Use last 6 digits of timestamp
        const receipt = `sub_${shortSubId}_${timestamp}`;
        // Validate length
        if (receipt.length > 40) {
            // Fallback: use even shorter format
            return `sub_${timestamp}_${Math.random().toString(36).substr(2, 6)}`;
        }
        return receipt;
    }
    async createRazorpayOrder(orderData) {
        const context = {
            operation: 'createRazorpayOrder',
            data: orderData,
        };
        try {
            this._logger.info('Creating Razorpay order for subscription', context);
            // Validate required environment variables
            if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
                throw new Error('Razorpay credentials are not configured');
            }
            // Validate order data
            if (!orderData.amount || orderData.amount <= 0) {
                throw new Error('Invalid amount: Amount must be greater than 0');
            }
            if (!orderData.currency) {
                throw new Error('Currency is required');
            }
            let receipt = orderData.receipt;
            if (!receipt || receipt.length > 40) {
                const subscriptionId = orderData.notes?.subscriptionId || 'unknown';
                receipt = this.generateReceiptId(subscriptionId);
                this._logger.debug('Generated shorter receipt ID', {
                    original: orderData.receipt,
                    generated: receipt,
                });
            }
            // Make API call to Razorpay
            const response = await fetch('https://api.razorpay.com/v1/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
                },
                body: JSON.stringify({
                    amount: orderData.amount,
                    currency: orderData.currency,
                    receipt: receipt, // Use the validated/generated receipt
                    notes: orderData.notes,
                    payment_capture: 1, // Auto-capture payment
                }),
            });
            // Get the response text for detailed error information
            const responseText = await response.text();
            if (!response.ok) {
                this._logger.error('Razorpay API error details', {
                    status: response.status,
                    statusText: response.statusText,
                    responseBody: responseText,
                    requestPayload: {
                        amount: orderData.amount,
                        currency: orderData.currency,
                        receipt: receipt,
                    },
                });
                throw new Error(`Razorpay API error: ${response.status} ${response.statusText} - ${responseText}`);
            }
            const razorpayOrder = JSON.parse(responseText);
            this._logger.info('Razorpay order created successfully', {
                ...context,
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                receipt: receipt,
            });
            return razorpayOrder;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Create Razorpay order failed', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            throw error;
        }
    }
    async verifyPayment(razorpayPaymentId, razorpayOrderId, razorpaySignature) {
        const context = {
            operation: 'verifyPayment',
            data: { razorpayPaymentId, razorpayOrderId },
        };
        try {
            this._logger.info('Verifying Razorpay payment', context);
            const crypto = await Promise.resolve().then(() => __importStar(require('crypto')));
            // Verify signature
            const body = razorpayOrderId + '|' + razorpayPaymentId;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest('hex');
            const isValid = expectedSignature === razorpaySignature;
            this._logger.info('Payment verification completed', {
                ...context,
                isValid,
            });
            return {
                isValid,
                paymentId: razorpayPaymentId,
                orderId: razorpayOrderId,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Payment verification failed', {
                ...context,
                error: errorMessage,
            });
            throw error;
        }
    }
}
exports.SubscriptionPaymentService = SubscriptionPaymentService;
