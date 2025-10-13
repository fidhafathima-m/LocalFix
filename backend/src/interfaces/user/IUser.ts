import { Document, Types } from "mongoose";

interface IWalletTransaction {
  txId: string;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: Date;
}

type ApplicationStatus =
  | "not-applied"
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  isVerified: boolean;
  role: "user" | "serviceProvider" | "admin";
  status: "Active" | "Inactive" | "Blocked";
  applicationStatus?: ApplicationStatus;
  applicationDate?: Date;
  approvalDate?: Date;
  rejectionReason?: string;
  wallet: {
    balance: number;
    transactions: IWalletTransaction[];
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// For create operations - without _id
export interface IUserCreate {
  fullName: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  role: "user" | "serviceProvider" | "admin";
  isVerified: boolean;
  applicationStatus?: ApplicationStatus;
  status?: "Active" | "Inactive" | "Blocked";
  wallet?: {
    balance?: number;
    transactions?: IWalletTransaction[];
  };
}

// For update operations
export interface IUserUpdate {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: "user" | "serviceProvider" | "admin";
  passwordHash?: string;
  isVerified?: boolean;
  applicationStatus?: ApplicationStatus;
  status?: "Active" | "Inactive" | "Blocked";
  isDeleted?: boolean;
  "wallet.balance"?: number;
  "wallet.transactions"?: IWalletTransaction[];
  applicationDate?: Date;
  approvalDate?: Date;
  rejectionReason?: string;
}
