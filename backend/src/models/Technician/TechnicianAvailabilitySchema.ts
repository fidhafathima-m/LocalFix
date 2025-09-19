import mongoose, { Schema, Document } from 'mongoose'

interface TimeSlot {
  start: string
  end: string
  status: 'available' | 'booked' | 'blocked'
}

export interface ITechnicianAvailability extends Document {
  technicianId: mongoose.Types.ObjectId
  date: Date
  timeSlots: TimeSlot[]
  isRecurring: boolean
  slotRuleId?: mongoose.Types.ObjectId
}

const TechnicianAvailabilitySchema = new Schema<ITechnicianAvailability>(
  {
    technicianId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    timeSlots: [
      {
        start: { type: String, required: true },
        end: { type: String, required: true },
        status: {
          type: String,
          enum: ['available', 'booked', 'blocked'],
          required: true,
        },
      },
    ],
    isRecurring: { type: Boolean, default: false },
    slotRuleId: { type: Schema.Types.ObjectId, ref: 'SlotRule' },
  },
  { timestamps: true }
)

export const TechnicianAvailability = mongoose.model<ITechnicianAvailability>(
  'TechnicianAvailability',
  TechnicianAvailabilitySchema
)
