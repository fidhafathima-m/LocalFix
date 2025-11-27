import { Response } from 'express-serve-static-core';
import { ResponseHelper } from '../../utils/responseHelper';
import { PAYMENT_MESSAGES } from '../../constants';
import { IPaymentService } from '@/interfaces/services/admin/IPaymentManagementService';
import { ILogger } from '@/interfaces/utils/ILogger';
import { AuthRequest } from '../../types/express';

export class PaymentManagementController {
  private _paymentService: IPaymentService;
  private _logger: ILogger;

  constructor(paymentService: IPaymentService, logger: ILogger) {
    this._paymentService = paymentService;
    this._logger = logger;
  }

  getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const context = {
      operation: 'getPayments',
      page,
      limit,
      search,
      status,
      startDate,
      endDate,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching payments', context);

      const result = await this._paymentService.getPayments(
        page,
        limit,
        search,
        status,
        startDate,
        endDate
      );

      this._logger.info('Payments retrieved successfully', {
        ...context,
        totalPayments: result.total,
      });

      const response = ResponseHelper.success(
        PAYMENT_MESSAGES.PAYMENTS_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : PAYMENT_MESSAGES.FAILED_FETCH_PAYMENTS;
      this._logger.error('Get payments controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getPaymentById = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'getPaymentById',
      paymentId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching payment by ID', context);

      if (!id) {
        const response = ResponseHelper.badRequest(
          PAYMENT_MESSAGES.PAYMENT_ID_REQUIRED
        );
        res.status(response.statusCode).json(response);
        return;
      }

      const payment = await this._paymentService.getPaymentById(id);

      this._logger.info('Payment retrieved successfully', {
        ...context,
        paymentId: payment.id,
      });

      const response = ResponseHelper.success(
        PAYMENT_MESSAGES.PAYMENT_RETRIEVED,
        {
          payment,
        }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : PAYMENT_MESSAGES.PAYMENT_NOT_FOUND;
      this._logger.error('Get payment by ID controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getPaymentStats = async (req: AuthRequest, res: Response): Promise<void> => {
    const context = {
      operation: 'getPaymentStats',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching payment statistics', context);

      const stats = await this._paymentService.getPaymentStats();

      this._logger.info('Payment stats retrieved successfully', {
        ...context,
        stats,
      });

      const response = ResponseHelper.success(
        PAYMENT_MESSAGES.STATS_RETRIEVED,
        { stats }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : PAYMENT_MESSAGES.FAILED_FETCH_STATS;
      this._logger.error('Get payment stats controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  processRefund = async (req: AuthRequest, res: Response) => {
    try {
      const { paymentId } = req.params;
      const { reason } = req.body;

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message: 'Payment ID is required',
        });
      }

      await this._paymentService.processRefund(paymentId, { reason });

      return res.status(200).json({
        success: true,
        message:
          "Refund processed successfully and amount credited to user's wallet",
      });
    } catch (error: unknown) {
      console.error('Process refund error:', error);
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to process refund',
      });
    }
  };

  exportPayments = async (req: AuthRequest, res: Response): Promise<void> => {
    const format = (req.query.format as 'csv' | 'excel') || 'csv';
    const filters = req.query;

    const context = {
      operation: 'exportPayments',
      format,
      filters,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Exporting payments', context);

      const { data, filename } = await this._paymentService.exportPayments(
        format,
        filters
      );

      res.setHeader(
        'Content-Type',
        format === 'csv'
          ? 'text/csv'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );

      res.send(data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : PAYMENT_MESSAGES.FAILED_EXPORT_PAYMENTS;
      this._logger.error('Export payments controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };
}
