import { Types } from 'mongoose';
import { ITechnicianSubscription } from '../../../models/technician/TechnicianSubscriptionSchema';

export interface SubscriptionFilters {
  page: number;
  limit: number;
  status?: string;
  technicianId?: string;
  subscriptionPlanId?: string;
}

export interface SubscriptionStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface CreateSubscriptionData {
  technicianId: Types.ObjectId;
  subscriptionPlanId: Types.ObjectId;
  amount: number;
  durationMonths: number;
  commissionRate: number;
  startDate: Date;
  endDate: Date;
  paymentMethod: 'razorpay' | 'wallet';
  transactionId: string;
  status: 'active' | 'expired' | 'cancelled';
}

export interface SubscriptionListResult {
  subscriptions: ITechnicianSubscription[];
  total: number;
}

export interface ITechnicianSubscriptionRepository {
  // Subscription operations
  findSubscriptions(
    filters: SubscriptionFilters
  ): Promise<SubscriptionListResult>;

  findSubscriptionById(id: string): Promise<ITechnicianSubscription | null>;

  findSubscriptionsByTechnician(
    technicianId: string,
    page: number,
    limit: number
  ): Promise<SubscriptionListResult>;

  findCurrentSubscription(
    technicianId: string
  ): Promise<ITechnicianSubscription | null>;

  createSubscription(
    data: CreateSubscriptionData
  ): Promise<ITechnicianSubscription>;

  updateSubscriptionStatus(
    id: string,
    status: string,
    reason?: string
  ): Promise<ITechnicianSubscription | null>;

  // Subscription plan operations
  findSubscriptionPlanById(id: string): Promise<any | null>;

  // Statistics
  getSubscriptionStats(): Promise<SubscriptionStats>;

  // Utility methods
  updateExpiredSubscriptions(): Promise<void>;
}
