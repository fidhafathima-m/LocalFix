import {
  OrderListResponseDto,
  OrderResponseDto,
} from "@/interfaces/user/IOrder";
import { ApiResponse } from "@/utils/responseHelper";

export interface IOrderService {
  getUserOrders(
    userId: string,
    page: number,
    limit: number
  ): Promise<ApiResponse<OrderListResponseDto>>;
  getOrderById(
    userId: string,
    orderId: string
  ): Promise<ApiResponse<OrderResponseDto>>;
  createOrderFromBooking(
    bookingId: string,
    paymentData: {
      method: "online" | "cod";
      amount: number;
      status: "pending" | "paid" | "failed";
      transactionId?: string;
      paidAt?: Date;
    }
  ): Promise<ApiResponse<OrderResponseDto>>;
  cancelOrder(
    userId: string,
    orderId: string,
    reason: string
  ): Promise<ApiResponse<OrderResponseDto>>;
  createOrderFromBooking(
    bookingId: string,
    paymentData: {
      method: "online" | "cod";
      amount: number;
      status: "pending" | "paid" | "failed";
      transactionId?: string;
      paidAt?: Date;
    }
  ): Promise<ApiResponse<OrderResponseDto>>;
  getTechnicianOrders(
    technicianId: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<OrderListResponseDto>>;
  getTechnicianOrderById(
    technicianId: string,
    orderId: string
  ): Promise<ApiResponse<OrderResponseDto>>;
  updateOrderStatus(
    orderId: string,
    status: string,
    updatedBy: string,
    reason?: string
  ): Promise<ApiResponse<OrderResponseDto>>;
  getTechnicianOrderStats(technicianId: string): Promise<
    ApiResponse<{
      totalOrders: number;
      pendingOrders: number;
      inProgressOrders: number;
      completedOrders: number;
      monthlyEarnings: number;
    }>
  >;
  rescheduleOrder(
  userId: string,
  orderId: string,
  newDate: string,
  newTimeSlot: string
): Promise<ApiResponse<OrderResponseDto>>
}
