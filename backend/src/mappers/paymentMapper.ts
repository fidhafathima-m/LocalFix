import { AddressData, IPayment } from "../interfaces/admin/IPaymentManagement";
import {
  PaymentResponseDto,
  PaymentListResponseDto,
  PaymentStatsDto,
} from "../interfaces/dtos/paymentDtos";
import { Types } from "mongoose";

export class PaymentMapper {
  toPaymentResponseDto(payment: IPayment): PaymentResponseDto {
    // Handle populated user data
    let userName = "Unknown User";
    let userEmail = "Unknown Email";

    if (
      payment.userId &&
      typeof payment.userId === "object" &&
      !(payment.userId instanceof Types.ObjectId)
    ) {
      const user = payment.userId as any;
      userName = user.fullName || user.name || "Unknown User";
      userEmail = user.email || "Unknown Email";
    } else if (payment.userId) {
      const userId =
        payment.userId instanceof Types.ObjectId
          ? payment.userId.toString()
          : String(payment.userId);
      userName = `User ID: ${userId}`;
      userEmail = "Email not available";
    }

    // Handle populated booking data
    let serviceName = "Unknown Service";
    let bookingCode = "Unknown Booking";
    let addressData: AddressData | null = null;

    if (
      payment.bookingId &&
      typeof payment.bookingId === "object" &&
      !(payment.bookingId instanceof Types.ObjectId)
    ) {
      const booking = payment.bookingId as any;
      serviceName = booking.serviceName || booking.service || "Unknown Service";
      bookingCode = booking.bookingCode || "Unknown Booking";

      // Extract address data if populated
      if (
        booking.addressId &&
        typeof booking.addressId === "object" &&
        !(booking.addressId instanceof Types.ObjectId)
      ) {
        const address = booking.addressId as any;
        addressData = {
          label: address.label || "Home",
          street: address.street || "",
          city: address.city || "",
          state: address.state || "",
          pincode: address.pincode || "",
          landmark: address.landmark || "",
        };
      }
    } else if (payment.bookingId) {
      const bookingId =
        payment.bookingId instanceof Types.ObjectId
          ? payment.bookingId.toString()
          : String(payment.bookingId);
      bookingCode = `Booking ID: ${bookingId}`;
      serviceName = "Service not available";
    }

    // Use orderCode from payment if available, otherwise fallback
    const orderId = payment.orderCode || "Order not found";

    const result = {
      id: payment._id ? payment._id.toString() : "unknown-id",
      bookingId: payment.bookingId
        ? payment.bookingId instanceof Types.ObjectId
          ? payment.bookingId.toString()
          : String(payment.bookingId)
        : "unknown-booking",
      userId: payment.userId
        ? payment.userId instanceof Types.ObjectId
          ? payment.userId.toString()
          : String(payment.userId)
        : "unknown-user",
      userName,
      userEmail,
      paymentProvider: payment.paymentProvider,
      providerOrderId: payment.providerOrderId,
      providerPaymentId: payment.providerPaymentId,
      amount: payment.amount,
      currency: payment.currency,
      type: payment.type,
      serviceName,
      orderId,
      bookingCode, // Add booking code separately
      status: payment.status,
      initiatedAt: payment.initiatedAt
        ? payment.initiatedAt.toISOString()
        : new Date().toISOString(),
      confirmedAt: payment.confirmedAt?.toISOString(),
      refundedAt: payment.refundedAt?.toISOString(),
      createdAt: payment.createdAt
        ? payment.createdAt.toISOString()
        : new Date().toISOString(),
      updatedAt: payment.updatedAt
        ? payment.updatedAt.toISOString()
        : new Date().toISOString(),
    };

    // Only add address if we have data
    if (addressData) {
      return {
        ...result,
        address: addressData,
      };
    }

    return result;
  }

  toPaymentResponseDtoFromAggregation(payment: any): PaymentResponseDto {
    // For aggregation results, the fields are already flattened
    return {
      id: payment._id ? payment._id.toString() : payment.id || "unknown-id",
      bookingId: payment.bookingId
        ? payment.bookingId.toString()
        : "unknown-booking",
      userId: payment.userId
        ? payment.userId.toString()
        : "unknown-user",
      userName: payment.userName || "Unknown User",
      userEmail: payment.userEmail || "Unknown Email",
      paymentProvider: payment.paymentProvider,
      providerOrderId: payment.providerOrderId,
      providerPaymentId: payment.providerPaymentId,
      amount: payment.amount,
      currency: payment.currency,
      type: payment.type,
      serviceName: payment.serviceName || "Unknown Service",
      orderId: payment.orderId || "Order not found",
      bookingCode: payment.bookingCode || "Unknown Booking",
      status: payment.status,
      initiatedAt: payment.initiatedAt
        ? new Date(payment.initiatedAt).toISOString()
        : new Date().toISOString(),
      confirmedAt: payment.confirmedAt
        ? new Date(payment.confirmedAt).toISOString()
        : undefined,
      refundedAt: payment.refundedAt
        ? new Date(payment.refundedAt).toISOString()
        : undefined,
      createdAt: payment.createdAt
        ? new Date(payment.createdAt).toISOString()
        : new Date().toISOString(),
      updatedAt: payment.updatedAt
        ? new Date(payment.updatedAt).toISOString()
        : new Date().toISOString(),
      address: payment.address || {
        label: "",
        street: "",
        city: "",
        state: "",
        pincode: "",
        landmark: "",
      },
    };
  }

  toPaymentListResponseDto(
    payments: IPayment[],
    total: number,
    page: number,
    limit: number
  ): PaymentListResponseDto {
    return {
      payments: payments.map((payment) => {
        // Check if this is an aggregation result (has flattened fields)
        if (payment.userName || payment.userEmail || payment.serviceName) {
          return this.toPaymentResponseDtoFromAggregation(payment);
        } else {
          return this.toPaymentResponseDto(payment);
        }
      }),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  toPaymentStatsDto(stats: {
    totalRevenue: number;
    platformCommission: number;
    pendingPayments: number;
    failedPayments: number;
    totalPayments: number;
  }): PaymentStatsDto {
    const successRate =
      stats.totalPayments > 0
        ? ((stats.totalPayments -
            stats.failedPayments -
            stats.pendingPayments) /
            stats.totalPayments) *
          100
        : 0;

    return {
      ...stats,
      successRate: Math.round(successRate * 100) / 100,
    };
  }
}
