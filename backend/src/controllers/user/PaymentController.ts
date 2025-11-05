import { Response } from "express";
import { ResponseHelper } from "../../utils/responseHelper";
import { AuthRequest } from "../../middleware/authMiddleware";
import { LoggerService } from "../../services/LoggerService";
import { IPaymentService } from "../../interfaces/services/user/IPaymentService";

export class PaymentController {
  private paymentService: IPaymentService;
  private logger: LoggerService;

  constructor(paymentService: IPaymentService) {
    this.paymentService = paymentService;
    this.logger = new LoggerService();
  }

  createPaymentOrder = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const { bookingId, amount, currency, type, sparePartId } = req.body;

    const context = {
      operation: "createPaymentOrder",
      userId,
      bookingId,
      amount,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Creating payment order", context);

      if (!userId) {
        this.logger.warn(
          "Create payment order failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (!bookingId || !amount || !type) {
        this.logger.warn(
          "Create payment order failed - missing required fields",
          context
        );
        const errorResponse = ResponseHelper.badRequest(
          "Booking ID, amount and type are required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const paymentData = {
        bookingId,
        userId,
        amount,
        currency: currency || "INR",
        type,
        sparePartId,
      };

      const result = await this.paymentService.createPaymentOrder(paymentData);

      this.logger.info("Payment order created successfully", {
        ...context,
        orderId: result.data?.providerOrderId,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Create payment order controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(
        "Failed to create payment order"
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  verifyPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
      req.body;

    const context = {
      operation: "verifyPayment",
      userId,
      razorpayOrderId: razorpay_order_id,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Verifying payment", context);

      if (!userId) {
        this.logger.warn(
          "Verify payment failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        this.logger.warn(
          "Verify payment failed - missing payment data",
          context
        );
        const errorResponse = ResponseHelper.badRequest(
          "Payment verification data is required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this.paymentService.verifyPayment(
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      );

      this.logger.info("Payment verification completed", {
        ...context,
        status: result.data?.payment?.status,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Verify payment controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error("Failed to verify payment");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
