import { IPayment } from "../models/PaymentSchema";
import { IPaymentRepository } from "../interfaces/repository/user/IPaymentRepository";
import {
  razorpay,
  RazorpayOrderResponse,
  RazorpayPaymentResponse,
} from "../config/razorpay";
import { ResponseHelper, ApiResponse } from "../utils/responseHelper";
import { LoggerService } from "../services/LoggerService";
import { Types } from "mongoose";
import {
  CreatePaymentRequest,
  PaymentResponseDto,
} from "@/interfaces/user/IPayment";
import { ILogger } from "@/interfaces/utils/ILogger";

export class PaymentService {
  private logger: ILogger;

  constructor(private paymentRepository: IPaymentRepository, logger: ILogger) {
    this.logger = logger;
  }

  async createPaymentOrder(
    paymentData: CreatePaymentRequest
  ): Promise<ApiResponse<PaymentResponseDto>> {
    const context = {
      operation: "createPaymentOrder",
      data: paymentData,
    };

    try {
      this.logger.info("Creating payment order", context);

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: paymentData.amount * 100, // Convert to paise
        currency: paymentData.currency || "INR",
        receipt: `booking_${paymentData.bookingId}`,
        notes: {
          bookingId: paymentData.bookingId,
          userId: paymentData.userId,
          type: paymentData.type,
        },
      });

      this.logger.debug("Razorpay order created", {
        ...context,
        razorpayOrderId: razorpayOrder.id,
      });

      // Create payment record with proper typing
      const paymentModel: Partial<IPayment> = {
        bookingId: new Types.ObjectId(paymentData.bookingId),
        userId: new Types.ObjectId(paymentData.userId),
        paymentProvider: "razorpay" as const,
        providerOrderId: razorpayOrder.id,
        amount: paymentData.amount,
        currency: paymentData.currency || "INR",
        type: paymentData.type,
        sparePartId: paymentData.sparePartId
          ? new Types.ObjectId(paymentData.sparePartId)
          : undefined,
        status: "initiated" as const,
        rawResponse: razorpayOrder,
      };

      const newPayment = await this.paymentRepository.create(paymentModel);

      if (!newPayment) {
        this.logger.error("Failed to create payment record", context);
        return ResponseHelper.error("Failed to create payment record");
      }

      this.logger.info("Payment order created successfully", {
        ...context,
        paymentId: newPayment._id?.toString(),
      });

      const paymentDto = this.mapToDto(newPayment, razorpayOrder);
      return ResponseHelper.success(
        "Payment order created successfully",
        paymentDto
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error creating payment order", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to create payment order");
    }
  }

  async verifyPayment(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): Promise<ApiResponse<any>> {
    const context = {
      operation: "verifyPayment",
      data: { razorpayPaymentId, razorpayOrderId },
    };

    try {
      this.logger.info("Verifying payment", context);

      // Find payment record
      const payment = await this.paymentRepository.findByOrderId(
        razorpayOrderId
      );

      if (!payment) {
        this.logger.warn("Payment record not found", context);
        return ResponseHelper.notFound("Payment record not found");
      }

      // Verify signature
      const crypto = require("crypto");
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
        .update(razorpayOrderId + "|" + razorpayPaymentId)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        this.logger.warn("Invalid payment signature", context);
        return ResponseHelper.badRequest("Invalid payment signature");
      }

      // Fetch payment details from Razorpay
      const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);

      // Update payment record
      const updatedPayment = await this.paymentRepository.update(
        payment.id.toString(),
        {
          providerPaymentId: razorpayPaymentId,
          status: razorpayPayment.status === "captured" ? "success" : "failed",
          confirmedAt: new Date(),
          rawResponse: razorpayPayment,
        }
      );

      if (!updatedPayment) {
        this.logger.error("Failed to update payment record", context);
        return ResponseHelper.error("Failed to update payment record");
      }

      this.logger.info("Payment verified successfully", {
        ...context,
        status: updatedPayment.status,
      });

      return ResponseHelper.success("Payment verified successfully", {
        payment: this.mapToDto(updatedPayment),
        bookingId: payment.bookingId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error verifying payment", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to verify payment");
    }
  }

  private mapToDto(payment: IPayment, razorpayOrder?: any): PaymentResponseDto {
    return {
      _id: payment.id.toString(),
      bookingId: payment.bookingId.toString(),
      userId: payment.userId.toString(),
      paymentProvider: payment.paymentProvider,
      providerOrderId: payment.providerOrderId,
      amount: payment.amount,
      currency: payment.currency,
      type: payment.type,
      status: payment.status,
      razorpayOrder: razorpayOrder
        ? {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID!,
          }
        : undefined!,
    };
  }
}
