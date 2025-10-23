import { Types } from "mongoose";

export interface IAddress {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  label: string;
  landmark?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  location: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  formattedAddress: string;
  placeId?: string;
  createdAt: Date;
  updatedAt: Date;
}
