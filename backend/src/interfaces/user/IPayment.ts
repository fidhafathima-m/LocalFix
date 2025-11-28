export interface CreatePaymentRequest {
  bookingId: string;
  userId: string;
  amount: number;
  currency?: string;
  type: 'service' | 'subscription' | 'spare_part';
  sparePartId?: string;
}

export interface PaymentResponseDto {
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

export interface IdempotencyRecord {
  key: string;
  response: any;
  statusCode: number;
  createdAt: Date;
}
