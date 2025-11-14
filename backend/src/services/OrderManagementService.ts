import { IOrderService } from "../interfaces/services/admin/IOrderManagementService";
import { IOrderRepository } from "../interfaces/repository/admin/IOrderRepository";
import {
  OrderResponseDto,
  OrderListResponseDto,
  OrderStatsDto,
  UpdateOrderStatusDto,
} from "../interfaces/dtos/orderDtos";
import { ORDER_MESSAGES } from "../constants";
import { Types } from "mongoose";
import { ILogger } from "@/interfaces/utils/ILogger";
import {
  toOrderListResponseDto,
  toOrderResponseDto,
  toOrderStatsDto,
} from "../mappers/orderMapper";
export class OrderManagementService implements IOrderService {
  private _orderRepository: IOrderRepository;
  private _logger: ILogger;

  constructor(orderRepository: IOrderRepository, logger: ILogger) {
    this._orderRepository = orderRepository;
    this._logger = logger;
  }

  async getOrders(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
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
      this._logger.info("Fetching orders", context);

      const skip = (page - 1) * limit;

      // Build filter
      const filter: any = {};
      if (status && status !== "all") {
        filter.status = status;
      }

      let orders: any[];
      let total: number;

      if (search) {
        this._logger.debug("Searching orders with query", {
          ...context,
          searchQuery: search,
        });
        orders = await this._orderRepository.search(search, limit);
        total = orders.length;
      } else {
        this._logger.debug("Fetching orders with filter", {
          ...context,
          filter,
        });
        orders = await this._orderRepository.findAll(filter, skip, limit);
        total = await this._orderRepository.count(filter);
      }

      this._logger.info("Orders retrieved successfully", {
        ...context,
        ordersCount: orders.length,
        totalOrders: total,
      });

      return toOrderListResponseDto(orders, total, page, limit);
    } catch (error: any) {
      this._logger.error("Get orders error", {
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
      this._logger.info("Fetching order by ID", context);

      if (!Types.ObjectId.isValid(orderId)) {
        this._logger.warn("Invalid order ID provided", context);
        throw new Error(ORDER_MESSAGES.INVALID_ORDER_ID);
      }

      const order = await this._orderRepository.findById(orderId);
      if (!order) {
        this._logger.warn("Order not found", context);
        throw new Error(ORDER_MESSAGES.ORDER_NOT_FOUND);
      }

      this._logger.info("Order retrieved successfully", {
        ...context,
        orderCode: order.orderCode,
      });

      return toOrderResponseDto(order);
    } catch (error: any) {
      this._logger.error("Get order by ID error", {
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
      this._logger.info("Fetching order statistics", context);

      const stats = await this._orderRepository.getOrderStats();

      this._logger.info("Order statistics retrieved successfully", {
        ...context,
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
      });

      return toOrderStatsDto(stats);
    } catch (error: any) {
      this._logger.error("Get order stats error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw new Error(ORDER_MESSAGES.FAILED_FETCH_STATS);
    }
  }

  async updateOrderStatus(
    orderId: string,
    updateData: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    const context = {
      operation: "updateOrderStatus",
      orderId,
      newStatus: updateData.status,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Updating order status", context);

      if (!Types.ObjectId.isValid(orderId)) {
        this._logger.warn("Invalid order ID provided", context);
        throw new Error(ORDER_MESSAGES.INVALID_ORDER_ID);
      }

      // Check if order exists
      const existingOrder = await this._orderRepository.findById(orderId);
      if (!existingOrder) {
        this._logger.warn("Order not found for status update", context);
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

      this._logger.debug("Updating order status in repository", {
        ...context,
        updatePayload,
      });

      const updatedOrder = await this._orderRepository.update(
        orderId,
        updatePayload,
      );
      if (!updatedOrder) {
        this._logger.error(
          "Order status update failed - repository returned null",
          context,
        );
        throw new Error(ORDER_MESSAGES.FAILED_UPDATE_STATUS);
      }

      this._logger.info("Order status updated successfully", {
        ...context,
        orderCode: updatedOrder.orderCode,
        oldStatus: existingOrder.status,
        newStatus: updatedOrder.status,
      });

      return toOrderResponseDto(updatedOrder);
    } catch (error: any) {
      this._logger.error("Update order status error", {
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
    limit: number = 100,
  ): Promise<OrderListResponseDto> {
    const context = {
      operation: "getOrdersByTechnician",
      technicianId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Fetching orders by technician", context);

      if (!Types.ObjectId.isValid(technicianId)) {
        this._logger.warn("Invalid technician ID provided", context);
        throw new Error("Invalid technician ID");
      }

      const skip = (page - 1) * limit;

      const filter = { technicianId: new Types.ObjectId(technicianId) };

      const [orders, total] = await Promise.all([
        this._orderRepository.findAll(filter, skip, limit),
        this._orderRepository.count(filter),
      ]);

      this._logger.info("Technician orders retrieved successfully", {
        ...context,
        ordersCount: orders.length,
        totalOrders: total,
      });

      return toOrderListResponseDto(orders, total, page, limit);
    } catch (error: any) {
      this._logger.error("Get technician orders error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw new Error("Failed to fetch technician orders");
    }
  }
}
