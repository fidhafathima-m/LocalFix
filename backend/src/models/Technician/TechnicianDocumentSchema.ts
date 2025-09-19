import mongoose, { Schema, Document } from 'mongoose'

export interface ITechnicianDocument extends Document {
  technicianId: mongoose.Types.ObjectId
  type:
    | 'idProof'
    | 'addressProof'
    | 'experienceCertificate'
    | 'policeVerification'
    | 'tradeLicense'
    | 'other'
  fileUrl: string
  status: 'pending' | 'verified' | 'rejected'
  uploadedAt: Date
  verifiedAt?: Date
  metadata: Record<string, any>
}

const TechnicianDocumentSchema = new Schema<ITechnicianDocument>(
  {
    technicianId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'idProof',
        'addressProof',
        'experienceCertificate',
        'policeVerification',
        'tradeLicense',
        'other',
      ],
      required: true,
    },
    fileUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    uploadedAt: { type: Date, default: Date.now },
    verifiedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
)

export const TechnicianDocument = mongoose.model<ITechnicianDocument>(
  'TechnicianDocument',
  TechnicianDocumentSchema
)
