import mongoose, { Schema, Document } from "mongoose";

interface IWalletTransaction {
  txId: string;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: Date;
}

export interface IUser extends Document {
  fullName: string;
  email?: string;
  phone?: string;
  passwordHash?: string;
  isVerified: boolean;
  role: "user" | "technician" | "admin";
  status: "Active" | "Inactive" | "Blocked"
  wallet: {
    balance: number;
    transactions: IWalletTransaction[];
  };
  isDeleted: boolean
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true, },
    passwordHash: { type: String },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "technician", "admin"], default: "user" },
    status: { type: String, enum: ["Active", "Inactive", "Blocked"], default: "Active" },
    isDeleted: { type: Boolean, default: false },
    wallet: {
      balance: { type: Number, default: 0 },
      transactions: [
        {
          txId: { type: String, required: true },
          type: { type: String, enum: ["credit", "debit"], required: true },
          amount: { type: Number, required: true },
          balanceAfter: { type: Number, required: true },
          description: { type: String },
          createdAt: { type: Date, default: Date.now },
        },
      ],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
