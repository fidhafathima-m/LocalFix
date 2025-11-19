/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  DashboardOverview,
  RevenueTrend,
  TopTechnician,
  CustomerSatisfaction,
  PaymentMethod,
  GrowthMetrics,
  DashboardResponse,
} from "../../interface/admin/IDashboard";
import { adminAPI } from "../common/adminApi";

export class DashboardService {
  static async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const response = await adminAPI.getDashboardOverview();
      return this.handleResponse<DashboardOverview>(response, "overview");
    } catch (error) {
      throw this.handleError(error, "Failed to get dashboard overview");
    }
  }

  static async getRevenueTrend(period?: string): Promise<RevenueTrend[]> {
    try {
      const response = await adminAPI.getRevenueTrend(period);
      return this.handleResponse<RevenueTrend[]>(response, "revenueTrend");
    } catch (error) {
      throw this.handleError(error, "Failed to get revenue trend");
    }
  }

  static async getTopTechnicians(limit?: number): Promise<TopTechnician[]> {
    try {
      const response = await adminAPI.getTopTechnicians(limit);
      return this.handleResponse<TopTechnician[]>(response, "topTechnicians");
    } catch (error) {
      throw this.handleError(error, "Failed to get top technicians");
    }
  }

  static async getCustomerSatisfaction(): Promise<CustomerSatisfaction[]> {
    try {
      const response = await adminAPI.getCustomerSatisfaction();
      return this.handleResponse<CustomerSatisfaction[]>(
        response,
        "customerSatisfaction"
      );
    } catch (error) {
      throw this.handleError(error, "Failed to get customer satisfaction data");
    }
  }

  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await adminAPI.getPaymentMethods();
      return this.handleResponse<PaymentMethod[]>(response, "paymentMethods");
    } catch (error) {
      throw this.handleError(error, "Failed to get payment methods data");
    }
  }

  static async getGrowthMetrics(): Promise<GrowthMetrics[]> {
    try {
      const response = await adminAPI.getGrowthMetrics();
      return this.handleResponse<GrowthMetrics[]>(response, "growthMetrics");
    } catch (error) {
      throw this.handleError(error, "Failed to get growth metrics");
    }
  }

  static async getCompleteDashboard(): Promise<DashboardResponse> {
    try {
      const response = await adminAPI.getCompleteDashboard();
      return this.handleResponse<DashboardResponse>(response, "complete");
    } catch (error) {
      throw this.handleError(error, "Failed to get complete dashboard data");
    }
  }

  private static handleResponse<T>(response: any, endpoint: string): T {
    // Check if response indicates failure
    if (response?.data?.success === false) {
      throw new Error(response.data.message || "Operation failed");
    }

    // Extract data from the nested structure: response.data.data.endpoint
    const responseData = response?.data?.data;

    if (!responseData) {
      console.warn(`No data found in response for ${endpoint}`);
      return this.getDefaultValue(endpoint) as T;
    }

    // Handle specific endpoints based on the actual API response structure
    switch (endpoint) {
      case "overview":
        // For overview, it's response.data.data.overview
        return (responseData.overview || {}) as T;

      case "growthMetrics":
        // For growthMetrics, it's response.data.data.growthMetrics array
        return (responseData.growthMetrics || []) as T;

      case "revenueTrend":
        // For revenueTrend, it's response.data.data.revenueTrend array
        return (responseData.revenueTrend || []) as T;

      case "topTechnicians":
        // For topTechnicians, it might be response.data.data.topTechnicians array
        return (responseData.topTechnicians || []) as T;

      case "customerSatisfaction":
        // For customerSatisfaction, it might be response.data.data.customerSatisfaction array
        return (responseData.customerSatisfaction || []) as T;

      case "paymentMethods":
        // For paymentMethods, it might be response.data.data.paymentMethods array
        return (responseData.paymentMethods || []) as T;

      case "complete":
        // For complete dashboard, return the entire data object
        return responseData as T;

      default:
        return responseData as T;
    }
  }

  private static getDefaultValue(endpoint: string): any {
    switch (endpoint) {
      case "overview":
        return {
          totalRevenue: 0,
          totalBookings: 0,
          totalUsers: 0,
          totalTechnicians: 0,
          growthMetrics: {
            revenueGrowth: 0,
            bookingsGrowth: 0,
            usersGrowth: 0,
            techniciansGrowth: 0,
            averageOrderValueGrowth: 0,
          },
        };
      case "growthMetrics":
      case "revenueTrend":
      case "topTechnicians":
      case "customerSatisfaction":
      case "paymentMethods":
        return [];
      case "complete":
        return {};
      default:
        return null;
    }
  }

  private static handleError(error: any, defaultMessage: string) {
    console.error("Dashboard Service Error:", error);

    if (error instanceof Error) {
      return error;
    }

    if (error && error.message) {
      return new Error(error.message);
    }

    return new Error(defaultMessage);
  }
}
