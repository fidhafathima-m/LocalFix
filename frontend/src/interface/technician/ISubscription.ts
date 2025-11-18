// interfaces/technician/ISubscription.ts
export interface Subscription {
  id: string;
  name: string;
  slug: string;
  price: number;
  durationMonths: number;
  commissionRate: number;
  features: string[];
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionsResponse {
  subscriptions: Subscription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SubscriptionPurchase {
  _id: string;
  technicianId: string;
  subscriptionPlanId: string | Subscription; // Can be string ID or populated Subscription object
  amount: number;
  paymentMethod: "card" | "wallet" | "razorpay" | "upi";
  transactionId?: string;
  status: "active" | "expired" | "cancelled" | "pending";
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  commissionRate?: number;
  durationMonths?: number;
}
