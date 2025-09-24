import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "../modules/user/user.model";

export interface IUserAddress extends Document {
  userId: IUser["_id"];
  label?: string;
  landmark?: string;
  street?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  location: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  createdAt: Date;
  updatedAt: Date;
}

const userAddressSchema = new Schema<IUserAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    label: { type: String },
    landmark: { type: String },
    street: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    location: {
      type: { type: String, enum: ["Point"], required: true },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  { timestamps: true }
);

// create geospatial index for queries like "nearby"
userAddressSchema.index({ location: "2dsphere" });

export default mongoose.model<IUserAddress>("UserAddress", userAddressSchema);
