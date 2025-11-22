import { TECHNICIAN_SUBSCRIPTION_ROUTES } from "../../routes/technicianSubscriptionRoutes";
import api from "../../utils/axiosConfig";

export interface Subscription {
  _id: string;
  technicianId: string;
  subscriptionPlanId: string;
  subscriptionPlan: {
    name: string;
    features: string[];
  };
  amount: number;
  durationMonths: number;
  commissionRate: number;
  startDate: string;
  endDate: string;
  paymentMethod: "razorpay" | "wallet";
  transactionId: string;
  status: "active" | "expired" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface CreateSubscriptionRequest {
  subscriptionPlanId: string;
  paymentMethod: "razorpay" | "wallet";
  transactionId: string;
}

export interface CancelSubscriptionRequest {
  subscriptionId: string;
  reason?: string;
}

export class TechnicianManagementSubscriptionService {
  // Admin: Get all technician subscriptions
  static async getTechnicianSubscriptions(filters: {
    page?: number;
    limit?: number;
    status?: string;
    technicianId?: string;
    subscriptionPlanId?: string;
  }) {
    const response = await api.get(
      TECHNICIAN_SUBSCRIPTION_ROUTES.GET_TECHNICIAN_SUBSCRIPTIONS,
      {
        params: filters,
      }
    );
    return response.data;
  }

  // Admin: Get subscription statistics
  static async getSubscriptionStats() {
    const response = await api.get(
      TECHNICIAN_SUBSCRIPTION_ROUTES.GET_SUBSCRIPTION_STATS
    );
    return response.data;
  }

  // Admin: Get subscription by ID
  static async getSubscriptionById(subscriptionId: string) {
    const response = await api.get(
      TECHNICIAN_SUBSCRIPTION_ROUTES.GET_SUBSCRIPTION_BY_ID(subscriptionId)
    );
    return response.data;
  }

  // Admin: Get subscriptions by technician
  static async getSubscriptionsByTechnician(
    technicianId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const response = await api.get(
      TECHNICIAN_SUBSCRIPTION_ROUTES.GET_SUBSCRIPTION_BY_TECHNICIAN(
        technicianId
      ),
      {
        params: { page, limit },
      }
    );
    return response.data;
  }

  // Admin: Update subscription status
  static async updateSubscriptionStatus(
    subscriptionId: string,
    status: string,
    reason?: string
  ) {
    const response = await api.patch(
      TECHNICIAN_SUBSCRIPTION_ROUTES.UPDATE_SUBSCRIPTION_STATUS(subscriptionId),
      {
        status,
        reason,
      }
    );
    return response.data;
  }

  static async getTechnicianCurrentSubscription(technicianId: string) {
    const response = await api.get(
      TECHNICIAN_SUBSCRIPTION_ROUTES.GET_TECHNICIAN_CURRENT_SUBSCRIPTION(
        technicianId
      )
    );
    return response.data;
  }
}
