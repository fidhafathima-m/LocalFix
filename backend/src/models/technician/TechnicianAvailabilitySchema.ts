import mongoose, { Schema, Document } from "mongoose";

export interface ITimeSlot {
  start: string; // "09:00"
  end: string; // "10:00"
  status: "available" | "booked" | "blocked";
  bookingId?: mongoose.Types.ObjectId;
}

export interface ITechnicianAvailability extends Document {
  technicianId: mongoose.Types.ObjectId;
  date: Date;
  timeSlots: ITimeSlot[];
  isRecurring: boolean;
  slotRuleId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new Schema<ITimeSlot>({
  start: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  end: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  },
  status: {
    type: String,
    enum: ["available", "booked", "blocked"],
    default: "available",
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: "Booking",
  },
});

const TechnicianAvailabilitySchema = new Schema<ITechnicianAvailability>(
  {
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    timeSlots: [TimeSlotSchema],
    isRecurring: {
      type: Boolean,
      default: false,
    },
    slotRuleId: {
      type: Schema.Types.ObjectId,
      ref: "SlotRule",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
TechnicianAvailabilitySchema.index({ technicianId: 1, date: 1 });

export default mongoose.model<ITechnicianAvailability>(
  "TechnicianAvailability",
  TechnicianAvailabilitySchema
);
