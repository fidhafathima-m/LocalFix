// models/BookingSchema.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  bookingCode: string;
  userId: Types.ObjectId;
  technicianId: Types.ObjectId;
  serviceId?: Types.ObjectId;
  categoryId?: Types.ObjectId;
  serviceName: string;
  brand: string;
  addressId: Types.ObjectId;
  scheduledAt: Date;
  timeSlot: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'on_the_way' | 'completed' | 'cancelled' | 'rescheduled';
  amount: number;
  itemsAmount: number;
  totalAmount: number;
  items?: Array<{
    itemId: Types.ObjectId;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  notes: string;
  cancellation?: {
    reason: string;
    cancelledBy: 'user' | 'technician' | 'admin';
    cancelledAt: Date;
    refundAmount?: number;
  };
  history: Array<{
    status: string;
    by: string;
    reason?: string;
    at: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>({
  bookingCode: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  technicianId: {
    type: Schema.Types.ObjectId,
    ref: 'Technician',
    required: true,
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
  serviceName: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  addressId: {
    type: Schema.Types.ObjectId,
    ref: 'UserAddress',
    required: true,
  },
  scheduledAt: {
    type: Date,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in_progress', 'on_the_way', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  itemsAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  items: [{
    itemId: {
      type: Schema.Types.ObjectId,
      ref: 'SparePart',
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  }],
  notes: {
    type: String,
    default: '',
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: String,
      enum: ['user', 'technician', 'admin'],
    },
    cancelledAt: Date,
    refundAmount: Number,
  },
  history: [{
    status: {
      type: String,
      required: true,
    },
    by: {
      type: String,
      required: true,
    },
    reason: String,
    at: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Fixed pre-save hook for booking code generation
bookingSchema.pre('save', async function (next) {
  if (this.isNew && !this.bookingCode) {
    try {
      // Get the count of existing bookings
      const BookingModel = mongoose.model<IBooking>('Booking');
      const count = await BookingModel.countDocuments();
      
      // Generate booking code with padding
      this.bookingCode = `BK${String(count + 1).padStart(6, '0')}`;
      
      // Add initial history entry
      if (this.history.length === 0) {
        this.history.push({
          status: 'pending',
          by: 'system',
          at: new Date(),
        });
      }
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

export default mongoose.model<IBooking>('Booking', bookingSchema);