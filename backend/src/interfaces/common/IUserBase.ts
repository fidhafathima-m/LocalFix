import { Document, Types } from "mongoose";

export interface IUserBase extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email?: string;
  phone?: string;
  roles: string[];
  status: "Active" | "Inactive" | "Blocked";
  isVerified: boolean;
  applicationStatus: "not-applied" | "pending" | "approved" | "rejected";
  isDeleted: boolean;
  passwordHash?: string;
  refreshTokens?: Array<{
    token: string;
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  profilePictureUrl?: string;
  dateOfBirth?: string;
  gender?: string;
}
