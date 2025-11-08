/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminAPI } from "../common/adminApi";

export class OrderManagementService {
  static async getOrders(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: string
  ) {
    try {
      const response = await adminAPI.getOrders(page, limit, search, status);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error in getOrders:", error);
      throw this.handleError(error, "Failed to get orders");
    }
  }

  static async getOrderById(orderId: string) {
    try {
      const response = await adminAPI.getOrderById(orderId);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error getting order by ID:", error);
      throw this.handleError(error, "Failed to get order by ID");
    }
  }

  static async getOrderStats() {
    try {
      const response = await adminAPI.getOrderStats();
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error getting order stats:", error);
      throw this.handleError(error, "Failed to get order stats");
    }
  }

  static async updateOrderStatus(orderId: string, status: string, reason?: string) {
    try {
      const response = await adminAPI.updateOrderStatus(orderId, status, reason);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      throw this.handleError(error, "Failed to update order status");
    }
  }

  static async getOrdersByTechnician(technicianId: string, page: number = 1, limit: number = 100) {
    try {
      const response = await adminAPI.getOrdersByTechnician(technicianId, page, limit);
      return this.handleResponse(response);
    } catch (error: any) {
      console.error("Error in getOrdersByTechnician:", error);
      throw this.handleError(error, "Failed to get technician orders");
    }
  }

  private static handleResponse(response: any) {
    if (response.success === false) {
      throw new Error(response.message || "Operation failed");
    }

    if (response.data && response.data.data) {
      return response.data.data;
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