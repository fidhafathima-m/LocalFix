/* eslint-disable @typescript-eslint/no-explicit-any */
// services/technician/technicianOrderService.ts
import apiClient from "../../utils/axiosConfig";
import toast from "react-hot-toast";

export interface TechnicianOrderUser {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface TechnicianOrderAddress {
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface TechnicianOrder {
  _id: string;
  orderCode: string;
  userId: TechnicianOrderUser | string;
  serviceName: string;
  problemDescription: string;
  address: TechnicianOrderAddress;
  scheduledAt: string;
  timeSlot: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded' | 'accepted' | 'on_the_way';
  totalAmount: number;
  payment: {
    method: 'online' | 'cod';
    amount: number;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    transactionId?: string;
    paidAt?: string;
  };
  history: Array<{
    status: string;
    description: string;
    updatedBy: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianOrderListResponse {
  success: boolean;
  message: string;
  data: {
    orders: TechnicianOrder[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface TechnicianOrderStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  monthlyEarnings: number;
}

export interface TechnicianOrderStatsResponse {
  success: boolean;
  message: string;
  data: TechnicianOrderStats;
}

export interface UpdateOrderStatusRequest {
  status: string;
  reason?: string;
}

class TechnicianOrderService {
  // In technicianOrderService.ts - simpler regex approach
// In technicianOrderService.ts - update the parsing to include fullName
async getTechnicianOrders(page: number = 1, limit: number = 10): Promise<TechnicianOrderListResponse> {
  try {
    const response = await apiClient.get<TechnicianOrderListResponse>(
      `/technician/orders?page=${page}&limit=${limit}`
    );

     console.log("RAW API RESPONSE:", JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      // Parse stringified userId in each order
      const orders = response.data.data.orders.map((order: any) => {
        if (typeof order.userId === 'string') {
          try {
            // Simple regex extraction for the specific format
            const phoneMatch = order.userId.match(/phone:\s*'([^']+)'/);
            const emailMatch = order.userId.match(/email:\s*'([^']+)'/);
            const idMatch = order.userId.match(/_id:\s*new ObjectId\('([^']+)'\)/);
            const fullNameMatch = order.userId.match(/fullName:\s*'([^']+)'/);
            
            if (phoneMatch || emailMatch) {
              order.userId = {
                _id: idMatch ? idMatch[1] : '',
                fullName: fullNameMatch ? fullNameMatch[1] : 'Customer', // Use fullName if available
                email: emailMatch ? emailMatch[1] : '',
                phone: phoneMatch ? phoneMatch[1] : ''
              };
            }
          } catch (error) {
            console.error('Error parsing userId:', error);
            // Keep as string if parsing fails
          }
        }
        
        return order;
      });
      
      return {
        ...response.data,
        data: {
          ...response.data.data,
          orders
        }
      };
    }
    return response.data;
  } catch (error: any) {
    console.error('Error fetching technician orders:', error);
    const errorMessage = error.response?.data?.message || 'Failed to fetch orders';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
}
  // Get order by ID
  async getOrderById(orderId: string): Promise<{ success: boolean; data: TechnicianOrder; message: string }> {
    try {
      const response = await apiClient.get<{ success: boolean; data: TechnicianOrder; message: string }>(
        `/technician/orders/${orderId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch order';
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
        reason
      };

      const response = await apiClient.patch<{ success: boolean; data: TechnicianOrder; message: string }>(
        `/technician/orders/${orderId}/status`, 
        updateData
      );
      
      if (response.data.success) {
        toast.success(`Order status updated to ${status}`);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update order status';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Get technician order stats
  async getTechnicianStats(): Promise<TechnicianOrderStatsResponse> {
    try {
      const response = await apiClient.get<TechnicianOrderStatsResponse>(
        '/technician/orders/stats'
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching technician stats:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch stats';
      // Don't show toast for stats errors as it might be too frequent
      throw new Error(errorMessage);
    }
  }

  // Optional: Get orders by status
  async getOrdersByStatus(status: string, page: number = 1, limit: number = 10): Promise<TechnicianOrderListResponse> {
    try {
      const response = await apiClient.get<TechnicianOrderListResponse>(
        `/technician/orders?status=${status}&page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching orders by status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch orders';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Optional: Get upcoming orders (today's orders)
  async getUpcomingOrders(): Promise<TechnicianOrderListResponse> {
    try {
      const response = await apiClient.get<TechnicianOrderListResponse>(
        '/technician/orders?status=pending,confirmed,in_progress&limit=10'
      );
      return response.data;
    } catch (error: any) {
      console.error('Error fetching upcoming orders:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch upcoming orders';
      throw new Error(errorMessage);
    }
  }
}

export const technicianOrderService = new TechnicianOrderService();