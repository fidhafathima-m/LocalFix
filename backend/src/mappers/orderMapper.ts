import { IOrder } from "./../interfaces/user/IOrder";
import {
  OrderResponseDto,
  OrderListResponseDto,
  OrderStatsDto,
} from "../interfaces/dtos/orderDtos";

export const toOrderResponseDto = (order: IOrder): OrderResponseDto => {
  return {
    _id: order._id?.toString() || "",
    orderCode: order.orderCode,
    userId: order.userId as any,
    technicianId: order.technicianId as any,
    serviceName: order.serviceName,
    problemDescription: order.problemDescription || "",
    scheduledAt: order.scheduledAt?.toString() || new Date().toISOString(),
    timeSlot: order.timeSlot,
    address: order.address,
    status: order.status,
    payment: {
      method: order.payment?.method || "",
      amount: order.payment?.amount || 0,
      status: order.payment?.status || "pending",
      transactionId: order.payment?.transactionId || "",
      paidAt: order.payment?.paidAt
        ? new Date(order.payment.paidAt).toISOString()
        : undefined,
    },
    totalAmount: order.totalAmount,
    orderItems: (order.orderItems || []).map((item) => ({
      _id: item._id?.toString() || "",
      customName: item.customName,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
      status: item.status,
    })),
    history: (order.history || []).map((history) => ({
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

export const toOrderListResponseDto = (
  orders: IOrder[],
  total: number,
  page: number,
  limit: number
): OrderListResponseDto => {
  return {
    orders: orders.map((order) => toOrderResponseDto(order)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const toOrderStatsDto = (stats: any): OrderStatsDto => {
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
