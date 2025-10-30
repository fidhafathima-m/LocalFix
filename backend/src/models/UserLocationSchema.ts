import mongoose, { Document, Schema } from "mongoose";

export interface IUserLocation extends Document {
  userId: mongoose.Types.ObjectId;
  location: {
    type: string;
    coordinates: [number, number];
  };
  address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
    formattedAddress?: string;
  };
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userLocationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere"
      }
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
      formattedAddress: String
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

userLocationSchema.index({ userId: 1 });
userLocationSchema.index({ "location.coordinates": "2dsphere" });

export default mongoose.model<IUserLocation>("UserLocation", userLocationSchema);