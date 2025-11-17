import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPayment extends Document {
  orderId: Types.ObjectId;
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
  refundReason: string;
  refundAmount: number;
  metadata?: {
    walletRefund?: boolean;
    walletTransactionId?: string;
    newBalance?: number;
    [key: string]: any;
  };
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: false,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paymentProvider: {
      type: String,
      enum: ['razorpay', 'stripe', 'paypal', 'wallet'],
      default: 'razorpay',
    },
    providerOrderId: {
      type: String,
      required: true,
    },
    providerPaymentId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    type: {
      type: String,
      enum: ['service', 'subscription', 'spare_part'],
      required: true,
    },
    sparePartId: {
      type: Schema.Types.ObjectId,
      ref: 'SparePart',
    },
    status: {
      type: String,
      enum: ['initiated', 'pending', 'success', 'failed', 'refunded'],
      default: 'initiated',
    },
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    confirmedAt: {
      type: Date,
    },
    refundedAt: {
      type: Date,
    },
    rawResponse: {
      type: Schema.Types.Mixed,
      default: {},
    },
    refundReason: {
      type: String,
    },
    refundAmount: {
      type: Number,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
