/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  IPayment,
  PaymentStats,
  PaymentsResponse,
} from "../../interface/admin/IPayment";
import { adminAPI } from "../common/adminApi";

export class PaymentManagementService {
  static async getPayments(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string,
    startDate?: string,
    endDate?: string
  ): Promise<PaymentsResponse> {
    try {
      const response = await adminAPI.getPayments(
        page,
        limit,
        search,
        status,
        startDate,
        endDate
      );
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error in getPayments:", error);
      throw this.handleError(error, "Failed to get payments");
    }
  }

  static async getPaymentById(paymentId: string): Promise<IPayment> {
    try {
      const response = await adminAPI.getPaymentById(paymentId);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error getting payment by ID:", error);
      throw this.handleError(error, "Failed to get payment");
    }
  }

  static async getPaymentStats(): Promise<PaymentStats> {
    try {
      const response = await adminAPI.getPaymentStats();

      // Extract stats from the nested response structure
      const result = this.handleResponse(response);

      // The stats should be directly in the result, not nested under stats
      return result.stats || result;
    } catch (error: any) {
      console.error("Error getting payment stats:", error);
      throw this.handleError(error, "Failed to get payment statistics");
    }
  }

  static async processRefund(
    paymentId: string,
    reason?: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await adminAPI.processRefund(paymentId, reason);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error processing refund:", error);
      throw this.handleError(error, "Failed to process refund");
    }
  }

  static async exportPayments(
    format: "csv" | "excel" = "csv",
    filters?: any
  ): Promise<Blob> {
    try {
      const response = await adminAPI.exportPayments(format, filters);
      return response.data;
    } catch (error: any) {
      console.error("Error exporting payments:", error);
      throw this.handleError(error, "Failed to export payments");
    }
  }

  private static handleResponse(response: any) {
    if (response.success === false) {
      throw new Error(response.message || "Operation failed");
    }

    // Handle nested data structure: response.data.data
    if (response.data && response.data.data) {
      return response.data.data;
    }

    // Handle direct data structure: response.data
    if (response.data) {
      return response.data;
    }

    return response;
  }

  private static handleError(error: any, defaultMessage: string) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(defaultMessage);
  }
}
