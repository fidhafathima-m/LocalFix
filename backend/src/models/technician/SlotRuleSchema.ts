import mongoose, { Schema, Document } from "mongoose";
import { RRule, RRuleSet, rrulestr } from "rrule";

export interface ISlotRule extends Document {
  technicianId?: mongoose.Types.ObjectId;
  name: string;

  // RRule configuration for recurrence
  rruleString: string;

  // Time slot configuration
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  slotDurationMinutes: number;

  // Booking constraints
  bookingBufferBeforeMinutes: number;
  bookingBufferAfterMinutes: number;
  maxBookingsPerSlot: number;

  // Effective period
  effectiveFrom: Date;
  effectiveTo?: Date;
  isActive: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;

  // Helper methods
  generateSlotsForDate(date: Date): ITimeSlot[];
  getOccurrencesBetween(start: Date, end: Date): Date[];
}

export interface ITimeSlot {
  start: Date;
  end: Date;
  status: "available" | "booked" | "blocked";
  bookingId?: mongoose.Types.ObjectId;
}

const SlotRuleSchema = new Schema<ISlotRule>(
  {
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    rruleString: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    slotDurationMinutes: {
      type: Number,
      default: 60,
      min: 15,
      max: 480,
    },
    bookingBufferBeforeMinutes: {
      type: Number,
      default: 0,
    },
    bookingBufferAfterMinutes: {
      type: Number,
      default: 0,
    },
    maxBookingsPerSlot: {
      type: Number,
      default: 1,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveTo: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Instance methods
SlotRuleSchema.methods.generateSlotsForDate = function (
  date: Date
): ITimeSlot[] {
  const slots: ITimeSlot[] = [];
  const [startHour, startMinute] = this.startTime.split(":").map(Number);
  const [endHour, endMinute] = this.endTime.split(":").map(Number);

  const slotStart = new Date(date);
  slotStart.setHours(startHour, startMinute, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(endHour, endMinute, 0, 0);

  let currentSlotStart = new Date(slotStart);

  while (currentSlotStart < dayEnd) {
    const currentSlotEnd = new Date(currentSlotStart);
    currentSlotEnd.setMinutes(
      currentSlotEnd.getMinutes() + this.slotDurationMinutes
    );

    if (currentSlotEnd > dayEnd) break;

    slots.push({
      start: new Date(currentSlotStart),
      end: new Date(currentSlotEnd),
      status: "available",
    });

    currentSlotStart = currentSlotEnd;
  }

  return slots;
};

SlotRuleSchema.methods.getOccurrencesBetween = function (
  start: Date,
  end: Date
): Date[] {
  try {
    const rule = rrulestr(this.rruleString);
    return rule.between(start, end, true);
  } catch (error) {
    console.error("Error parsing RRule:", error);
    return [];
  }
};

export default mongoose.model<ISlotRule>("SlotRule", SlotRuleSchema);
