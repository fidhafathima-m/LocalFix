// models/SlotRuleSchema.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISlotRule extends Document {
  technicianId?: mongoose.Types.ObjectId;
  name: string;
  daysOfWeek: number[]; // 0-6 (Sun-Sat)
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  slotDurationMinutes: number;
  bookingBufferBeforeMinutes: number;
  bookingBufferAfterMinutes: number;
  maxBookingsPerSlot: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SlotRuleSchema = new Schema<ISlotRule>({
  technicianId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: false 
  },
  name: { 
    type: String, 
    required: true 
  },
  daysOfWeek: [{ 
    type: Number, 
    min: 0, 
    max: 6 
  }],
  startTime: { 
    type: String, 
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: { 
    type: String, 
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  slotDurationMinutes: { 
    type: Number, 
    default: 60,
    min: 15,
    max: 480
  },
  bookingBufferBeforeMinutes: { 
    type: Number, 
    default: 0 
  },
  bookingBufferAfterMinutes: { 
    type: Number, 
    default: 0 
  },
  maxBookingsPerSlot: { 
    type: Number, 
    default: 1 
  },
  effectiveFrom: { 
    type: Date, 
    default: Date.now 
  },
  effectiveTo: { 
    type: Date 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: true
});

export default mongoose.model<ISlotRule>('SlotRule', SlotRuleSchema);