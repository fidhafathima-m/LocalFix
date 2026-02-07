"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toOrderStatsDto = exports.toOrderListResponseDto = exports.toOrderResponseDto = void 0;
const toOrderResponseDto = (order) => {
    return {
        _id: order._id?.toString() || '',
        orderCode: order.orderCode,
        userId: order.userId,
        technicianId: order.technicianId,
        serviceName: order.serviceName,
        problemDescription: order.problemDescription || '',
        scheduledAt: order.scheduledAt?.toString() || new Date().toISOString(),
        timeSlot: order.timeSlot,
        address: order.address,
        status: order.status,
        payment: {
            method: order.payment?.method,
            amount: order.payment?.amount || 0,
            status: order.payment?.status || 'pending',
            transactionId: order.payment?.transactionId || '',
            paidAt: order.payment?.paidAt
                ? new Date(order.payment.paidAt).toISOString()
                : undefined,
        },
        totalAmount: order.totalAmount,
        orderItems: (order.orderItems || []).map(item => ({
            _id: item._id?.toString() || '',
            customName: item.customName,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
            status: item.status,
        })),
        history: (order.history || []).map(history => ({
            status: history.status,
            description: history.description,
            updatedBy: history.updatedBy,
            timestamp: history.timestamp
                ? new Date(history.timestamp).toISOString()
                : new Date().toISOString(),
        })),
        createdAt: order.createdAt
            ? new Date(order.createdAt).toISOString()
            : new Date().toISOString(),
        updatedAt: order.updatedAt
            ? new Date(order.updatedAt).toISOString()
            : new Date().toISOString(),
    };
};
exports.toOrderResponseDto = toOrderResponseDto;
const toOrderListResponseDto = (orders, total, page, limit) => {
    return {
        orders: orders.map(order => (0, exports.toOrderResponseDto)(order)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
exports.toOrderListResponseDto = toOrderListResponseDto;
const toOrderStatsDto = (stats) => {
    return {
        totalOrders: stats.totalOrders || 0,
        pendingOrders: stats.pendingOrders || 0,
        confirmedOrders: stats.confirmedOrders || 0,
        inProgressOrders: stats.inProgressOrders || 0,
        completedOrders: stats.completedOrders || 0,
        cancelledOrders: stats.cancelledOrders || 0,
        totalRevenue: stats.totalRevenue || 0,
        monthlyRevenue: stats.monthlyRevenue || 0,
    };
};
exports.toOrderStatsDto = toOrderStatsDto;
