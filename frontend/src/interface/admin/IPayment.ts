export interface AddressData {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

export interface IPayment {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  userEmail: string;
  paymentProvider: "razorpay" | "stripe" | "paypal";
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  type: "service" | "subscription" | "spare_part";
  serviceName?: string;
  orderId: string;
  status: "initiated" | "pending" | "success" | "failed" | "refunded";
  initiatedAt: string;
  confirmedAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
  address: AddressData;
  bookingCode: string;
  refundReason: string;
  refundAmount: number;
}

export interface PaymentStats {
  totalRevenue: number;
  platformCommission: number;
  pendingPayments: number;
  failedPayments: number;
  totalPayments: number;
}

export interface PaymentsResponse {
  payments: IPayment[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaymentStatsResponse {
  stats: PaymentStats;
}
