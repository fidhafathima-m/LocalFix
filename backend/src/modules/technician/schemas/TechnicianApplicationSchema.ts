import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITechnicianApplication extends Document {
  _id: Types.ObjectId;
  technicianId?: Types.ObjectId;
  email: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  stepsCompleted: string[];
  personal: Record<string, any>;
  identity: Record<string, any>;
  skills: Record<string, any>;
  availability: Record<string, any>;
  bank: Record<string, any>;
  documents: Record<string, any>;
  agreement: boolean;
  submittedAt?: Date;
  reviewNotes?: string;
  rejectionReason?: string;
  resubmittedCount: number;
  lastSubmittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TechnicianApplicationSchema = new Schema<ITechnicianApplication>(
  {
    technicianId: { type: Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true, lowercase: true, trim: true },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected'],
      default: 'draft',
    },
    stepsCompleted: { type: [String], default: [] },
    personal: { type: Schema.Types.Mixed, default: {} },
    identity: { type: Schema.Types.Mixed, default: {} },
    skills: { type: Schema.Types.Mixed, default: {} },
    availability: { type: Schema.Types.Mixed, default: {} },
    bank: { type: Schema.Types.Mixed, default: {} },
    documents: { type: Schema.Types.Mixed, default: {} },
    agreement: { type: Boolean, default: false },
    submittedAt: { type: Date },
    reviewNotes: { type: String },
    rejectionReason: { type: String },
    resubmittedCount: { type: Number, default: 0 },
    lastSubmittedAt: { type: Date },
  },
  { timestamps: true }
);

export const TechnicianApplication = mongoose.model<ITechnicianApplication>(
  'TechnicianApplication',
  TechnicianApplicationSchema
);