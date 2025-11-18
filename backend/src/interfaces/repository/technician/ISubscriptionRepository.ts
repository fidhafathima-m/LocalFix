import { Types } from 'mongoose';
import { ITechnicianSubscription } from '../../../models/technician/TechnicianSubscriptionSchema';

export interface CreateSubscriptionData {
  technicianId: string | Types.ObjectId;
  subscriptionPlanId: string | Types.ObjectId;
  amount: number;
  durationMonths: number;
  commissionRate: number;
  paymentMethod: 'razorpay' | 'wallet';
  transactionId: string;
  status?: 'active' | 'expired' | 'cancelled';
}

export interface ITechnicianSubscriptionRepository {
  create(
    subscriptionData: CreateSubscriptionData
  ): Promise<ITechnicianSubscription>;
  findById(
    subscriptionId: string | Types.ObjectId
  ): Promise<ITechnicianSubscription | null>;
  findByTechnicianId(
    technicianId: string | Types.ObjectId
  ): Promise<ITechnicianSubscription[]>;
  findActiveSubscription(
    technicianId: string | Types.ObjectId
  ): Promise<ITechnicianSubscription | null>;
  updateStatus(
    subscriptionId: string | Types.ObjectId,
    status: 'active' | 'expired' | 'cancelled'
  ): Promise<ITechnicianSubscription | null>;
  findByTransactionId(
    transactionId: string
  ): Promise<ITechnicianSubscription | null>;
  countActiveSubscriptions(): Promise<number>;
  findExpiringSubscriptions(days: number): Promise<ITechnicianSubscription[]>;
}
