// models/SparePartsRequestSchema.ts
import { Schema, model, Types } from 'mongoose';
import { ISparePartsRequest } from '../interfaces/technician/ISparePartsRequest';

const sparePartRequestItemSchema = new Schema({
  itemId: {
    type: Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
});

const sparePartsRequestHistorySchema = new Schema({
  status: {
    type: String,
    required: true,
  },
  actionBy: {
    type: String,
    enum: ['technician', 'customer', 'system'],
    required: true,
  },
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const sparePartsRequestSchema = new Schema<ISparePartsRequest>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'Technician',
      required: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [sparePartRequestItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    technicianNotes: String,
    customerNotes: String,
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    respondedAt: Date,
    history: [sparePartsRequestHistorySchema],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
sparePartsRequestSchema.index({ orderId: 1 });
sparePartsRequestSchema.index({ technicianId: 1 });
sparePartsRequestSchema.index({ customerId: 1 });
sparePartsRequestSchema.index({ status: 1 });
sparePartsRequestSchema.index({ createdAt: -1 });

export const SparePartsRequest = model<ISparePartsRequest>(
  'SparePartsRequest',
  sparePartsRequestSchema
);
