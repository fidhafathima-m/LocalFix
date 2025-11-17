import { Document, Types } from 'mongoose';

export interface IPayment extends Document {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  paymentProvider: 'razorpay' | 'stripe' | 'paypal' | 'wallet';
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  type: 'service' | 'subscription' | 'spare_part';
  sparePartId?: Types.ObjectId;
  status: 'initiated' | 'pending' | 'success' | 'failed' | 'refunded';
  initiatedAt: Date;
  confirmedAt?: Date;
  refundedAt?: Date;
  rawResponse: any;
  createdAt: Date;
  updatedAt: Date;
  orderCode?: string;
  userName?: string;
  userEmail?: string;
  serviceName?: string;
  refundReason: string;
  refundAmount: number;
  metadata?: {
    walletRefund?: boolean;
    walletTransactionId?: string;
    newBalance?: number;
    [key: string]: any;
  };
}

export interface IPaymentCreate {
  bookingId: Types.ObjectId;
  userId: Types.ObjectId;
  paymentProvider: 'razorpay' | 'stripe' | 'paypal' | 'wallet';
  providerOrderId: string;
  providerPaymentId?: string;
  amount: number;
  currency: string;
  type: 'service' | 'subscription' | 'spare_part';
  sparePartId?: Types.ObjectId;
  status: 'initiated' | 'pending' | 'success' | 'failed' | 'refunded';
  initiatedAt?: Date;
  confirmedAt?: Date;
  refundedAt?: Date;
  rawResponse?: any;
}

export interface IPaymentUpdate {
  status?: 'initiated' | 'pending' | 'success' | 'failed' | 'refunded';
  providerPaymentId?: string;
  confirmedAt?: Date;
  refundedAt?: Date;
  rawResponse?: any;
  refundReason?: string;
  refundAmount?: number;
  metadata?: {
    walletRefund: boolean;
    walletTransactionId: string | undefined;
    newBalance: number | undefined;
  };
}

export interface AddressData {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}
