import { Request, Response } from "express";
import { ResponseHelper } from "../../utils/responseHelper";
import { PAYMENT_MESSAGES } from "../../constants";
import { LoggerService } from "../../services/LoggerService";
import { IPaymentService } from "@/interfaces/services/admin/IPaymentManagementService";

export class PaymentManagementController {
  private paymentService: IPaymentService;
  private logger: LoggerService;

  constructor(paymentService: IPaymentService) {
    this.paymentService = paymentService;
    this.logger = new LoggerService();
  }

  getPayments = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const context = {
      operation: "getPayments",
      page,
      limit,
      search,
      status,
      startDate,
      endDate,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching payments", context);

      const result = await this.paymentService.getPayments(
        page,
        limit,
        search,
        status,
        startDate,
        endDate
      );

      this.logger.info("Payments retrieved successfully", {
        ...context,
        totalPayments: result.total,
      });

      const response = ResponseHelper.success(
        PAYMENT_MESSAGES.PAYMENTS_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || PAYMENT_MESSAGES.FAILED_FETCH_PAYMENTS;
      this.logger.error("Get payments controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getPaymentById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: "getPaymentById",
      paymentId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching payment by ID", context);

      if (!id) {
        const response = ResponseHelper.badRequest(PAYMENT_MESSAGES.PAYMENT_ID_REQUIRED);
        res.status(response.statusCode).json(response);
        return;
      }

      const payment = await this.paymentService.getPaymentById(id);

      this.logger.info("Payment retrieved successfully", {
        ...context,
        paymentId: payment.id,
      });

      const response = ResponseHelper.success(PAYMENT_MESSAGES.PAYMENT_RETRIEVED, {
        payment,
      });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || PAYMENT_MESSAGES.PAYMENT_NOT_FOUND;
      this.logger.error("Get payment by ID controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getPaymentStats = async (req: Request, res: Response): Promise<void> => {
    const context = {
      operation: "getPaymentStats",
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching payment statistics", context);

      const stats = await this.paymentService.getPaymentStats();

      this.logger.info("Payment stats retrieved successfully", {
        ...context,
        stats,
      });

      const response = ResponseHelper.success(
        PAYMENT_MESSAGES.STATS_RETRIEVED,
        { stats }
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || PAYMENT_MESSAGES.FAILED_FETCH_STATS;
      this.logger.error("Get payment stats controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  processRefund = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { reason } = req.body;

    const context = {
      operation: "processRefund",
      paymentId: id,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Processing refund", context);

      if (!id) {
        const response = ResponseHelper.badRequest(PAYMENT_MESSAGES.PAYMENT_ID_REQUIRED);
        res.status(response.statusCode).json(response);
        return;
      }

      await this.paymentService.processRefund(id, { reason });

      this.logger.info("Refund processed successfully", context);

      const response = ResponseHelper.success(PAYMENT_MESSAGES.REFUND_PROCESSED);
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || PAYMENT_MESSAGES.FAILED_PROCESS_REFUND;
      this.logger.error("Process refund controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  exportPayments = async (req: Request, res: Response): Promise<void> => {
    const format = (req.query.format as 'csv' | 'excel') || 'csv';
    const filters = req.query;

    const context = {
      operation: "exportPayments",
      format,
      filters,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Exporting payments", context);

      const { data, filename } = await this.paymentService.exportPayments(format, filters);

      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      res.send(data);
    } catch (error: any) {
      const errorMessage = error.message || PAYMENT_MESSAGES.FAILED_EXPORT_PAYMENTS;
      this.logger.error("Export payments controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };
}