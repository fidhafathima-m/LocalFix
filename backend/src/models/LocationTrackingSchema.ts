import { ILocationTracking } from '../interfaces/common/ILocationTracking';
import mongoose, { Schema } from 'mongoose';

const locationPointSchema = new Schema({
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  accuracy: Number,
  speed: Number,
  heading: Number,
});

const locationTrackingSchema: Schema = new Schema(
  {
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: 'Technician',
      required: true,
    },
    bookingId: {
      type: String,
      required: true,
      index: true,
    },
    locations: [locationPointSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: Date,
    lastUpdated: Date,
  },
  {
    timestamps: true,
  }
);

// Create 2dsphere index for geospatial queries
locationTrackingSchema.index({ 'locations.coordinates': '2dsphere' });
locationTrackingSchema.index({ technicianId: 1, bookingId: 1 });
locationTrackingSchema.index({ isActive: 1 });

export default mongoose.model<ILocationTracking>(
  'LocationTracking',
  locationTrackingSchema
);
