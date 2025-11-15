/* eslint-disable @typescript-eslint/no-explicit-any */

import { adminAPI } from "../common/adminApi";

export interface ReportRequest {
  startDate?: Date | null;
  endDate?: Date | null;
  format: "pdf" | "csv" | "excel";
  reportType?: "dashboard" | "financial" | "customer" | "technician";
}

export interface ReportResponse {
  success: boolean;
  message: string;
  downloadUrl?: string;
  data?: any;
}

export class ReportService {
  static async generateReport(request: ReportRequest): Promise<ReportResponse> {
    try {
      const response = await adminAPI.generateReport(request);

      if (response.data && response.data.downloadUrl) {
        // Handle the file download
        const downloadResult = await this.downloadFile(
          response.data.downloadUrl,
          request.format
        );
        return {
          ...response.data,
          ...downloadResult,
        };
      }

      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to generate report");
    }
  }

  private static async downloadFile(
    downloadUrl: string,
    format: string
  ): Promise<{ blob: Blob; filename: string }> {
    try {
      const response = await fetch(downloadUrl);
      const blob = await response.blob();

      const filename = `report-${
        new Date().toISOString().split("T")[0]
      }.${format}`;

      return { blob, filename };
    } catch (error) {
      throw new Error(
        `Failed to download file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  static async generateFinancialReport(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const response = await adminAPI.generateFinancialReport(
        startDate,
        endDate
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to generate financial report");
    }
  }

  static async generateCustomerReport(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const response = await adminAPI.generateCustomerReport(
        startDate,
        endDate
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to generate customer report");
    }
  }

  static async generateTechnicianReport(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    try {
      const response = await adminAPI.generateTechnicianReport(
        startDate,
        endDate
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to generate technician report");
    }
  }

  private static handleResponse(response: any) {
    if (response.success === false) {
      throw new Error(response.message || "Operation failed");
    }

    if (response.data && response.data.data) {
      return response.data.data;
    }

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
