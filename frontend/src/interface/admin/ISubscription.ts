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

export interface CreateSubscriptionData {
  name: string;
  price: number;
  durationMonths: number;
  commissionRate: number;
  features?: string[];
  status?: "active" | "inactive";
}

export interface UpdateSubscriptionData {
  name?: string;
  price?: number;
  durationMonths?: number;
  commissionRate?: number;
  features?: string[];
  status?: "active" | "inactive";
}
