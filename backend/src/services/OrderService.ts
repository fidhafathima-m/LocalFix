import { IOrderRepository } from '../interfaces/repository/user/IOrderRepository';
import { ResponseHelper, ApiResponse } from '../utils/responseHelper';
import {
  IOrder,
  OrderListResponseDto,
  OrderResponseDto,
} from '../interfaces/user/IOrder';
import { IOrderService } from '../interfaces/services/user/IOrderService';
import { ITechnicianRepository } from '../interfaces/repository/technician/ITechnicianRepository';
import { INotificationService } from '../interfaces/services/INotificationService';
import { ILogger } from '../interfaces/utils/ILogger';
import { SocketService } from './SocketService';
import { loggers } from 'winston';
import { IMessageService } from '../interfaces/services/user/IMessageService';

export class OrderService implements IOrderService {
  private _logger: ILogger;
  private _orderRepository: IOrderRepository;
  private _technicianRepository: ITechnicianRepository;
  private _socketService: SocketService;
  private _messageService: IMessageService;

  constructor(
    orderRepository: IOrderRepository,
    technicianRepository: ITechnicianRepository,
    socketService: SocketService,
    messageService: IMessageService,
    logger: ILogger
  ) {
    this._logger = logger;
    this._orderRepository = orderRepository;
    this._technicianRepository = technicianRepository;
    this._socketService = socketService;
    this._messageService = messageService;
  }

  async getUserOrders(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<OrderListResponseDto>> {
    const context = {
      operation: 'getUserOrders',
      data: { userId, page, limit },
    };

    try {
      this._logger.info('Fetching user orders', context);

      const result = await this._orderRepository.findByUserId(
        userId,
        page,
        limit
      );

      this._logger.info('User orders retrieved successfully', {
        ...context,
        orderCount: result.orders.length,
        total: result.total,
      });

      const orderDtos = result.orders.map((order: any) => this.mapToDto(order));

      return ResponseHelper.success('Orders retrieved successfully', {
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
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching user orders', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch orders');
    }
  }

  async getOrderById(
    userId: string,
    orderId: string
  ): Promise<ApiResponse<OrderResponseDto>> {
    const context = {
      operation: 'getOrderById',
      data: { userId, orderId },
    };

    try {
      this._logger.info('Fetching order by ID', context);

      const order = await this._orderRepository.findById(orderId);

      if (!order) {
        this._logger.warn('Order not found', context);
        return ResponseHelper.notFound('Order not found');
      }

      this._logger.debug('Order user ID vs requesting user ID', {
        orderUserId: order.userId.toString(),
        requestingUserId: userId,
        match: order.userId.toString() === userId,
      });

      const realOrderId =
        order.userId?._id?.toString() || order.userId?.toString();

      // Check if user has access to this order
      if (realOrderId !== userId) {
        this._logger.warn('User not authorized to access this order', {
          ...context,
          orderUserId: order.userId.toString(),
          requestingUserId: userId,
        });
        return ResponseHelper.forbidden('Not authorized to access this order');
      }

      this._logger.info('Order retrieved successfully', context);

      const orderDto = this.mapToDto(order);
      return ResponseHelper.success('Order retrieved successfully', orderDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching order', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch order');
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
      operation: 'createOrderFromBooking',
      data: { bookingId, ...paymentData },
    };

    try {
      this._logger.info('Creating/updating order from booking', context);

      const existingOrder =
        await this._orderRepository.findByBookingId(bookingId);

      let order;

      if (existingOrder) {
        this._logger.info('Updating existing order for payment retry', {
          ...context,
          existingOrderId: existingOrder._id.toString(),
        });

        order = await this._orderRepository.updatePaymentDetails(
          existingOrder._id.toString(),
          paymentData
        );

        if (!order) {
          this._logger.error('Failed to update existing order', context);
          return ResponseHelper.error(
            'Failed to update order for payment retry'
          );
        }

        this._logger.info('Existing order updated successfully', {
          ...context,
          orderId: order._id.toString(),
        });
      } else {
        // CREATE new order - even for failed payments
        this._logger.info('Creating new order from booking', context);
        order = await this._orderRepository.createFromBooking(
          bookingId,
          paymentData
        );

        if (!order) {
          this._logger.error('Failed to create order from booking', context);
          return ResponseHelper.error('Failed to create order');
        }

        this._logger.info('New order created successfully', {
          ...context,
          orderId: order._id.toString(),
          orderCode: order.orderCode,
          paymentStatus: paymentData.status,
        });

        try {
          this._logger.info('🔄 Initializing chat room for new order', {
            orderId: order._id.toString(),
            userId: order.userId.toString(),
            technicianId: order.technicianId.toString(),
          });

          await this._messageService.initializeChatRoom(
            order._id.toString(), // Use orderId as the chat room identifier
            order.userId.toString(),
            order.technicianId.toString()
          );

          this._logger.info(
            '✅ Chat room initialized successfully for new order'
          );
        } catch (chatError) {
          this._logger.error(
            '❌ Failed to initialize chat room for new order',
            {
              error:
                chatError instanceof Error
                  ? chatError.message
                  : 'Unknown error',
              orderId: order._id.toString(),
            }
          );
          // Don't fail order creation if chat room initialization fails
        }

        // Only send notifications for successful payments
        if (paymentData.status === 'paid') {
          await this.notifyUserAboutOrderStatusChange(order, 'pending');
          await this.notifyTechnicianAboutNewOrder(order);
        } else if (paymentData.status === 'failed') {
          // Send failure notification
          await this.notifyUserAboutPayment(order, 'failed');
        }
      }

      const orderDto = this.mapToDto(order);
      this._logger.debug('Order dto: ', orderDto);
      return ResponseHelper.created(
        existingOrder
          ? 'Order updated successfully'
          : 'Order created successfully',
        orderDto
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error creating/updating order from booking', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to process order');
    }
  }

  async cancelOrder(
    userId: string,
    orderId: string,
    reason: string
  ): Promise<ApiResponse<OrderResponseDto>> {
    const context = {
      operation: 'cancelOrder',
      data: { userId, orderId, reason },
    };

    try {
      this._logger.info('Cancelling order', context);

      const order = await this._orderRepository.findById(orderId);

      if (!order) {
        this._logger.warn('Order not found for cancellation', context);
        return ResponseHelper.notFound('Order not found');
      }

      const realOrderId =
        order.userId?._id?.toString() || order.userId?.toString();

      // Check if user owns the order
      if (realOrderId !== userId) {
        this._logger.warn('User not authorized to cancel this order', context);
        return ResponseHelper.forbidden('Not authorized to cancel this order');
      }

      // Check if order can be cancelled
      if (['cancelled', 'completed', 'refunded'].includes(order.status)) {
        this._logger.warn('Order cannot be cancelled in current status', {
          ...context,
          currentStatus: order.status,
        });
        return ResponseHelper.badRequest(
          `Order cannot be cancelled in ${order.status} status`
        );
      }

      const updatedOrder = await this._orderRepository.updateStatus(
        orderId,
        'cancelled',
        'user',
        reason
      );

      if (!updatedOrder) {
        this._logger.error('Failed to cancel order', context);
        return ResponseHelper.error('Failed to cancel order');
      }

      this._logger.info('Order cancelled successfully', context);

      const orderDto = this.mapToDto(updatedOrder);
      return ResponseHelper.success('Order cancelled successfully', orderDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error cancelling order', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to cancel order');
    }
  }

  private mapToDto(order: any): OrderResponseDto {
    let userInfo: any = {};

    if (order.userId && typeof order.userId === 'object') {
      // If userId is a populated object
      userInfo = {
        _id: order.userId._id?.toString() || order.userId.toString(),
        fullName: order.userId.fullName || order.userId.name || 'Customer',
        email: order.userId.email || '',
        phone: order.userId.phone || '',
      };
    } else {
      userInfo = {
        _id: order.userId?.toString() || '',
        fullName: 'Customer',
        email: '',
        phone: '',
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
      serviceId: order.serviceId?.toString(),
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
      operation: 'getTechnicianOrders',
      data: { userId, page, limit },
    };

    try {
      this._logger.info('Fetching technician orders for user', context);

      // Get the actual technician ID from user ID
      const technicianId = await this.getTechnicianIdByUserId(userId);

      if (!technicianId) {
        this._logger.warn('No technician profile found for user', { userId });
        // Return empty orders instead of error if no technician profile exists
        return ResponseHelper.success('No orders found', {
          orders: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0,
          },
        });
      }

      this._logger.debug('Resolved technician ID', {
        userId,
        technicianId,
      });

      const result = await this._orderRepository.findByTechnicianId(
        technicianId,
        page,
        limit
      );

      this._logger.info('Technician orders retrieved successfully', {
        ...context,
        technicianId,
        orderCount: result.orders.length,
        total: result.total,
      });

      const orderDtos = result.orders.map((order: any) => this.mapToDto(order));

      return ResponseHelper.success('Orders retrieved successfully', {
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
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching technician orders', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch orders');
    }
  }

  async getTechnicianOrderById(
    technicianId: string,
    orderId: string
  ): Promise<ApiResponse<OrderResponseDto>> {
    const context = {
      operation: 'getTechnicianOrderById',
      data: { technicianId, orderId },
    };

    try {
      this._logger.info('Fetching technician order by ID', context);

      const order = await this._orderRepository.findById(orderId);

      if (!order) {
        this._logger.warn('Order not found', context);
        return ResponseHelper.notFound('Order not found');
      }

      // Check if technician has access to this order
      const orderTechnicianId =
        order.technicianId?._id?.toString() || order.technicianId?.toString();

      if (orderTechnicianId !== technicianId) {
        this._logger.warn('Technician not authorized to access this order', {
          ...context,
          orderTechnicianId,
          requestingTechnicianId: technicianId,
        });
        return ResponseHelper.forbidden('Not authorized to access this order');
      }

      this._logger.info('Technician order retrieved successfully', context);

      const orderDto = this.mapToDto(order);
      return ResponseHelper.success('Order retrieved successfully', orderDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching technician order', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch order');
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    updatedBy: string,
    reason?: string
  ): Promise<ApiResponse<OrderResponseDto>> {
    const context = {
      operation: 'updateOrderStatus',
      data: { orderId, status, updatedBy, reason },
    };

    try {
      this._logger.info('=== UPDATE ORDER STATUS START ===', context);

      // First get the order
      const order = await this._orderRepository.findById(orderId);

      if (!order) {
        this._logger.warn('Order not found for status update', context);
        return ResponseHelper.notFound('Order not found');
      }

      // CHECK FOR EXPIRED ORDER
      const now = new Date();
      const scheduledAt = new Date(order.scheduledAt);
      const oneHourAfterScheduled = new Date(
        scheduledAt.getTime() + 60 * 60 * 1000
      );

      // If order is expired, prevent any status changes except admin override
      if (now > oneHourAfterScheduled && updatedBy !== 'admin') {
        this._logger.warn('Attempted to update expired order', {
          ...context,
          scheduledAt,
          now,
          oneHourAfterScheduled,
        });
        return ResponseHelper.badRequest(
          'This order has expired and can no longer be modified. Please contact support if you need assistance.'
        );
      }

      // Validate if technician can update status
      if (updatedBy === 'technician') {
        // For acceptance, check additional validations
        if (status === 'accepted') {
          const canAccept = await this.canTechnicianAcceptOrder(
            order,
            order.technicianId.toString()
          );

          if (!canAccept.canAccept) {
            return ResponseHelper.badRequest(
              canAccept.reason || 'Cannot accept this order at this time'
            );
          }
        } else {
          // For other status updates, check if allowed
          const canUpdate = await this.canTechnicianUpdateStatus(order, status);

          if (!canUpdate.canUpdate) {
            return ResponseHelper.badRequest(
              canUpdate.reason || 'Cannot update to this status at this time'
            );
          }
        }
      }

      const updatedOrder = await this._orderRepository.updateStatus(
        orderId,
        status,
        updatedBy,
        reason
      );

      if (!updatedOrder) {
        this._logger.error('Failed to update order status', context);
        return ResponseHelper.error('Failed to update order status');
      }

      // ✅ CRITICAL: Update the chat room with new order status
      try {
        await this._messageService.syncOrderStatusWithRoom(orderId);
        this._logger.info('Chat room status synced successfully');
      } catch (syncError) {
        this._logger.error('Failed to sync chat room status:', syncError);
        // Don't fail the order update if room sync fails
      }

      this._logger.info(
        'Order updated successfully, now triggering notifications'
      );

      // Notify via socket about order status change
      await this._socketService.notifyOrderStatusChange(orderId, status);
      await this.notifyUserAboutOrderStatusChange(updatedOrder, status);

      if (updatedBy === 'technician') {
        await this.notifyTechnicianAboutOrderStatusChange(updatedOrder, status);
      }

      this._logger.info('=== UPDATE ORDER STATUS COMPLETE ===', {
        orderId,
        status,
        userNotified: true,
        technicianNotified: updatedBy === 'technician',
      });

      const orderDto = this.mapToDto(updatedOrder);
      return ResponseHelper.success(
        'Order status updated successfully',
        orderDto
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error updating order status', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to update order status');
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
      operation: 'getTechnicianOrderStats',
      data: { technicianId },
    };

    try {
      this._logger.info('Fetching technician order stats', context);

      const stats =
        await this._orderRepository.getTechnicianStats(technicianId);

      this._logger.info(
        'Technician order stats retrieved successfully',
        context
      );

      return ResponseHelper.success(
        'Order stats retrieved successfully',
        stats
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching technician order stats', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch order stats');
    }
  }
  private async checkTechnicianAvailability(
    technicianId: string,
    date: string,
    timeSlot: string,
    excludeOrderId?: string
  ): Promise<boolean> {
    try {
      const conflictingOrders =
        await this._orderRepository.findConflictingOrders(
          technicianId,
          date,
          timeSlot,
          excludeOrderId
        );

      return conflictingOrders.length === 0;
    } catch (error) {
      this._logger.error('Error checking technician availability', {
        technicianId,
        date,
        timeSlot,
        error: error instanceof Error ? error.message : 'Unknown error',
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
      operation: 'rescheduleOrder',
      data: { userId, orderId, newDate, newTimeSlot },
    };

    try {
      this._logger.info('Rescheduling order', context);

      const order = await this._orderRepository.findById(orderId);

      if (!order) {
        this._logger.warn('Order not found for rescheduling', context);
        return ResponseHelper.notFound('Order not found');
      }

      const realOrderId =
        order.userId?._id?.toString() || order.userId?.toString();

      // Check if user owns the order
      if (realOrderId !== userId) {
        this._logger.warn(
          'User not authorized to reschedule this order',
          context
        );
        return ResponseHelper.forbidden(
          'Not authorized to reschedule this order'
        );
      }

      // Check if order can be rescheduled
      if (!this.canOrderBeRescheduled(order.status)) {
        this._logger.warn('Order cannot be rescheduled in current status', {
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
        this._logger.warn(
          'Reschedule date must be at least 4 hours in advance',
          {
            ...context,
            scheduledAt,
            fourHoursFromNow,
          }
        );
        return ResponseHelper.badRequest(
          'New date must be at least 4 hours from now'
        );
      }

      // Check technician availability - FIX: Pass the orderId to exclude
      const isAvailable = await this.checkTechnicianAvailability(
        order.technicianId.toString(),
        newDate,
        newTimeSlot,
        orderId
      );

      if (!isAvailable) {
        this._logger.warn(
          'Technician not available for the selected slot',
          context
        );
        return ResponseHelper.badRequest(
          'Technician is not available for the selected date and time'
        );
      }

      const updatedOrder = await this._orderRepository.rescheduleOrder(
        orderId,
        newDate,
        newTimeSlot,
        'user'
      );

      if (!updatedOrder) {
        this._logger.error('Failed to reschedule order in repository', context);
        return ResponseHelper.error('Failed to reschedule order');
      }

      this._logger.info('Order rescheduled successfully', {
        ...context,
        oldDate: order.scheduledAt,
        oldTimeSlot: order.timeSlot,
      });

      const orderDto = this.mapToDto(updatedOrder);
      return ResponseHelper.success('Order rescheduled successfully', orderDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error rescheduling order', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to reschedule order');
    }
  }

  private canOrderBeRescheduled(status: string): boolean {
    const reschedulableStatuses = ['pending', 'confirmed', 'accepted'];
    return reschedulableStatuses.includes(status);
  }

  private async getTechnicianIdByUserId(
    userId: string
  ): Promise<string | null> {
    try {
      this._logger.debug('Looking up technician ID for user', { userId });

      const technician = await this._technicianRepository.findByUserId(userId);

      if (!technician) {
        this._logger.warn('No technician found for user', { userId });
        return null;
      }

      this._logger.debug('Found technician profile', {
        userId,
        technicianId: technician._id.toString(),
      });

      return technician._id.toString();
    } catch (error) {
      this._logger.error('Error finding technician by user ID', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }
  async getOrderByBookingId(
    userId: string,
    bookingId: string
  ): Promise<ApiResponse<OrderResponseDto>> {
    const context = {
      operation: 'getOrderByBookingId',
      data: { userId, bookingId },
    };

    try {
      this._logger.info('Fetching order by booking ID', context);

      const order = await this._orderRepository.findByBookingId(bookingId);

      if (!order) {
        this._logger.warn('Order not found for booking', context);
        return ResponseHelper.notFound('Order not found for this booking');
      }

      const realOrderId =
        order.userId?._id?.toString() || order.userId?.toString();

      // Check if user has access to this order
      if (realOrderId !== userId) {
        this._logger.warn('User not authorized to access this order', {
          ...context,
          orderUserId: order.userId.toString(),
          requestingUserId: userId,
        });
        return ResponseHelper.forbidden('Not authorized to access this order');
      }

      this._logger.info('Order retrieved successfully by booking ID', context);

      const orderDto = this.mapToDto(order);
      return ResponseHelper.success('Order retrieved successfully', orderDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching order by booking ID', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch order');
    }
  }
  async updateOrderPayment(
    orderId: string,
    paymentData: {
      method: 'online' | 'cod';
      amount: number;
      status: 'pending' | 'paid' | 'failed';
      transactionId?: string;
      paidAt?: Date;
    }
  ): Promise<ApiResponse<OrderResponseDto>> {
    const context = {
      operation: 'updateOrderPayment',
      data: { orderId, ...paymentData },
    };

    try {
      this._logger.info('Updating order payment', context);

      const updatedOrder = await this._orderRepository.updatePaymentDetails(
        orderId,
        paymentData
      );

      if (!updatedOrder) {
        this._logger.error('Failed to update order payment', context);
        return ResponseHelper.error('Failed to update order payment');
      }
      await this.notifyUserAboutPayment(updatedOrder, paymentData.status);

      this._logger.info('Order payment updated successfully', context);

      const orderDto = this.mapToDto(updatedOrder);
      return ResponseHelper.success(
        'Order payment updated successfully',
        orderDto
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error updating order payment', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to update order payment');
    }
  }

  private async notifyTechnicianAboutNewOrder(order: any): Promise<void> {
    try {
      const context = {
        operation: 'notifyTechnicianAboutNewOrder',
        orderId: order._id.toString(),
        technicianId: order.technicianId.toString(),
      };

      this._logger.info(
        'Sending new order notification to technician',
        context
      );

      // Get technician details for personalized notification
      const technician = await this._technicianRepository.findById(
        order.technicianId.toString()
      );

      if (!technician) {
        this._logger.warn('Technician not found for notification', context);
        return;
      }
      await this._socketService.notifyNewBookingToTechnician(
        order.technicianId.toString(),
        order._id.toString(),
        order.serviceName
      );

      this._logger.info('New order notification sent successfully', {
        ...context,
        technicianName: technician.displayName,
        serviceType: order.serviceName,
      });
    } catch (error) {
      // Don't fail the order creation if notification fails
      this._logger.error('Failed to send notification to technician', {
        orderId: order._id.toString(),
        technicianId: order.technicianId.toString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async notifyTechnicianAboutOrderStatusChange(
    order: any,
    newStatus: string
  ): Promise<void> {
    try {
      const context = {
        operation: 'notifyTechnicianAboutOrderStatusChange',
        orderId: order._id.toString(),
        technicianId: order.technicianId.toString(),
        newStatus,
      };

      this._logger.info(
        'Sending order status change notification to technician',
        context
      );

      // Get technician details
      const technician = await this._technicianRepository.findById(
        order.technicianId.toString()
      );

      if (!technician) {
        this._logger.warn(
          'Technician not found for status change notification',
          context
        );
        return;
      }

      let notificationTitle = '';
      let notificationMessage = '';

      switch (newStatus) {
        case 'accepted':
          notificationTitle = 'Order Accepted';
          notificationMessage = `You have accepted the ${order.serviceName} order.`;
          break;
        case 'in_progress':
          notificationTitle = 'Order In Progress';
          notificationMessage = `You have started working on the ${order.serviceName} order.`;
          break;
        case 'completed':
          notificationTitle = 'Order Completed';
          notificationMessage = `You have completed the ${order.serviceName} order. Payment will be processed shortly.`;
          break;
        case 'cancelled':
          notificationTitle = 'Order Cancelled';
          notificationMessage = `The ${order.serviceName} order has been cancelled.`;
          break;
        default:
          return; // Don't send notification for other status changes
      }
      await this._socketService.sendLiveNotification(
        technician._id.toString(),
        {
          userId: technician._id.toString(),
          userType: 'technician',
          type: 'order_update',
          title: notificationTitle,
          message: notificationMessage,
          priority: 'medium',
          data: {
            orderId: order._id.toString(),
            serviceType: order.serviceName,
            newStatus,
          },
        }
      );

      this._logger.info(
        'Order status change notification sent successfully',
        context
      );
    } catch (error) {
      // Don't fail the order update if notification fails
      this._logger.error(
        'Failed to send status change notification to technician',
        {
          orderId: order._id.toString(),
          technicianId: order.technicianId.toString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }
  private async notifyUserAboutOrderStatusChange(
    order: any,
    newStatus: string
  ): Promise<void> {
    try {
      const context = {
        operation: 'notifyUserAboutOrderStatusChange',
        orderId: order._id.toString(),
        userId: order.userId.toString(),
        newStatus,
      };

      this._logger.info('=== NOTIFY USER START ===', context);

      let notificationTitle = '';
      let notificationMessage = '';
      let notificationType = '';
      let actionUrl = '';
      let priority: 'low' | 'medium' | 'high' = 'medium';

      switch (newStatus) {
        case 'confirmed':
          notificationTitle = 'Booking Confirmed!';
          notificationMessage = `Your ${order.serviceName} booking has been confirmed.`;
          notificationType = 'booking_confirmed';
          break;
        case 'accepted':
          notificationTitle = 'Technician Assigned';
          notificationMessage = `A technician has been assigned to your ${order.serviceName} service.`;
          notificationType = 'technician_assigned';
          break;
        case 'on_the_way':
          notificationTitle = 'Technician is on the way!';
          notificationMessage = `Your technician is coming to your location.`;
          notificationType = 'on_the_way';
          actionUrl = `/tracking/${order.orderId}`;
          priority = 'high';
          break;
        case 'in_progress':
          notificationTitle = 'Service In Progress';
          notificationMessage = `Your ${order.serviceName} service has started.`;
          notificationType = 'service_in_progress';
          break;
        case 'completed':
          notificationTitle = 'Service Completed';
          notificationMessage = `Your ${order.serviceName} service has been completed successfully.`;
          notificationType = 'service_completed';
          break;
        case 'cancelled':
          notificationTitle = 'Booking Cancelled';
          notificationMessage = `Your ${order.serviceName} booking has been cancelled.`;
          notificationType = 'booking_cancelled';
          break;
        default:
          this._logger.info('No notification for status:', newStatus);
          return;
      }

      this._logger.info('Creating user notification:', {
        title: notificationTitle,
        message: notificationMessage,
        type: notificationType,
        actionUrl,
      });

      await this._socketService.notifyOrderStatusUpdate(
        order.userId.toString(),
        order._id.toString(),
        newStatus,
        order.serviceName
      );

      this._logger.info('=== NOTIFICATION CREATED SUCCESSFULLY ===', {
        userId: order.userId.toString(),
      });
    } catch (error) {
      this._logger.error('=== NOTIFICATION CREATION FAILED ===', {
        orderId: order._id.toString(),
        userId: order.userId.toString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  private async notifyUserAboutPayment(
    order: any,
    paymentStatus: string
  ): Promise<void> {
    try {
      const context = {
        operation: 'notifyUserAboutPayment',
        orderId: order._id.toString(),
        userId: order.userId.toString(),
        paymentStatus,
      };

      this._logger.info('=== PAYMENT NOTIFICATION START ===', context);

      let notificationTitle = '';
      let notificationMessage = '';

      if (paymentStatus === 'paid') {
        notificationTitle = 'Payment Successful!';
        notificationMessage = `Your payment of ₹${order.payment.amount} for ${order.serviceName} has been processed successfully.`;
      } else if (paymentStatus === 'failed') {
        notificationTitle = 'Payment Failed';
        notificationMessage = `Your payment for ${order.serviceName} failed. Please try again.`;
      } else {
        this._logger.info('No payment notification for status:', paymentStatus);
        return;
      }

      this._logger.info('Creating payment notification:', {
        title: notificationTitle,
        message: notificationMessage,
      });

      if (paymentStatus === 'paid') {
        await this._socketService.notifyPaymentSuccess(
          order.userId.toString(),
          order.payment.amount,
          order.serviceName
        );
      }

      this._logger.info('=== PAYMENT NOTIFICATION CREATED SUCCESSFULLY ===');
    } catch (error) {
      this._logger.error('=== PAYMENT NOTIFICATION FAILED ===', {
        orderId: order._id.toString(),
        userId: order.userId.toString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  async getOrdersByTechnicianAndDate(
    technicianId: string,
    date: Date
  ): Promise<IOrder[]> {
    const context = {
      operation: 'getOrdersByTechnicianAndDate',
      data: { technicianId, date },
    };

    try {
      this._logger.info('Fetching orders by technician and date', context);

      const orders = await this._orderRepository.getOrdersByTechnicianAndDate(
        technicianId,
        date
      );

      this._logger.info('Orders retrieved successfully', {
        ...context,
        orderCount: orders.length,
      });

      return orders;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching orders by technician and date', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return [];
    }
  }
  // Add these private methods to your OrderService class
  private async canTechnicianAcceptOrder(
    order: any,
    technicianId: string
  ): Promise<{ canAccept: boolean; reason?: string }> {
    try {
      const now = new Date();
      const scheduledAt = new Date(order.scheduledAt);

      // 1. Check if scheduled time has passed
      if (scheduledAt < now) {
        return {
          canAccept: false,
          reason:
            'Cannot accept an order after the scheduled date/time has passed',
        };
      }

      // 2. Check for overlapping jobs
      const overlappingOrders =
        await this._orderRepository.findOverlappingOrders(
          technicianId,
          order.scheduledAt,
          order.timeSlot,
          order._id.toString()
        );

      if (overlappingOrders.length > 0) {
        const conflictingOrder = overlappingOrders[0];
        return {
          canAccept: false,
          reason: `You already have a ${conflictingOrder.serviceName} job scheduled at ${conflictingOrder.timeSlot} on ${new Date(conflictingOrder.scheduledAt).toLocaleDateString()}`,
        };
      }

      // 3. Check if technician is currently in another job
      const currentActiveOrder =
        await this._orderRepository.findActiveOrderByTechnician(technicianId);
      if (
        currentActiveOrder &&
        currentActiveOrder._id.toString() !== order._id.toString()
      ) {
        return {
          canAccept: false,
          reason: `You need to complete your current ${currentActiveOrder.serviceName} job before accepting new orders`,
        };
      }

      return { canAccept: true };
    } catch (error) {
      this._logger.error('Error checking technician acceptance capability', {
        technicianId,
        orderId: order._id.toString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return { canAccept: false, reason: 'System error checking availability' };
    }
  }

  private async canTechnicianUpdateStatus(
    order: any,
    newStatus: string
  ): Promise<{ canUpdate: boolean; reason?: string }> {
    try {
      const now = new Date();

      // 1. Check if order is expired for certain status transitions
      const scheduledAt = new Date(order.scheduledAt);

      // For acceptance/confirmation, check if scheduled time has passed
      if (['accepted', 'confirmed'].includes(newStatus)) {
        if (scheduledAt < now) {
          return {
            canUpdate: false,
            reason:
              'Cannot accept/confirm an order after the scheduled date/time has passed',
          };
        }
      }

      // 2. For "in_progress" -> "completed", check minimum 30 minutes
      if (newStatus === 'completed' && order.status === 'in_progress') {
        const inProgressHistory = order.history.find(
          (h: any) => h.status === 'in_progress'
        );
        if (inProgressHistory) {
          const inProgressTime = new Date(inProgressHistory.timestamp);
          const timeSinceStart = now.getTime() - inProgressTime.getTime();
          const thirtyMinutes = 30 * 60 * 1000;

          if (timeSinceStart < thirtyMinutes) {
            const remainingMinutes = Math.ceil(
              (thirtyMinutes - timeSinceStart) / (60 * 1000)
            );
            return {
              canUpdate: false,
              reason: `Cannot mark as complete yet. Please wait ${remainingMinutes} more minutes (minimum 30 minutes required from start)`,
            };
          }
        }
      }

      // 3. Check for overlapping jobs when starting a new one
      if (newStatus === 'in_progress') {
        const activeOrder =
          await this._orderRepository.findActiveOrderByTechnician(
            order.technicianId.toString()
          );

        if (
          activeOrder &&
          activeOrder._id.toString() !== order._id.toString()
        ) {
          return {
            canUpdate: false,
            reason: `You need to complete your current ${activeOrder.serviceName} job before starting another one`,
          };
        }
      }

      return { canUpdate: true };
    } catch (error) {
      this._logger.error('Error checking status update capability', {
        orderId: order._id.toString(),
        newStatus,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return {
        canUpdate: false,
        reason: 'System error checking update capability',
      };
    }
  }
  // Add this method to OrderService.ts
  async autoCancelExpiredOrders(): Promise<void> {
    const context = { operation: 'autoCancelExpiredOrders' };

    try {
      this._logger.info('Running auto-cancel for expired orders', context);

      const now = new Date();

      // Find all pending/accepted/confirmed orders where scheduled time is more than 1 hour ago
      const expiredOrders = await this._orderRepository.findExpiredOrders(now, [
        'pending',
        'accepted',
        'confirmed',
      ]);

      this._logger.info(
        `Found ${expiredOrders.length} expired orders to cancel`,
        {
          ...context,
          count: expiredOrders.length,
        }
      );

      for (const order of expiredOrders) {
        try {
          // Auto-cancel the order
          const updatedOrder = await this._orderRepository.updateStatus(
            order._id.toString(),
            'cancelled',
            'system',
            'Order automatically cancelled - scheduled time has passed'
          );

          // Notify customer
          await this.notifyUserAboutOrderStatusChange(
            updatedOrder,
            'cancelled'
          );

          // Notify technician
          await this.notifyTechnicianAboutOrderStatusChange(
            updatedOrder,
            'cancelled'
          );

          this._logger.info('Auto-cancelled expired order', {
            orderId: order._id.toString(),
            scheduledAt: order.scheduledAt,
          });
        } catch (error) {
          this._logger.error('Failed to auto-cancel expired order', {
            orderId: order._id.toString(),
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
    } catch (error) {
      this._logger.error('Error in auto-cancel expired orders', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
