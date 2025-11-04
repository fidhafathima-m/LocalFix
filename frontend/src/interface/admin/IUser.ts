import type { Address } from "../user/IUserApi";

export interface User {
  _id: string;
  fullName: string;
  dateOfBirth?: string;
  roles?: string[];
  profilePicture?: string;
  profilePictureUrl?: string;
  gender?: string;
  email?: string;
  phone: string;
  status: "Active" | "Inactive" | "Blocked";
  defaultAddress?: {
    city: string;
    state: string;
    pincode: string;
    location: { type: "Point"; coordinates: [number, number] };
  };
  isVerified: boolean;
  role: string;
  createdAt: string;
  wallet: { balance: number };
  addresses?: Address[];
  updatedAt?: Date;
}