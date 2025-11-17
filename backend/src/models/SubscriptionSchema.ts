import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubscription extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  durationMonths: number;
  commissionRate: number;
  features: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    price: {
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
      default: 10, // Default commission rate
    },
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
SubscriptionSchema.index({ status: 1, createdAt: -1 });
SubscriptionSchema.index({ slug: 1 });

export default mongoose.model<ISubscription>(
  'Subscription',
  SubscriptionSchema
);
