import { Types } from 'mongoose';

export interface SubscriptionDto {
  _id: string;
  technicianId: string;
  subscriptionPlanId: string;
  amount: number;
  durationMonths: number;
  commissionRate: number;
  startDate: Date;
  endDate: Date;
  paymentMethod: 'razorpay' | 'wallet';
  transactionId: string;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  technician?: {
    displayName: string;
    email: string;
    phone: string;
    profilePictureUrl?: string;
  };
  subscriptionPlan?: {
    name: string;
    description: string;
    price: number;
    durationMonths: number;
    features: string[];
  };
}

export interface SubscriptionStatsDto {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  cancelledSubscriptions: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface SubscriptionListResponseDto {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    subscriptions: SubscriptionDto[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface SubscriptionResponseDto {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    subscription: SubscriptionDto | null;
  };
}

export interface SubscriptionStatsResponseDto {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    stats: SubscriptionStatsDto;
  };
}

export interface CreateSubscriptionRequestDto {
  subscriptionPlanId: string;
  paymentMethod: 'razorpay' | 'wallet';
  transactionId: string;
}

export interface UpdateSubscriptionStatusRequestDto {
  status: 'active' | 'expired' | 'cancelled';
  reason?: string;
}

export interface CancelSubscriptionRequestDto {
  subscriptionId: string;
  reason?: string;
}
