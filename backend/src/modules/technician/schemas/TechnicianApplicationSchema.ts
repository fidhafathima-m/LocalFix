import mongoose, { Schema, Document } from 'mongoose'

export interface ITechnicianApplication extends Document {
  technicianId?: mongoose.Types.ObjectId
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  stepsCompleted: string[]
  personal: Record<string, any>
  identity: Record<string, any>
  skills: Record<string, any>
  availability: Record<string, any>
  bank: Record<string, any>
  agreement: boolean
  submittedAt?: Date
  reviewNotes?: string
  rejectionReason?: string
  resubmittedCount: number
  lastSubmittedAt?: Date
  phone?: string
}

const TechnicianApplicationSchema = new Schema<ITechnicianApplication>(
  {
    technicianId: { type: Schema.Types.ObjectId, ref: 'User' },
    phone: { type: String },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
      default: 'draft',
    },
    stepsCompleted: { type: [String], default: [] },
    personal: { type: Schema.Types.Mixed },
    identity: { type: Schema.Types.Mixed },
    skills: { type: Schema.Types.Mixed },
    availability: { type: Schema.Types.Mixed },
    bank: { type: Schema.Types.Mixed },
    agreement: { type: Boolean, default: false },
    submittedAt: { type: Date },
    reviewNotes: { type: String },
    rejectionReason: { type: String },
    resubmittedCount: { type: Number, default: 0 },
    lastSubmittedAt: { type: Date },
  },
  { timestamps: true }
)

export const TechnicianApplication = mongoose.model<ITechnicianApplication>(
  'TechnicianApplication',
  TechnicianApplicationSchema
)
