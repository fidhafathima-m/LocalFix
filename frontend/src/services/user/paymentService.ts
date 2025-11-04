/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../utils/axiosConfig";

export interface CreatePaymentRequest {
  bookingId: string;
  userId: string;
  amount: number;
  currency?: string;
  type: 'service' | 'subscription' | 'spare_part';
  sparePartId?: string;
}

export interface PaymentResponse {
  _id: string;
  bookingId: string;
  userId: string;
  paymentProvider: string;
  providerOrderId: string;
  amount: number;
  currency: string;
  type: string;
  status: string;
  razorpayOrder: {
    id: string;
    amount: number;
    currency: string;
    key: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  error?: string;
}

export const paymentService = {
  async createPaymentOrder(data: CreatePaymentRequest): Promise<ApiResponse<PaymentResponse>> {
    const response = await api.post<ApiResponse<PaymentResponse>>("/payments/create-order", data);
    return response.data;
  },

  async verifyPayment(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): Promise<ApiResponse<any>> {
    const response = await api.post<ApiResponse<any>>("/payments/verify", {
      razorpay_payment_id: razorpayPaymentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_signature: razorpaySignature,
    });
    return response.data;
  },
};