import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITechnicianSubscription extends Document {
  _id: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const TechnicianSubscriptionSchema: Schema = new Schema(
  {
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'Technician',
      required: true,
    },
    subscriptionPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    durationMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'wallet'],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
TechnicianSubscriptionSchema.index({ technicianId: 1, status: 1 });
TechnicianSubscriptionSchema.index({ endDate: 1 });
TechnicianSubscriptionSchema.index({ transactionId: 1 }, { unique: true });
TechnicianSubscriptionSchema.index({ createdAt: -1 });

export default mongoose.model<ITechnicianSubscription>(
  'TechnicianSubscription',
  TechnicianSubscriptionSchema
);
