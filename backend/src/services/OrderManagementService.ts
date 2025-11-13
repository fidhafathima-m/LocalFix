import { IOrderService } from "../interfaces/services/admin/IOrderManagementService";
import { IOrderRepository } from "../interfaces/repository/admin/IOrderRepository";
import {
  OrderResponseDto,
  OrderListResponseDto,
  OrderStatsDto,
  UpdateOrderStatusDto,
} from "../interfaces/dtos/orderDtos";
import { OrderMapper } from "../mappers/orderMapper";
import { ORDER_MESSAGES } from "../constants";
import { Types } from "mongoose";
import { LoggerService } from "../services/LoggerService";
import { ILogger } from "@/interfaces/utils/ILogger";
export class OrderManagementService implements IOrderService {
  private orderRepository: IOrderRepository;
  private orderMapper: OrderMapper;
  private logger: ILogger;

  constructor(orderRepository: IOrderRepository, logger: ILogger) {
    this.orderRepository = orderRepository;
    this.orderMapper = new OrderMapper();
    this.logger = logger;
  }

  async getOrders(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ): Promise<OrderListResponseDto> {
    const context = {
      operation: "getOrders",
      page,
      limit,
      search,
      status,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching orders", context);

      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};
      if (status && status !== "all") {
        filter.status = status;
      }

      let orders: any[];
      let total: number;

      if (search) {
        this.logger.debug("Searching orders with query", {
          ...context,
          searchQuery: search,
        });
        orders = await this.orderRepository.search(search, limit);
        total = orders.length;
      } else {
        this.logger.debug("Fetching orders with filter", {
          ...context,
          filter,
        });
        orders = await this.orderRepository.findAll(filter, skip, limit);
        total = await this.orderRepository.count(filter);
      }

      this.logger.info("Orders retrieved successfully", {
        ...context,
        ordersCount: orders.length,
        totalOrders: total,
      });

      return this.orderMapper.toOrderListResponseDto(
        orders,
        total,
        page,
        limit
      );
    } catch (error: any) {
      this.logger.error("Get orders error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(ORDER_MESSAGES.FAILED_FETCH_ORDERS);
    }
  }

  async getOrderById(orderId: string): Promise<OrderResponseDto> {
    const context = {
      operation: "getOrderById",
      orderId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching order by ID", context);

      if (!Types.ObjectId.isValid(orderId)) {
        this.logger.warn("Invalid order ID provided", context);
        throw new Error(ORDER_MESSAGES.INVALID_ORDER_ID);
      }

      const order = await this.orderRepository.findById(orderId);
      if (!order) {
        this.logger.warn("Order not found", context);
        throw new Error(ORDER_MESSAGES.ORDER_NOT_FOUND);
      }

      this.logger.info("Order retrieved successfully", {
        ...context,
        orderCode: order.orderCode,
      });

      return this.orderMapper.toOrderResponseDto(order);
    } catch (error: any) {
      this.logger.error("Get order by ID error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async getOrderStats(): Promise<OrderStatsDto> {
    const context = {
      operation: "getOrderStats",
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching order statistics", context);

      const stats = await this.orderRepository.getOrderStats();

      this.logger.info("Order statistics retrieved successfully", {
        ...context,
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
      });

      return this.orderMapper.toOrderStatsDto(stats);
    } catch (error: any) {
      this.logger.error("Get order stats error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(ORDER_MESSAGES.FAILED_FETCH_STATS);
    }
  }

  async updateOrderStatus(
    orderId: string,
    updateData: UpdateOrderStatusDto
  ): Promise<OrderResponseDto> {
    const context = {
      operation: "updateOrderStatus",
      orderId,
      newStatus: updateData.status,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating order status", context);

      if (!Types.ObjectId.isValid(orderId)) {
        this.logger.warn("Invalid order ID provided", context);
        throw new Error(ORDER_MESSAGES.INVALID_ORDER_ID);
      }

      // Check if order exists
      const existingOrder = await this.orderRepository.findById(orderId);
      if (!existingOrder) {
        this.logger.warn("Order not found for status update", context);
        throw new Error(ORDER_MESSAGES.ORDER_NOT_FOUND);
      }

      // Prepare update data with history
      const updatePayload: any = {
        status: updateData.status,
      };

      // Add to history
      const newHistory = {
        status: updateData.status,
        description:
          updateData.reason ||
          `Status updated to ${updateData.status} by admin`,
        updatedBy: "admin",
        timestamp: new Date(),
      };

      updatePayload.$push = { history: newHistory };

      this.logger.debug("Updating order status in repository", {
        ...context,
        updatePayload,
      });

      const updatedOrder = await this.orderRepository.update(
        orderId,
        updatePayload
      );
      if (!updatedOrder) {
        this.logger.error(
          "Order status update failed - repository returned null",
          context
        );
        throw new Error(ORDER_MESSAGES.FAILED_UPDATE_STATUS);
      }

      this.logger.info("Order status updated successfully", {
        ...context,
        orderCode: updatedOrder.orderCode,
        oldStatus: existingOrder.status,
        newStatus: updatedOrder.status,
      });

      return this.orderMapper.toOrderResponseDto(updatedOrder);
    } catch (error: any) {
      this.logger.error("Update order status error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
  async getOrdersByTechnician(
    technicianId: string,
    page: number = 1,
    limit: number = 100
  ): Promise<OrderListResponseDto> {
    const context = {
      operation: "getOrdersByTechnician",
      technicianId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching orders by technician", context);

      if (!Types.ObjectId.isValid(technicianId)) {
        this.logger.warn("Invalid technician ID provided", context);
        throw new Error("Invalid technician ID");
      }

      const skip = (page - 1) * limit;

      const filter = { technicianId: new Types.ObjectId(technicianId) };

      const [orders, total] = await Promise.all([
        this.orderRepository.findAll(filter, skip, limit),
        this.orderRepository.count(filter),
      ]);

      this.logger.info("Technician orders retrieved successfully", {
        ...context,
        ordersCount: orders.length,
        totalOrders: total,
      });

      return this.orderMapper.toOrderListResponseDto(
        orders,
        total,
        page,
        limit
      );
    } catch (error: any) {
      this.logger.error("Get technician orders error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to fetch technician orders");
    }
  }
}
