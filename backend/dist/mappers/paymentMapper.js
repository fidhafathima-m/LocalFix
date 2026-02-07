"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toPaymentStatsDto = exports.toPaymentListResponseDto = exports.toPaymentResponseDtoFromAggregation = exports.toPaymentResponseDto = void 0;
const mongoose_1 = require("mongoose");
const toPaymentResponseDto = (payment) => {
    // Handle populated user data
    let userName = 'Unknown User';
    let userEmail = 'Unknown Email';
    if (payment.userId &&
        typeof payment.userId === 'object' &&
        !(payment.userId instanceof mongoose_1.Types.ObjectId)) {
        const user = payment.userId;
        userName = user.fullName || user.name || 'Unknown User';
        userEmail = user.email || 'Unknown Email';
    }
    else if (payment.userId) {
        const userId = payment.userId instanceof mongoose_1.Types.ObjectId
            ? payment.userId.toString()
            : String(payment.userId);
        userName = `User ID: ${userId}`;
        userEmail = 'Email not available';
    }
    // Handle populated booking data
    let serviceName = 'Unknown Service';
    let bookingCode = 'Unknown Booking';
    let addressData = null;
    if (payment.bookingId &&
        typeof payment.bookingId === 'object' &&
        !(payment.bookingId instanceof mongoose_1.Types.ObjectId)) {
        const booking = payment.bookingId;
        serviceName = booking.serviceName || booking.service || 'Unknown Service';
        bookingCode = booking.bookingCode || 'Unknown Booking';
        // Extract address data if populated
        if (booking.addressId &&
            typeof booking.addressId === 'object' &&
            !(booking.addressId instanceof mongoose_1.Types.ObjectId)) {
            const address = booking.addressId;
            addressData = {
                label: address.label || 'Home',
                street: address.street || '',
                city: address.city || '',
                state: address.state || '',
                pincode: address.pincode || '',
                landmark: address.landmark || '',
            };
        }
    }
    else if (payment.bookingId) {
        const bookingId = payment.bookingId instanceof mongoose_1.Types.ObjectId
            ? payment.bookingId.toString()
            : String(payment.bookingId);
        bookingCode = `Booking ID: ${bookingId}`;
        serviceName = 'Service not available';
    }
    const orderId = payment.orderCode || 'Order not found';
    const result = {
        id: payment._id ? payment._id.toString() : 'unknown-id',
        bookingId: payment.bookingId
            ? payment.bookingId instanceof mongoose_1.Types.ObjectId
                ? payment.bookingId.toString()
                : String(payment.bookingId)
            : 'unknown-booking',
        userId: payment.userId
            ? payment.userId instanceof mongoose_1.Types.ObjectId
                ? payment.userId.toString()
                : String(payment.userId)
            : 'unknown-user',
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
        bookingCode,
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
        refundReason: payment.refundReason || '',
        refundAmount: payment.refundAmount || 0,
        metadata: payment.metadata || {},
    };
    if (addressData) {
        return {
            ...result,
            address: addressData,
        };
    }
    return result;
};
exports.toPaymentResponseDto = toPaymentResponseDto;
const toPaymentResponseDtoFromAggregation = (payment) => {
    return {
        id: payment._id ? payment._id.toString() : payment.id || 'unknown-id',
        bookingId: payment.bookingId
            ? payment.bookingId.toString()
            : 'unknown-booking',
        userId: payment.userId ? payment.userId.toString() : 'unknown-user',
        userName: payment.userName || 'Unknown User',
        userEmail: payment.userEmail || 'Unknown Email',
        paymentProvider: payment.paymentProvider,
        providerOrderId: payment.providerOrderId,
        providerPaymentId: payment.providerPaymentId,
        amount: payment.amount,
        currency: payment.currency,
        type: payment.type,
        serviceName: payment.serviceName || 'Unknown Service',
        orderId: payment.orderId || 'Order not found',
        bookingCode: payment.bookingCode || 'Unknown Booking',
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
            label: '',
            street: '',
            city: '',
            state: '',
            pincode: '',
            landmark: '',
        },
        refundReason: payment.refundReason || '',
        refundAmount: payment.refundAmount || 0,
        metadata: payment.metadata || {},
    };
};
exports.toPaymentResponseDtoFromAggregation = toPaymentResponseDtoFromAggregation;
const toPaymentListResponseDto = (payments, total, page, limit) => {
    return {
        payments: payments.map(payment => {
            if (payment.userName || payment.userEmail || payment.serviceName) {
                return (0, exports.toPaymentResponseDtoFromAggregation)(payment);
            }
            else {
                return (0, exports.toPaymentResponseDto)(payment);
            }
        }),
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
};
exports.toPaymentListResponseDto = toPaymentListResponseDto;
const toPaymentStatsDto = (stats) => {
    const successRate = stats.totalPayments > 0
        ? ((stats.totalPayments - stats.failedPayments - stats.pendingPayments) /
            stats.totalPayments) *
            100
        : 0;
    return {
        ...stats,
        successRate: Math.round(successRate * 100) / 100,
    };
};
exports.toPaymentStatsDto = toPaymentStatsDto;
