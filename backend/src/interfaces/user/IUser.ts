import { Date, Document, Types } from "mongoose";

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
  roles: string[];
  status: "Active" | "Inactive" | "Blocked";
  applicationStatus?: ApplicationStatus;
  applicationDate?: Date;
  approvalDate?: Date;
  rejectionReason?: string;
  wallet: {
    balance: number;
    transactions: IWalletTransaction[];
  };
  refreshTokens: {
    token: string;
    createdAt: Date;
  }[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  loginDevice?: string;
  profilePictureUrl?: string;
  gender?: string;
  dateOfBirth?: string;
  bankAccounts?: {
    accountNumber: string;
    accountHolderName: string;
    bankName: string;
    ifscCode: string;
    isDefault: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

export interface IUserCreate {
  fullName: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  roles: string[];
  isVerified: boolean;
  applicationStatus?: ApplicationStatus;
  status?: "Active" | "Inactive" | "Blocked";
  wallet?: {
    balance?: number;
    transactions?: IWalletTransaction[];
  };
}

export interface IUserUpdate {
  fullName?: string;
  email?: string;
  phone?: string;
  roles?: string[];
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
