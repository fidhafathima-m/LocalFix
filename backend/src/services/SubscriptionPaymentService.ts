import { RazorpayOrderResponse } from '../config/razorpay';
import {
  ISubscriptionPaymentService,
  PaymentVerificationResult,
  RazorpayOrderRequest,
} from '../interfaces/services/technician/ISubscriptionPaymentService';
import { IPaymentService } from '../interfaces/services/user/IPaymentService';
import { ILogger } from '../interfaces/utils/ILogger';
import { LoggerService } from '../services/LoggerService';

export class SubscriptionPaymentService implements ISubscriptionPaymentService {
  private _logger: ILogger;

  constructor(logger: ILogger) {
    this._logger = logger;
  }

  // Helper method to generate shorter receipt IDs
  private generateReceiptId(subscriptionId: string): string {
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

  async createRazorpayOrder(
    orderData: RazorpayOrderRequest
  ): Promise<RazorpayOrderResponse> {
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
        throw new Error(
          `Razorpay API error: ${response.status} ${response.statusText} - ${responseText}`
        );
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Create Razorpay order failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async verifyPayment(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): Promise<PaymentVerificationResult> {
    const context = {
      operation: 'verifyPayment',
      data: { razorpayPaymentId, razorpayOrderId },
    };

    try {
      this._logger.info('Verifying Razorpay payment', context);

      const crypto = await import('crypto');

      // Verify signature
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Payment verification failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }
}
