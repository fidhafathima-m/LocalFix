import { ResponseHelper } from '../../utils/responseHelper';
import { GeneralMessages } from '../../constants';
import { AuthRequest } from '../../middleware/authMiddleware';
import { Response } from 'express';
import { IOrderService } from '../../interfaces/services/user/IOrderService';
import { ILogger } from '../../interfaces/utils/ILogger';

export class OrderController {
  private _orderService: IOrderService;
  private _logger: ILogger;

  constructor(orderService: IOrderService, logger: ILogger) {
    this._orderService = orderService;
    this._logger = logger;
  }

  getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const context = {
      operation: 'getUserOrders',
      userId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching user orders', context);

      if (!userId) {
        this._logger.warn(
          'Get user orders failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this._orderService.getUserOrders(
        userId,
        page,
        limit
      );

      this._logger.info('User orders retrieved successfully', {
        ...context,
        orderCount: result.data?.orders.length || 0,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get user orders controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { orderId } = req.params;

    const context = {
      operation: 'getOrderById',
      userId,
      orderId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching order by ID', context);

      if (!userId) {
        this._logger.warn(
          'Get order failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this._orderService.getOrderById(userId, orderId);

      this._logger.info('Order retrieved successfully', {
        ...context,
        orderFound: !!result.data,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get order by ID controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  cancelOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { orderId } = req.params;
    const { reason } = req.body;

    const context = {
      operation: 'cancelOrder',
      userId,
      orderId,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Cancelling order', context);

      if (!userId) {
        this._logger.warn(
          'Cancel order failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (!reason) {
        this._logger.warn('Cancel order failed - reason required', context);
        const badRequestResponse = ResponseHelper.badRequest(
          'Cancellation reason is required'
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result = await this._orderService.cancelOrder(
        userId,
        orderId,
        reason
      );

      this._logger.info('Order cancelled successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Cancel order controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
  rescheduleOrder = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { orderId } = req.params;
    const { newDate, newTimeSlot } = req.body;

    const context = {
      operation: 'rescheduleOrder',
      userId,
      orderId,
      newDate,
      newTimeSlot,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Rescheduling order', context);

      if (!userId) {
        this._logger.warn(
          'Reschedule order failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (!newDate || !newTimeSlot) {
        this._logger.warn('Reschedule order failed - missing required fields', {
          ...context,
          hasNewDate: !!newDate,
          hasNewTimeSlot: !!newTimeSlot,
        });
        const badRequestResponse = ResponseHelper.badRequest(
          'New date and time slot are required'
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      // Validate date format
      const scheduledAt = new Date(newDate);
      if (isNaN(scheduledAt.getTime())) {
        this._logger.warn(
          'Reschedule order failed - invalid date format',
          context
        );
        const badRequestResponse = ResponseHelper.badRequest(
          'Invalid date format'
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      // Check if the new date is in the future
      if (scheduledAt <= new Date()) {
        this._logger.warn(
          'Reschedule order failed - date must be in future',
          context
        );
        const badRequestResponse = ResponseHelper.badRequest(
          'New date must be in the future'
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result = await this._orderService.rescheduleOrder(
        userId,
        orderId,
        newDate,
        newTimeSlot
      );

      if (!result.success) {
        this._logger.warn('Reschedule order service returned failure', {
          ...context,
          error: result.message,
          statusCode: result.statusCode,
        });
      } else {
        this._logger.info('Order rescheduled successfully', context);
      }

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Reschedule order controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
  createOrderFromBooking = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const { bookingId, paymentData } = req.body;

    const context = {
      operation: 'createOrderFromBooking',
      userId,
      bookingId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Creating order from booking', context);

      if (!userId) {
        this._logger.warn(
          'Create order failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (!bookingId || !paymentData) {
        this._logger.warn(
          'Create order failed - missing required fields',
          context
        );
        const badRequestResponse = ResponseHelper.badRequest(
          'Booking ID and payment data are required'
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result = await this._orderService.createOrderFromBooking(
        bookingId,
        paymentData
      );

      this._logger.info('Order created successfully from booking', context);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Create order from booking controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
  getOrderByBookingId = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const { bookingId } = req.params;

    const context = {
      operation: 'getOrderByBookingId',
      userId,
      bookingId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching order by booking ID', context);

      if (!userId) {
        this._logger.warn(
          'Get order failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this._orderService.getOrderByBookingId(
        userId,
        bookingId
      );

      this._logger.info('Order retrieved successfully by booking ID', {
        ...context,
        orderFound: !!result.data,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get order by booking ID controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
  updateOrderPayment = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const { orderId } = req.params;
    const paymentData = req.body;

    const context = {
      operation: 'updateOrderPayment',
      userId,
      orderId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Updating order payment', context);

      if (!userId) {
        this._logger.warn(
          'Update payment failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this._orderService.updateOrderPayment(
        orderId,
        paymentData
      );

      this._logger.info('Order payment updated successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Update order payment controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
