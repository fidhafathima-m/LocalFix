/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  TechnicianOrder,
  TechnicianOrderListResponse,
  TechnicianOrderStatsResponse,
  UpdateOrderStatusRequest,
} from "../../interface/technician/IOrderService";
import { TECHNICIAN_ROUTES } from "../../routes/technicianRoutes";
import apiClient from "../../utils/axiosConfig";
import toast from "react-hot-toast";

class TechnicianOrderService {
  async getTechnicianOrders(
    page: number = 1,
    limit: number = 10
  ): Promise<TechnicianOrderListResponse> {
    try {
      const response = await apiClient.get<TechnicianOrderListResponse>(
        TECHNICIAN_ROUTES.ORDER.GET_TECHNICIAN_ORDERS(page, limit)
      );

      if (response.data.success) {
        // Parse stringified userId in each order
        const orders = response.data.data.orders.map((order: any) => {
          if (typeof order.userId === "string") {
            try {
              // Simple regex extraction for the specific format
              const phoneMatch = order.userId.match(/phone:\s*'([^']+)'/);
              const emailMatch = order.userId.match(/email:\s*'([^']+)'/);
              const idMatch = order.userId.match(
                /_id:\s*new ObjectId\('([^']+)'\)/
              );
              const fullNameMatch = order.userId.match(/fullName:\s*'([^']+)'/);

              if (phoneMatch || emailMatch) {
                order.userId = {
                  _id: idMatch ? idMatch[1] : "",
                  fullName: fullNameMatch ? fullNameMatch[1] : "Customer",
                  email: emailMatch ? emailMatch[1] : "",
                  phone: phoneMatch ? phoneMatch[1] : "",
                };
              }
            } catch (error) {
              console.error("Error parsing userId:", error);
              // Keep as string if parsing fails
            }
          }

          return order;
        });

        return {
          ...response.data,
          data: {
            ...response.data.data,
            orders,
          },
        };
      }
      return response.data;
    } catch (error: any) {
      console.error("Error fetching technician orders:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch orders";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }
  // Get order by ID
  async getOrderById(
    orderId: string
  ): Promise<{ success: boolean; data: TechnicianOrder; message: string }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: TechnicianOrder;
        message: string;
      }>(TECHNICIAN_ROUTES.ORDER.GET_ORDER_BY_ID(orderId));
      return response.data;
    } catch (error: any) {
      console.error("Error fetching order:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch order";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Update order status
  async updateOrderStatus(
    orderId: string,
    status: string,
    reason?: string
  ): Promise<{ success: boolean; data: TechnicianOrder; message: string }> {
    try {
      const updateData: UpdateOrderStatusRequest = {
        status,
        reason,
      };

      const response = await apiClient.patch<{
        success: boolean;
        data: TechnicianOrder;
        message: string;
      }>(TECHNICIAN_ROUTES.ORDER.UPDATE_ORDER_STATUS(orderId), updateData);

      return response.data;
    } catch (error: any) {
      console.error("Error updating order status:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update order status";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Get technician order stats
  async getTechnicianStats(): Promise<TechnicianOrderStatsResponse> {
    try {
      const response = await apiClient.get<TechnicianOrderStatsResponse>(
        TECHNICIAN_ROUTES.ORDER.GET_TECHNICIAN_STATS()
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching technician stats:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch stats";
      throw new Error(errorMessage);
    }
  }

  // Get orders by status
  async getOrdersByStatus(
    status: string,
    page: number = 1,
    limit: number = 10
  ): Promise<TechnicianOrderListResponse> {
    try {
      const response = await apiClient.get<TechnicianOrderListResponse>(
        TECHNICIAN_ROUTES.ORDER.GET_ORDER_BY_STATUS(status, page, limit)
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching orders by status:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch orders";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async getUpcomingOrders(): Promise<TechnicianOrderListResponse> {
    try {
      const response = await apiClient.get<TechnicianOrderListResponse>(
        TECHNICIAN_ROUTES.ORDER.GET_UPCOMING_ORDERS()
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching upcoming orders:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch upcoming orders";
      throw new Error(errorMessage);
    }
  }
}

export const technicianOrderService = new TechnicianOrderService();
