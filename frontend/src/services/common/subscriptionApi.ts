/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Subscription } from "react-redux";
import type { SubscriptionsResponse } from "../../interface/admin/ISubscription";
import api from "../../utils/axiosConfig";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode: number;
}

const TECHNICIAN_ROUTES = {
  SUBSCRIPTIONS: "/technician/subscriptions",
  SUBSCRIPTION_BY_ID: (id: string) => `/technician/subscriptions/${id}`,
  SUBSCRIPTION_BY_SLUG: (slug: string) =>
    `/technician/subscriptions/slug/${slug}`,
  CURRENT_SUBSCRIPTION: "/technician/subscriptions/current",
  SUBSCRIPTION_HISTORY: "/technician/subscriptions/history",
  SUBSCRIPTION_PURCHASE_BY_ID: (purchaseId: string) =>
    `/technician/subscriptions/purchase/${purchaseId}`,
} as const;

export const technicianSubscriptionAPI = {
  // Get all active subscriptions for technicians
  getSubscriptions: async (): Promise<ApiResponse<SubscriptionsResponse>> => {
    const response = await api.get<ApiResponse<SubscriptionsResponse>>(
      TECHNICIAN_ROUTES.SUBSCRIPTIONS
    );
    return response.data; // Extract the data from Axios response
  },

  // Get subscription by ID
  getSubscriptionById: async (
    subscriptionId: string
  ): Promise<ApiResponse<{ subscription: Subscription }>> => {
    const response = await api.get<ApiResponse<{ subscription: Subscription }>>(
      TECHNICIAN_ROUTES.SUBSCRIPTION_BY_ID(subscriptionId)
    );
    return response.data;
  },

  // Get subscription by slug
  getSubscriptionBySlug: async (
    slug: string
  ): Promise<ApiResponse<{ subscription: Subscription }>> => {
    const response = await api.get<ApiResponse<{ subscription: Subscription }>>(
      TECHNICIAN_ROUTES.SUBSCRIPTION_BY_SLUG(slug)
    );
    return response.data;
  },

  // Get current active subscription
  getCurrentSubscription: async (): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>(
      TECHNICIAN_ROUTES.CURRENT_SUBSCRIPTION
    );
    return response.data;
  },

  // Get subscription history
  getSubscriptionHistory: async (): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>(
      TECHNICIAN_ROUTES.SUBSCRIPTION_HISTORY
    );
    return response.data;
  },

  // Get subscription purchase by ID
  getSubscriptionPurchaseById: async (
    purchaseId: string
  ): Promise<ApiResponse<any>> => {
    const response = await api.get<ApiResponse<any>>(
      TECHNICIAN_ROUTES.SUBSCRIPTION_PURCHASE_BY_ID(purchaseId)
    );
    return response.data;
  },

  // Create Razorpay order for subscription
  createRazorpayOrder: async (
    subscriptionId: string
  ): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>(
      `/technician/subscriptions/${subscriptionId}/payment/razorpay-order`
    );
    return response.data;
  },

  // Process wallet payment for subscription
  processWalletPayment: async (
    subscriptionId: string
  ): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>(
      `/technician/subscriptions/${subscriptionId}/payment/wallet`
    );
    return response.data;
  },

  // Verify payment
  verifyPayment: async (verificationData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
    subscriptionId: string;
    userId: string;
  }): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>(
      "/technician/subscriptions/payment/verify",
      verificationData
    );
    return response.data;
  },
};
