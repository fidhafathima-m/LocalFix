import { AddressData } from "../admin/IPaymentManagement";

export interface PaymentResponseDto {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  paymentProvider: 'razorpay' | 'stripe' | 'paypal';
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  type: 'service' | 'subscription' | 'spare_part';
  serviceName?: string;
  orderId: string;        
  bookingCode?: string;  
  status: 'initiated' | 'pending' | 'success' | 'failed' | 'refunded';
  initiatedAt: string;
  confirmedAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
  address?: AddressData;
}

export interface PaymentListResponseDto {
  payments: PaymentResponseDto[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaymentStatsDto {
  totalRevenue: number;
  platformCommission: number;
  pendingPayments: number;
  failedPayments: number;
  totalPayments: number;
  successRate: number;
}

export interface RefundRequestDto {
  reason?: string;
}