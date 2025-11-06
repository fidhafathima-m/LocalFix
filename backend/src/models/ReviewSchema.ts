// models/ReviewSchema.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReview extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  technicianId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // One review per order
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: "Technician",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ReviewSchema.index({ technicianId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, orderId: 1 });
ReviewSchema.index({ orderId: 1 }, { unique: true });

export default mongoose.model<IReview>("Review", ReviewSchema);