import mongoose, { Schema, Document } from 'mongoose';

export interface IMessageRoomDocument extends Document {
  orderId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  technicianId: mongoose.Types.ObjectId;

  userSnapshot: {
    fullName: string;
    profilePictureUrl: string;
    phone: string;
  };

  technicianSnapshot: {
    displayName: string;
    profilePictureUrl: string;
    serviceName: string;
    orderStatus?: string;
  };

  isActive: boolean;
  lastMessage?: {
    message: string;
    timestamp: Date;
    senderId: mongoose.Types.ObjectId;
    senderType: 'user' | 'technician';
  };
  unreadCount: {
    user: number;
    technician: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageRoomSchema = new Schema<IMessageRoomDocument>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'Technician',
      required: true,
      index: true,
    },

    userSnapshot: {
      fullName: { type: String, required: true, default: 'Customer' },
      profilePictureUrl: { type: String, default: '' },
      phone: { type: String, default: '' },
    },

    technicianSnapshot: {
      displayName: { type: String, required: true, default: 'Technician' },
      profilePictureUrl: { type: String, default: '' },
      serviceName: { type: String, required: true, default: 'Service' },
      orderStatus: { type: String },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastMessage: {
      message: String,
      timestamp: Date,
      senderId: Schema.Types.ObjectId,
      senderType: {
        type: String,
        enum: ['user', 'technician'],
      },
    },
    unreadCount: {
      user: {
        type: Number,
        default: 0,
      },
      technician: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes
messageRoomSchema.index({ userId: 1, isActive: 1 });
messageRoomSchema.index({ technicianId: 1, isActive: 1 });
messageRoomSchema.index({ orderId: 1, isActive: 1 });

export const MessageRoom = mongoose.model<IMessageRoomDocument>(
  'MessageRoom',
  messageRoomSchema
);
