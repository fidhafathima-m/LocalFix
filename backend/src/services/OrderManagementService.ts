import { IOrderService } from '../interfaces/services/admin/IOrderManagementService';
import { IOrderRepository } from '../interfaces/repository/admin/IOrderRepository';
import {
  OrderResponseDto,
  OrderListResponseDto,
  OrderStatsDto,
  UpdateOrderStatusDto,
} from '../interfaces/dtos/orderDtos';
import { ORDER_MESSAGES } from '../constants';
import { Types } from 'mongoose';
import { ILogger } from '@/interfaces/utils/ILogger';
import {
  toOrderListResponseDto,
  toOrderResponseDto,
  toOrderStatsDto,
} from '../mappers/orderMapper';
import { IOrder } from '../interfaces/user/IOrder';

type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'confirmed'
  | 'in_progress'
  | 'on_the_way'
  | 'completed'
  | 'cancelled'
  | 'refunded';

interface OrderFilter {
  status?: string;
  technicianId?: Types.ObjectId;
}

interface LogContext {
  operation: string;
  timestamp: string;
  [key: string]: unknown;
}

interface OrderUpdatePayload {
  status: OrderStatus;
  $push: {
    history: {
      status: string;
      description: string;
      updatedBy: string;
      timestamp: Date;
    };
  };
}

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
    status?: string
  ): Promise<OrderListResponseDto> {
    const context: LogContext = {
      operation: 'getOrders',
      page,
      limit,
      search,
      status,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching orders', context);

      const skip = (page - 1) * limit;

      // Build filter
      const filter: OrderFilter = {};
      if (status && status !== 'all') {
        filter.status = status;
      }

      let orders: IOrder[];
      let total: number;

      if (search) {
        this._logger.debug('Searching orders with query', {
          ...context,
          searchQuery: search,
        });
        orders = await this._orderRepository.search(search, limit);
        total = orders.length;
      } else {
        this._logger.debug('Fetching orders with filter', {
          ...context,
          filter,
        });
        orders = await this._orderRepository.findAll(filter, skip, limit);
        total = await this._orderRepository.count(filter);
      }

      this._logger.info('Orders retrieved successfully', {
        ...context,
        ordersCount: orders.length,
        totalOrders: total,
      });

      return toOrderListResponseDto(orders, total, page, limit);
    } catch (error: unknown) {
      this._logger.error('Get orders error', {
        ...context,
        error:
          error instanceof Error ? error.message : 'Error in getting orders',
      });
      throw new Error(ORDER_MESSAGES.FAILED_FETCH_ORDERS);
    }
  }

  async getOrderById(orderId: string): Promise<OrderResponseDto> {
    const context: LogContext = {
      operation: 'getOrderById',
      orderId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching order by ID', context);

      if (!Types.ObjectId.isValid(orderId)) {
        this._logger.warn('Invalid order ID provided', context);
        throw new Error(ORDER_MESSAGES.INVALID_ORDER_ID);
      }

      const order = await this._orderRepository.findById(orderId);
      if (!order) {
        this._logger.warn('Order not found', context);
        throw new Error(ORDER_MESSAGES.ORDER_NOT_FOUND);
      }

      this._logger.info('Order retrieved successfully', {
        ...context,
        orderCode: order.orderCode,
      });

      return toOrderResponseDto(order);
    } catch (error: unknown) {
      this._logger.error('Get order by ID error', {
        ...context,
        error:
          error instanceof Error
            ? error.message
            : 'Error in getting order by Id',
      });
      throw error;
    }
  }

  async getOrderStats(): Promise<OrderStatsDto> {
    const context: LogContext = {
      operation: 'getOrderStats',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching order statistics', context);

      const stats = await this._orderRepository.getOrderStats();

      this._logger.info('Order statistics retrieved successfully', {
        ...context,
        totalOrders: stats.totalOrders,
        totalRevenue: stats.totalRevenue,
      });

      return toOrderStatsDto(stats);
    } catch (error: unknown) {
      this._logger.error('Get order stats error', {
        ...context,
        error:
          error instanceof Error
            ? error.message
            : 'Error in getting order stats',
      });
      throw new Error(ORDER_MESSAGES.FAILED_FETCH_STATS);
    }
  }

  async updateOrderStatus(
    orderId: string,
    updateData: UpdateOrderStatusDto
  ): Promise<OrderResponseDto> {
    const context: LogContext = {
      operation: 'updateOrderStatus',
      orderId,
      newStatus: updateData.status,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Updating order status', context);

      if (!Types.ObjectId.isValid(orderId)) {
        this._logger.warn('Invalid order ID provided', context);
        throw new Error(ORDER_MESSAGES.INVALID_ORDER_ID);
      }

      // Validate status
      const validStatuses: OrderStatus[] = [
        'pending',
        'accepted',
        'confirmed',
        'in_progress',
        'on_the_way',
        'completed',
        'cancelled',
        'refunded',
      ];

      if (!validStatuses.includes(updateData.status as OrderStatus)) {
        this._logger.warn('Invalid order status provided', {
          ...context,
          providedStatus: updateData.status,
        });
        throw new Error('Invalid order status');
      }

      // Check if order exists
      const existingOrder = await this._orderRepository.findById(orderId);
      if (!existingOrder) {
        this._logger.warn('Order not found for status update', context);
        throw new Error(ORDER_MESSAGES.ORDER_NOT_FOUND);
      }

      // Prepare update data with history
      const updatePayload: OrderUpdatePayload = {
        status: updateData.status as OrderStatus,
        $push: {
          history: {
            status: updateData.status,
            description:
              updateData.reason ||
              `Status updated to ${updateData.status} by admin`,
            updatedBy: 'admin',
            timestamp: new Date(),
          },
        },
      };

      this._logger.debug('Updating order status in repository', {
        ...context,
        updatePayload,
      });

      const updatedOrder = await this._orderRepository.update(
        orderId,
        updatePayload
      );
      if (!updatedOrder) {
        this._logger.error(
          'Order status update failed - repository returned null',
          context
        );
        throw new Error(ORDER_MESSAGES.FAILED_UPDATE_STATUS);
      }

      this._logger.info('Order status updated successfully', {
        ...context,
        orderCode: updatedOrder.orderCode,
        oldStatus: existingOrder.status,
        newStatus: updatedOrder.status,
      });

      return toOrderResponseDto(updatedOrder);
    } catch (error: unknown) {
      this._logger.error('Update order status error', {
        ...context,
        error:
          error instanceof Error
            ? error.message
            : 'Error in updating order status',
      });
      throw error;
    }
  }

  async getOrdersByTechnician(
    technicianId: string,
    page: number = 1,
    limit: number = 100
  ): Promise<OrderListResponseDto> {
    const context: LogContext = {
      operation: 'getOrdersByTechnician',
      technicianId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching orders by technician', context);

      if (!Types.ObjectId.isValid(technicianId)) {
        this._logger.warn('Invalid technician ID provided', context);
        throw new Error('Invalid technician ID');
      }

      const skip = (page - 1) * limit;

      const filter: OrderFilter = {
        technicianId: new Types.ObjectId(technicianId),
      };

      const [orders, total] = await Promise.all([
        this._orderRepository.findAll(filter, skip, limit),
        this._orderRepository.count(filter),
      ]);

      this._logger.info('Technician orders retrieved successfully', {
        ...context,
        ordersCount: orders.length,
        totalOrders: total,
      });

      return toOrderListResponseDto(orders, total, page, limit);
    } catch (error: unknown) {
      this._logger.error('Get technician orders error', {
        ...context,
        error:
          error instanceof Error
            ? error.message
            : 'Error in getting order by technician',
      });
      throw new Error('Failed to fetch technician orders');
    }
  }
}
