import { Response } from 'express';
import { IOrderService } from '../../interfaces/services/user/IOrderService';
import { ResponseHelper } from '../../utils/responseHelper';
import { GeneralMessages } from '../../constants';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ILogger } from '@/interfaces/utils/ILogger';

class TechnicianOrderController {
  private _orderService: IOrderService;
  private _logger: ILogger;

  constructor(orderService: IOrderService, logger: ILogger) {
    this._orderService = orderService;
    this._logger = logger;
  }

  getTechnicianOrders = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const context = {
      operation: 'getTechnicianOrders',
      technicianId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technician orders', context);

      if (!technicianId) {
        this._logger.warn(
          'Get technician orders failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this._orderService.getTechnicianOrders(
        technicianId,
        page,
        limit
      );

      this._logger.info('Technician orders retrieved successfully', {
        ...context,
        orderCount: result.data?.orders?.length || 0,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get technician orders controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianOrderById = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = req.user?.id;
    const { orderId } = req.params;

    const context = {
      operation: 'getTechnicianOrderById',
      technicianId,
      orderId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technician order by ID', context);

      if (!technicianId) {
        this._logger.warn(
          'Get technician order failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this._orderService.getTechnicianOrderById(
        technicianId,
        orderId
      );

      this._logger.info('Technician order retrieved successfully', {
        ...context,
        orderFound: !!result,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get technician order by ID controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateOrderStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = req.user?.id;
    const { orderId } = req.params;
    const { status, reason } = req.body;

    const context = {
      operation: 'updateOrderStatus',
      technicianId,
      orderId,
      status,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Updating order status', context);

      if (!technicianId) {
        this._logger.warn(
          'Update order status failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (!status) {
        this._logger.warn(
          'Update order status failed - status required',
          context
        );
        const badRequestResponse =
          ResponseHelper.badRequest('Status is required');
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result = await this._orderService.updateOrderStatus(
        orderId,
        status,
        'technician',
        reason
      );

      this._logger.info('Order status updated successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Update order status controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianOrderStats = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = req.user?.id;

    const context = {
      operation: 'getTechnicianOrderStats',
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technician order stats', context);

      if (!technicianId) {
        this._logger.warn(
          'Get technician order stats failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result =
        await this._orderService.getTechnicianOrderStats(technicianId);

      this._logger.info(
        'Technician order stats retrieved successfully',
        context
      );

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get technician order stats controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}

export default TechnicianOrderController;
