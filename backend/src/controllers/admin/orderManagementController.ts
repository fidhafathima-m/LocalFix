import { IOrderService } from '../../interfaces/services/admin/IOrderManagementService';
import { ResponseHelper } from '../../utils/responseHelper';
import { ORDER_MESSAGES } from '../../constants';
import { UpdateOrderStatusDto } from '../../interfaces/dtos/orderDtos';
import { ILogger } from '../../interfaces/utils/ILogger';
import { AuthRequest } from '../../middleware/authMiddleware';
import { Response } from 'express';

export class OrderManagementController {
  private _orderService: IOrderService;
  private _logger: ILogger;

  constructor(orderService: IOrderService, logger: ILogger) {
    this._orderService = orderService;
    this._logger = logger;
  }

  getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const context = {
      operation: 'getOrders',
      page,
      limit,
      search,
      status,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching orders', context);

      const result = await this._orderService.getOrders(
        page,
        limit,
        search,
        status
      );

      this._logger.info('Orders retrieved successfully', {
        ...context,
        totalOrders: result.total,
      });

      const response = ResponseHelper.success(
        ORDER_MESSAGES.ORDERS_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : ORDER_MESSAGES.FAILED_FETCH_ORDERS;
      this._logger.error('Get orders controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
    const { orderId } = req.params;
    const context = {
      operation: 'getOrderById',
      orderId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching order by ID', context);

      const order = await this._orderService.getOrderById(orderId);

      this._logger.info('Order retrieved successfully', {
        ...context,
        orderCode: order.orderCode,
      });

      const response = ResponseHelper.success(ORDER_MESSAGES.ORDER_RETRIEVED, {
        order,
      });
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : ORDER_MESSAGES.ORDER_NOT_FOUND;
      this._logger.error('Get order by ID controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getOrderStats = async (req: AuthRequest, res: Response): Promise<void> => {
    const context = {
      operation: 'getOrderStats',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching order statistics', context);

      const stats = await this._orderService.getOrderStats();

      this._logger.info('Order statistics retrieved successfully', context);

      const response = ResponseHelper.success(ORDER_MESSAGES.STATS_RETRIEVED, {
        stats,
      });
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : ORDER_MESSAGES.FAILED_FETCH_STATS;
      this._logger.error('Get order stats controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  updateOrderStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { orderId } = req.params;
    const updateDto: UpdateOrderStatusDto = req.body;

    const context = {
      operation: 'updateOrderStatus',
      orderId,
      newStatus: updateDto.status,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Updating order status', context);

      // Validation
      if (!updateDto.status) {
        this._logger.warn(
          'Order status update failed - status required',
          context
        );
        const response = ResponseHelper.badRequest(
          ORDER_MESSAGES.STATUS_REQUIRED
        );
        res.status(response.statusCode).json(response);
        return;
      }

      const validStatuses = [
        'pending',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'refunded',
      ];
      if (!validStatuses.includes(updateDto.status)) {
        this._logger.warn('Order status update failed - invalid status', {
          ...context,
          providedStatus: updateDto.status,
        });
        const response = ResponseHelper.badRequest(
          ORDER_MESSAGES.INVALID_STATUS
        );
        res.status(response.statusCode).json(response);
        return;
      }

      const order = await this._orderService.updateOrderStatus(
        orderId,
        updateDto
      );

      this._logger.info('Order status updated successfully', {
        ...context,
        orderCode: order.orderCode,
      });

      const response = ResponseHelper.success(ORDER_MESSAGES.STATUS_UPDATED, {
        order,
      });
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : ORDER_MESSAGES.FAILED_UPDATE_STATUS;
      this._logger.error('Update order status controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };
  getOrdersByTechnician = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { technicianId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;

    const context = {
      operation: 'getOrdersByTechnician',
      technicianId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching orders by technician', context);

      if (!technicianId) {
        this._logger.warn('Technician ID is required', context);
        const response = ResponseHelper.badRequest('Technician ID is required');
        res.status(response.statusCode).json(response);
        return;
      }

      const result = await this._orderService.getOrdersByTechnician(
        technicianId,
        page,
        limit
      );

      this._logger.info('Technician orders retrieved successfully', {
        ...context,
        totalOrders: result.total,
      });

      const response = ResponseHelper.success(
        ORDER_MESSAGES.ORDERS_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : ORDER_MESSAGES.FAILED_FETCH_ORDERS;
      this._logger.error('Get technician orders controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };
}
