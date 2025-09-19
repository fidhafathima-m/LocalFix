import mongoose, { Schema, Document } from 'mongoose'

const { ObjectId } = mongoose.Types

// GeoJSON Point
interface IGeoPoint {
  type: 'Point'
  coordinates: [number, number] // [lng, lat]
}

// Service rate structure can vary – keeping it flexible
type ServiceRates = Record<string, number>

export interface ITechnician extends Document {
  userId: typeof ObjectId
  displayName: string
  bio: string
  experienceYears: number
  services: typeof ObjectId[]
  serviceRates: ServiceRates
  workAreas: string[]
  serviceRadiusKm: number
  currentLocation?: IGeoPoint
  averageRating: number
  ratingCount: number
  status: 'pending' | 'approved' | 'rejected' | 'suspended'
  rejectionReason?: string
  resubmittedCount: number
  profilePictureUrl?: string
  createdAt: Date
  updatedAt: Date
}

const TechnicianSchema = new Schema<ITechnician>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    displayName: { type: String, required: true },
    bio: { type: String },
    experienceYears: { type: Number, default: 0 },
    services: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
    serviceRates: { type: Schema.Types.Mixed },
    workAreas: { type: [String], default: [] },
    serviceRadiusKm: { type: Number, default: 10 },

    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [lng, lat]
        index: '2dsphere',
        default: undefined,
      },
    },

    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    rejectionReason: { type: String },
    resubmittedCount: { type: Number, default: 0 },
    profilePictureUrl: { type: String },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
)

// 2dsphere index for geolocation queries
TechnicianSchema.index({ currentLocation: '2dsphere' })

export const Technician = mongoose.model<ITechnician>(
  'Technician',
  TechnicianSchema
)
