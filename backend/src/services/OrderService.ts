import { IOrderRepository } from "../interfaces/repository/user/IOrderRepository";
import { ResponseHelper, ApiResponse } from "../utils/responseHelper";
import { LoggerService } from "../services/LoggerService";
import {
  OrderListResponseDto,
  OrderResponseDto,
} from "@/interfaces/user/IOrder";
import { IOrderService } from "@/interfaces/services/user/IOrderService";
import { ITechnicianRepository } from "@/interfaces/repository/technician/ITechnicianRepository";

export class OrderService implements IOrderService {
  private logger: LoggerService;

  constructor(
    private orderRepository: IOrderRepository,
    private technicianRepository: ITechnicianRepository
  ) {
    this.logger = new LoggerService();
  }

  async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<OrderListResponseDto>> {
    const context = {
      operation: "getUserOrders",
      data: { userId, page, limit },
    };

    try {
      this.logger.info("Fetching user orders", context);

      const result = await this.orderRepository.findByUserId(
        userId,
        page,
        limit
      );

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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching user orders", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch orders");
    }
  }

  async getOrderById(
    userId: string,
    orderId: string
  ): Promise<ApiResponse<OrderResponseDto>> {
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

      this.logger.debug("Order user ID vs requesting user ID", {
        orderUserId: order.userId.toString(),
        requestingUserId: userId,
        match: order.userId.toString() === userId,
      });

      const realOrderId =
        order.userId?._id?.toString() || order.userId?.toString();

      // Check if user has access to this order
      if (realOrderId !== userId) {
        this.logger.warn("User not authorized to access this order", {
          ...context,
          orderUserId: order.userId.toString(),
          requestingUserId: userId,
        });
        return ResponseHelper.forbidden("Not authorized to access this order");
      }

      this.logger.info("Order retrieved successfully", context);

      const orderDto = this.mapToDto(order);
      return ResponseHelper.success("Order retrieved successfully", orderDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
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
      method: "online" | "cod";
      amount: number;
      status: "pending" | "paid" | "failed";
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

      const order = await this.orderRepository.createFromBooking(
        bookingId,
        paymentData
      );

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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error creating order from booking", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to create order");
    }
  }

  async cancelOrder(
    userId: string,
    orderId: string,
    reason: string
  ): Promise<ApiResponse<OrderResponseDto>> {
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

      const realOrderId =
        order.userId?._id?.toString() || order.userId?.toString();

      // Check if user owns the order
      if (realOrderId !== userId) {
        this.logger.warn("User not authorized to cancel this order", context);
        return ResponseHelper.forbidden("Not authorized to cancel this order");
      }

      // Check if order can be cancelled
      if (["cancelled", "completed", "refunded"].includes(order.status)) {
        this.logger.warn("Order cannot be cancelled in current status", {
          ...context,
          currentStatus: order.status,
        });
        return ResponseHelper.badRequest(
          `Order cannot be cancelled in ${order.status} status`
        );
      }

      const updatedOrder = await this.orderRepository.updateStatus(
        orderId,
        "cancelled",
        "user",
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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error cancelling order", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to cancel order");
    }
  }

  private mapToDto(order: any): OrderResponseDto {
    let userInfo: any = {};

    if (order.userId && typeof order.userId === "object") {
      // If userId is a populated object
      userInfo = {
        _id: order.userId._id?.toString() || order.userId.toString(),
        fullName: order.userId.fullName || order.userId.name || "Customer",
        email: order.userId.email || "",
        phone: order.userId.phone || "",
      };
    } else {
      userInfo = {
        _id: order.userId?.toString() || "",
        fullName: "Customer",
        email: "",
        phone: "",
      };
    }

    return {
      _id: order._id.toString(),
      orderCode: order.orderCode,
      bookingId: order.bookingId.toString(),
      userId: userInfo,
      technicianId: {
        _id:
          order.technicianId._id?.toString() || order.technicianId.toString(),
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

  async getTechnicianOrders(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<OrderListResponseDto>> {
    const context = {
      operation: "getTechnicianOrders",
      data: { userId, page, limit },
    };

    try {
      this.logger.info("Fetching technician orders for user", context);

      // Get the actual technician ID from user ID
      const technicianId = await this.getTechnicianIdByUserId(userId);

      if (!technicianId) {
        this.logger.warn("No technician profile found for user", { userId });
        // Return empty orders instead of error if no technician profile exists
        return ResponseHelper.success("No orders found", {
          orders: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        });
      }

      this.logger.debug("Resolved technician ID", {
        userId,
        technicianId,
      });

      const result = await this.orderRepository.findByTechnicianId(
        technicianId,
        page,
        limit
      );

      this.logger.info("Technician orders retrieved successfully", {
        ...context,
        technicianId,
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
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching technician orders", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch orders");
    }
  }

  async getTechnicianOrderById(
    technicianId: string,
    orderId: string
  ): Promise<ApiResponse<OrderResponseDto>> {
    const context = {
      operation: "getTechnicianOrderById",
      data: { technicianId, orderId },
    };

    try {
      this.logger.info("Fetching technician order by ID", context);

      const order = await this.orderRepository.findById(orderId);

      if (!order) {
        this.logger.warn("Order not found", context);
        return ResponseHelper.notFound("Order not found");
      }

      // Check if technician has access to this order
      const orderTechnicianId =
        order.technicianId?._id?.toString() || order.technicianId?.toString();

      if (orderTechnicianId !== technicianId) {
        this.logger.warn("Technician not authorized to access this order", {
          ...context,
          orderTechnicianId,
          requestingTechnicianId: technicianId,
        });
        return ResponseHelper.forbidden("Not authorized to access this order");
      }

      this.logger.info("Technician order retrieved successfully", context);

      const orderDto = this.mapToDto(order);
      return ResponseHelper.success("Order retrieved successfully", orderDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching technician order", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch order");
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    updatedBy: string,
    reason?: string
  ): Promise<ApiResponse<OrderResponseDto>> {
    const context = {
      operation: "updateOrderStatus",
      data: { orderId, status, updatedBy, reason },
    };

    try {
      this.logger.info("Updating order status", context);

      const updatedOrder = await this.orderRepository.updateStatus(
        orderId,
        status,
        updatedBy,
        reason
      );

      if (!updatedOrder) {
        this.logger.warn("Order not found for status update", context);
        return ResponseHelper.notFound("Order not found");
      }

      this.logger.info("Order status updated successfully", context);

      const orderDto = this.mapToDto(updatedOrder);
      return ResponseHelper.success(
        "Order status updated successfully",
        orderDto
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error updating order status", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to update order status");
    }
  }

  async getTechnicianOrderStats(technicianId: string): Promise<
    ApiResponse<{
      totalOrders: number;
      pendingOrders: number;
      inProgressOrders: number;
      completedOrders: number;
      monthlyEarnings: number;
    }>
  > {
    const context = {
      operation: "getTechnicianOrderStats",
      data: { technicianId },
    };

    try {
      this.logger.info("Fetching technician order stats", context);

      const stats = await this.orderRepository.getTechnicianStats(technicianId);

      this.logger.info(
        "Technician order stats retrieved successfully",
        context
      );

      return ResponseHelper.success(
        "Order stats retrieved successfully",
        stats
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching technician order stats", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch order stats");
    }
  }
// In your OrderService.ts file
private async checkTechnicianAvailability(
  technicianId: string,
  date: string,
  timeSlot: string,
  excludeOrderId?: string // Add this parameter
): Promise<boolean> {
  try {
    // Check if there are any conflicting orders for the same technician at the same time
    const conflictingOrders = await this.orderRepository.findConflictingOrders(
      technicianId,
      date,
      timeSlot,
      excludeOrderId // Pass the order ID to exclude
    );

    return conflictingOrders.length === 0;
  } catch (error) {
    this.logger.error("Error checking technician availability", {
      technicianId,
      date,
      timeSlot,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return false;
  }
}

async rescheduleOrder(
  userId: string,
  orderId: string,
  newDate: string,
  newTimeSlot: string
): Promise<ApiResponse<OrderResponseDto>> {
  const context = {
    operation: "rescheduleOrder",
    data: { userId, orderId, newDate, newTimeSlot },
  };

  try {
    this.logger.info("Rescheduling order", context);

    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      this.logger.warn("Order not found for rescheduling", context);
      return ResponseHelper.notFound("Order not found");
    }

    const realOrderId =
      order.userId?._id?.toString() || order.userId?.toString();

    // Check if user owns the order
    if (realOrderId !== userId) {
      this.logger.warn("User not authorized to reschedule this order", context);
      return ResponseHelper.forbidden("Not authorized to reschedule this order");
    }

    // Check if order can be rescheduled
    if (!this.canOrderBeRescheduled(order.status)) {
      this.logger.warn("Order cannot be rescheduled in current status", {
        ...context,
        currentStatus: order.status,
      });
      return ResponseHelper.badRequest(
        `Order cannot be rescheduled in ${order.status} status`
      );
    }

    // Validate new date is at least 4 hours in the future
    const scheduledAt = new Date(newDate);
    const now = new Date();
    const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);

    if (scheduledAt < fourHoursFromNow) {
      this.logger.warn("Reschedule date must be at least 4 hours in advance", {
        ...context,
        scheduledAt,
        fourHoursFromNow,
      });
      return ResponseHelper.badRequest(
        "New date must be at least 4 hours from now"
      );
    }

    // Check technician availability - FIX: Pass the orderId to exclude
    const isAvailable = await this.checkTechnicianAvailability(
      order.technicianId.toString(),
      newDate,
      newTimeSlot,
      orderId // Pass the current order ID to exclude it from conflict check
    );

    if (!isAvailable) {
      this.logger.warn("Technician not available for the selected slot", context);
      return ResponseHelper.badRequest(
        "Technician is not available for the selected date and time"
      );
    }

    // FIX: Pass "user" as the enum value, not the user ID
    const updatedOrder = await this.orderRepository.rescheduleOrder(
      orderId,
      newDate,
      newTimeSlot,
      "user" // Use enum value, not user ID
    );

    if (!updatedOrder) {
      this.logger.error("Failed to reschedule order in repository", context);
      return ResponseHelper.error("Failed to reschedule order");
    }

    this.logger.info("Order rescheduled successfully", {
      ...context,
      oldDate: order.scheduledAt,
      oldTimeSlot: order.timeSlot,
    });

    const orderDto = this.mapToDto(updatedOrder);
    return ResponseHelper.success("Order rescheduled successfully", orderDto);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    this.logger.error("Error rescheduling order", {
      ...context,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return ResponseHelper.error("Failed to reschedule order");
  }
}

private canOrderBeRescheduled(status: string): boolean {
  const reschedulableStatuses = ["pending", "confirmed", "accepted"];
  return reschedulableStatuses.includes(status);
}


  private async getTechnicianIdByUserId(
    userId: string
  ): Promise<string | null> {
    try {
      this.logger.debug("Looking up technician ID for user", { userId });

      const technician = await this.technicianRepository.findByUserId(userId);

      if (!technician) {
        this.logger.warn("No technician found for user", { userId });
        return null;
      }

      this.logger.debug("Found technician profile", {
        userId,
        technicianId: technician._id.toString(),
      });

      return technician._id.toString();
    } catch (error) {
      this.logger.error("Error finding technician by user ID", {
        userId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return null;
    }
  }
}
