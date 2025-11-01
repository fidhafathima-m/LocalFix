// models/userAddress.ts
import mongoose, { Schema, Document, Types } from "mongoose";
import { IUser } from "../interfaces/user/IUser";

export interface IUserAddress extends Document {
  _id: Types.ObjectId;
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
  formattedAddress?: string;
  placeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userAddressSchema = new Schema<IUserAddress>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true 
    },
    label: { 
      type: String, 
      default: "Home" 
    },
    landmark: { 
      type: String 
    },
    street: { 
      type: String, 
      required: true 
    },
    city: { 
      type: String, 
      required: true 
    },
    state: { 
      type: String, 
      required: true 
    },
    pincode: { 
      type: String, 
      required: true 
    },
    isDefault: { 
      type: Boolean, 
      default: false 
    },
    location: {
      type: { 
        type: String, 
        enum: ["Point"], 
        required: true 
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (coords: number[]) {
            return (
              coords.length === 2 &&
              coords[0] >= -180 &&
              coords[0] <= 180 &&
              coords[1] >= -90 &&
              coords[1] <= 90
            );
          },
          message: "Invalid coordinates",
        },
      },
    },
    formattedAddress: { 
      type: String 
    },
    placeId: { 
      type: String 
    },
  },
  { 
    timestamps: true,
    collection: 'useraddresses' // Explicitly set collection name
  }
);

userAddressSchema.index({ location: "2dsphere" });
userAddressSchema.index({ userId: 1 });

export default mongoose.model<IUserAddress>("UserAddress", userAddressSchema);