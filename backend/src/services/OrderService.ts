// services/user/orderService.ts
import { IOrderRepository } from "../interfaces/repository/user/IOrderRepository";
import { ResponseHelper, ApiResponse } from "../utils/responseHelper";
import { LoggerService } from "../services/LoggerService";
import { OrderListResponseDto, OrderResponseDto } from "@/interfaces/user/IOrder";
import { IOrderService } from "@/interfaces/services/user/IOrderService";


export class OrderService implements IOrderService {
  private logger: LoggerService;

  constructor(private orderRepository: IOrderRepository) {
    this.logger = new LoggerService();
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 10): Promise<ApiResponse<OrderListResponseDto>> {
    const context = {
      operation: "getUserOrders",
      data: { userId, page, limit },
    };

    try {
      this.logger.info("Fetching user orders", context);

      const result = await this.orderRepository.findByUserId(userId, page, limit);

      this.logger.info("User orders retrieved successfully", {
        ...context,
        orderCount: result.orders.length,
        total: result.total,
      });

      const orderDtos = result.orders.map((order: any) => this.mapToDto(order));
      
      return ResponseHelper.success("Orders retrieved successfully", {
        orders: orderDtos,
        pagination: {
          page,
          limit,
          total: result.total,
          pages: Math.ceil(result.total / limit),
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching user orders", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch orders");
    }
  }

  // In your OrderService - getOrderById method, add debugging
async getOrderById(userId: string, orderId: string): Promise<ApiResponse<OrderResponseDto>> {
  const context = {
    operation: "getOrderById",
    data: { userId, orderId },
  };

  try {
    this.logger.info("Fetching order by ID", context);

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      this.logger.warn("Order not found", context);
      return ResponseHelper.notFound("Order not found");
    }

    // Add debug logging to see the actual user ID in the order
    this.logger.debug("Order user ID vs requesting user ID", {
      orderUserId: order.userId.toString(),
      requestingUserId: userId,
      match: order.userId.toString() === userId
    });

    const realOrderId = order.userId?._id?.toString() || order.userId?.toString();

    // Check if user has access to this order
    if (realOrderId !== userId) {
      this.logger.warn("User not authorized to access this order", {
        ...context,
        orderUserId: order.userId.toString(),
        requestingUserId: userId
      });
      return ResponseHelper.forbidden("Not authorized to access this order");
    }

    this.logger.info("Order retrieved successfully", context);

    const orderDto = this.mapToDto(order);
    return ResponseHelper.success("Order retrieved successfully", orderDto);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    this.logger.error("Error fetching order", {
      ...context,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return ResponseHelper.error("Failed to fetch order");
  }
}

  async createOrderFromBooking(
    bookingId: string, 
    paymentData: {
      method: 'online' | 'cod';
      amount: number;
      status: 'pending' | 'paid' | 'failed';
      transactionId?: string;
      paidAt?: Date;
    }
  ): Promise<ApiResponse<OrderResponseDto>> {
    const context = {
      operation: "createOrderFromBooking",
      data: { bookingId, ...paymentData },
    };

    try {
      this.logger.info("Creating order from booking", context);

      const order = await this.orderRepository.createFromBooking(bookingId, paymentData);

      if (!order) {
        this.logger.error("Failed to create order from booking", context);
        return ResponseHelper.error("Failed to create order");
      }

      this.logger.info("Order created successfully", {
        ...context,
        orderId: order._id.toString(),
        orderCode: order.orderCode,
      });

      const orderDto = this.mapToDto(order);
      return ResponseHelper.created("Order created successfully", orderDto);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error creating order from booking", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to create order");
    }
  }

  async cancelOrder(userId: string, orderId: string, reason: string): Promise<ApiResponse<OrderResponseDto>> {
    const context = {
      operation: "cancelOrder",
      data: { userId, orderId, reason },
    };

    try {
      this.logger.info("Cancelling order", context);

      const order = await this.orderRepository.findById(orderId);

      if (!order) {
        this.logger.warn("Order not found for cancellation", context);
        return ResponseHelper.notFound("Order not found");
      }

    const realOrderId = order.userId?._id?.toString() || order.userId?.toString();


      // Check if user owns the order
      if (realOrderId !== userId) {
        this.logger.warn("User not authorized to cancel this order", context);
        return ResponseHelper.forbidden("Not authorized to cancel this order");
      }

      // Check if order can be cancelled
      if (['cancelled', 'completed', 'refunded'].includes(order.status)) {
        this.logger.warn("Order cannot be cancelled in current status", {
          ...context,
          currentStatus: order.status,
        });
        return ResponseHelper.badRequest(`Order cannot be cancelled in ${order.status} status`);
      }

      const updatedOrder = await this.orderRepository.updateStatus(
        orderId,
        'cancelled',
        'user',
        reason
      );

      if (!updatedOrder) {
        this.logger.error("Failed to cancel order", context);
        return ResponseHelper.error("Failed to cancel order");
      }

      this.logger.info("Order cancelled successfully", context);

      const orderDto = this.mapToDto(updatedOrder);
      return ResponseHelper.success("Order cancelled successfully", orderDto);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error cancelling order", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to cancel order");
    }
  }

  private mapToDto(order: any): OrderResponseDto {
    return {
      _id: order._id.toString(),
      orderCode: order.orderCode,
      bookingId: order.bookingId.toString(),
      userId: order.userId.toString(),
      technicianId: {
        _id: order.technicianId._id?.toString() || order.technicianId.toString(),
        displayName: order.technicianId.displayName,
        profilePictureUrl: order.technicianId.profilePictureUrl,
        averageRating: order.technicianId.averageRating,
        ratingCount: order.technicianId.ratingCount,
        skills: order.technicianId.skills || order.technicianId.services || [],
      },
      serviceName: order.serviceName,
      problemDescription: order.problemDescription,
      scheduledAt: order.scheduledAt.toISOString(),
      timeSlot: order.timeSlot,
      address: order.address,
      status: order.status,
      payment: {
        method: order.payment.method,
        amount: order.payment.amount,
        status: order.payment.status,
        transactionId: order.payment.transactionId,
        paidAt: order.payment.paidAt?.toISOString(),
      },
      orderItems: order.orderItems.map((item: any) => ({
        _id: item._id.toString(),
        customName: item.customName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
        status: item.status,
      })),
      totalAmount: order.totalAmount,
      technicianRating: order.technicianRating,
      userReview: order.userReview,
      history: order.history.map((h: any) => ({
        status: h.status,
        description: h.description,
        updatedBy: h.updatedBy,
        timestamp: h.timestamp.toISOString(),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
  
}