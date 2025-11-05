import api from "../../utils/axiosConfig";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  error?: string;
}

export interface OrderResponse {
  _id: string;
  orderCode: string;
  bookingId: string;
  userId: string;
  technicianId: {
    _id: string;
    displayName: string;
    profilePictureUrl?: string;
    averageRating: number;
    ratingCount: number;
    skills: string[];
  };
  serviceName: string;
  problemDescription?: string;
  scheduledAt: string;
  timeSlot: string;
  address: {
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  status: string;
  payment: {
    method: string;
    amount: number;
    status: string;
    transactionId?: string;
    paidAt?: string;
  };
  orderItems: Array<{
    _id: string;
    customName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    status: string;
  }>;
  totalAmount: number;
  technicianRating?: number;
  userReview?: string;
  history: Array<{
    status: string;
    description: string;
    updatedBy: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  orders: OrderResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateOrderRequest {
  bookingId: string;
  paymentData: {
    method: 'online' | 'cod';
    amount: number;
    status: 'pending' | 'paid' | 'failed';
    transactionId?: string;
    paidAt?: Date;
  };
}

export const orderService = {
  async createOrderFromBooking(data: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> {
    const response = await api.post<ApiResponse<OrderResponse>>("/orders/create-from-booking", data);
    return response.data;
  },

  async getUserOrders(page: number = 1, limit: number = 10): Promise<ApiResponse<OrderListResponse>> {
    const response = await api.get<ApiResponse<OrderListResponse>>("/orders", {
      params: { page, limit }
    });
    return response.data;
  },

  async getOrderById(orderId: string): Promise<ApiResponse<OrderResponse>> {
    const response = await api.get<ApiResponse<OrderResponse>>(`/orders/${orderId}`);
    return response.data;
  },

  async cancelOrder(orderId: string, reason: string): Promise<ApiResponse<OrderResponse>> {
    const response = await api.post<ApiResponse<OrderResponse>>(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  async downloadInvoice(orderId: string): Promise<Blob> {
    const response = await api.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  },

  async submitReview(orderId: string, rating: number, review: string): Promise<ApiResponse<OrderResponse>> {
    const response = await api.post<ApiResponse<OrderResponse>>(`/orders/${orderId}/review`, {
      rating,
      review
    });
    return response.data;
  },

  async rescheduleOrder(orderId: string, newDate: string, newTimeSlot: string): Promise<ApiResponse<OrderResponse>> {
    const response = await api.post<ApiResponse<OrderResponse>>(`/orders/${orderId}/reschedule`, {
      newDate,
      newTimeSlot
    });
    return response.data;
  }
};