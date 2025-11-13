import { PaymentMapper } from "../mappers/paymentMapper";
import { LoggerService } from "./LoggerService";
import {
  PaymentListResponseDto,
  PaymentResponseDto,
  PaymentStatsDto,
  RefundRequestDto,
} from "@/interfaces/dtos/paymentDtos";
import { IPaymentRepository } from "../interfaces/repository/admin/IPaymentRepository";
import { Types } from "mongoose";
import { PAYMENT_MESSAGES } from "../constants";
import { IPaymentService } from "../interfaces/services/admin/IPaymentManagementService";
import { ILogger } from "@/interfaces/utils/ILogger";

export class PaymentManagementService implements IPaymentService {
  private paymentRepository: IPaymentRepository;
  private paymentMapper: PaymentMapper;
  private logger: ILogger;

  constructor(paymentRepository: IPaymentRepository, logger: ILogger) {
    this.paymentRepository = paymentRepository;
    this.paymentMapper = new PaymentMapper();
    this.logger = logger;
  }

  async getPayments(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    startDate?: string,
    endDate?: string
  ): Promise<PaymentListResponseDto> {
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

      // Build filter query
      const filter: any = {};

      if (status && status !== "All Status") {
        filter.status = status;
      }

      if (startDate && endDate) {
        filter.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }

      const skip = (page - 1) * limit;
      let payments: any[];
      let total: number;

      if (search) {
        this.logger.debug("Searching payments with query", {
          ...context,
          searchQuery: search,
        });

        // Get all matching results first
        const allSearchResults = await this.paymentRepository.search(
          search,
          10000,
          filter
        );
        total = allSearchResults.length;

        // Apply pagination
        payments = allSearchResults.slice(skip, skip + limit);
      } else {
        this.logger.debug("Fetching all payments with filter", {
          ...context,
          filter,
        });
        payments = await this.paymentRepository.findAll(filter, skip, limit);
        total = await this.paymentRepository.count(filter);
      }

      this.logger.info("Payments retrieved successfully", {
        ...context,
        paymentsCount: payments.length,
        totalPayments: total,
        hasSearch: !!search,
      });

      return this.paymentMapper.toPaymentListResponseDto(
        payments,
        total,
        page,
        limit
      );
    } catch (error: any) {
      this.logger.error("Get payments error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async getPaymentById(paymentId: string): Promise<PaymentResponseDto> {
    const context = {
      operation: "getPaymentById",
      paymentId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching payment by ID", context);

      if (!Types.ObjectId.isValid(paymentId)) {
        this.logger.warn("Invalid payment ID provided", context);
        throw new Error(PAYMENT_MESSAGES.INVALID_PAYMENT_ID);
      }

      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        this.logger.warn("Payment not found", context);
        throw new Error(PAYMENT_MESSAGES.PAYMENT_NOT_FOUND);
      }

      this.logger.info("Payment retrieved successfully", {
        ...context,
        providerOrderId: payment.providerOrderId,
        status: payment.status,
      });

      return this.paymentMapper.toPaymentResponseDto(payment);
    } catch (error: any) {
      this.logger.error("Get payment by ID error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async getPaymentStats(): Promise<PaymentStatsDto> {
    const context = {
      operation: "getPaymentStats",
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching payment statistics", context);

      const stats = await this.paymentRepository.getPaymentStats();

      this.logger.info("Payment stats retrieved successfully", {
        ...context,
        totalRevenue: stats.totalRevenue,
        totalPayments: stats.totalPayments,
      });

      return this.paymentMapper.toPaymentStatsDto(stats);
    } catch (error: any) {
      this.logger.error("Get payment stats error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async processRefund(
    paymentId: string,
    refundData?: RefundRequestDto
  ): Promise<void> {
    const context = {
      operation: "processRefund",
      paymentId,
      reason: refundData?.reason,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Processing refund", context);

      if (!Types.ObjectId.isValid(paymentId)) {
        this.logger.warn("Invalid payment ID for refund", context);
        throw new Error(PAYMENT_MESSAGES.INVALID_PAYMENT_ID);
      }

      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        this.logger.warn("Payment not found for refund", context);
        throw new Error(PAYMENT_MESSAGES.PAYMENT_NOT_FOUND);
      }

      if (payment.status !== "success") {
        this.logger.warn("Refund failed - payment not successful", {
          ...context,
          currentStatus: payment.status,
        });
        throw new Error(PAYMENT_MESSAGES.REFUND_NOT_ALLOWED);
      }

      // Update payment status to refunded
      const updatedPayment = await this.paymentRepository.update(paymentId, {
        status: "refunded",
        refundedAt: new Date(),
      });

      if (!updatedPayment) {
        this.logger.error("Refund failed - repository update failed", context);
        throw new Error(PAYMENT_MESSAGES.FAILED_PROCESS_REFUND);
      }

      this.logger.info("Refund processed successfully", {
        ...context,
        amount: payment.amount,
        providerOrderId: payment.providerOrderId,
      });

      // Here would Razorpay refund API call - to be implemet
    } catch (error: any) {
      this.logger.error("Process refund error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  async exportPayments(
    format: "csv" | "excel",
    filters?: any
  ): Promise<{ data: Buffer; filename: string }> {
    const context = {
      operation: "exportPayments",
      format,
      filters,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Exporting payments", context);

      // Get all payments based on filters
      const payments = await this.paymentRepository.findAll({});

      // Convert to CSV/Excel format
      let data: Buffer;
      let filename: string;

      if (format === "csv") {
        const csvData = this.convertToCSV(payments);
        data = Buffer.from(csvData, "utf-8");
        filename = `payments-${new Date().toISOString().split("T")[0]}.csv`;
      } else {
        // simplified excel
        const excelData = this.convertToExcel(payments);
        data = excelData;
        filename = `payments-${new Date().toISOString().split("T")[0]}.xlsx`;
      }

      this.logger.info("Payments exported successfully", {
        ...context,
        paymentsCount: payments.length,
        filename,
      });

      return { data, filename };
    } catch (error: any) {
      this.logger.error("Export payments error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  private convertToCSV(payments: any[]): string {
    const headers = [
      "Payment ID",
      "Order ID",
      "User Name",
      "User Email",
      "Amount",
      "Currency",
      "Status",
      "Payment Provider",
      "Initiated At",
      "Confirmed At",
    ].join(",");

    const rows = payments.map((payment) => {
      const paymentDto = this.paymentMapper.toPaymentResponseDto(payment);
      return [
        paymentDto.providerOrderId,
        paymentDto.orderId,
        paymentDto.userName,
        paymentDto.userEmail,
        paymentDto.amount,
        paymentDto.currency,
        paymentDto.status,
        paymentDto.paymentProvider,
        paymentDto.initiatedAt,
        paymentDto.confirmedAt || "",
      ]
        .map((field) => `"${field}"`)
        .join(",");
    });

    return [headers, ...rows].join("\n");
  }

  private convertToExcel(payments: any[]): Buffer {
    const csvData = this.convertToCSV(payments);
    return Buffer.from(csvData, "utf-8");
  }
}
