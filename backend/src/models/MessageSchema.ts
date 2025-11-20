import mongoose, { Schema, Document } from 'mongoose';

export interface IMessageDocument extends Document {
  orderId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderType: 'user' | 'technician';
  receiverId: mongoose.Types.ObjectId;
  receiverType: 'user' | 'technician';
  message: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  timestamp: Date;
  isRead: boolean;
  readAt?: Date;
  metadata?: {
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
  };
}

const messageSchema = new Schema<IMessageDocument>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    senderType: {
      type: String,
      enum: ['user', 'technician'],
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    receiverType: {
      type: String,
      enum: ['user', 'technician'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    metadata: {
      fileUrl: String,
      fileName: String,
      fileSize: Number,
      mimeType: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better query performance
messageSchema.index({ orderId: 1, timestamp: 1 });
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ isRead: 1 });

export const Message = mongoose.model<IMessageDocument>(
  'Message',
  messageSchema
);
