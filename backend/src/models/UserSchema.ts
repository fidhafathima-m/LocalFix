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
  phone: string;
  passwordHash?: string;
  isVerified: boolean;
  role: "user" | "technician" | "admin";
  wallet: {
    balance: number;
    transactions: IWalletTransaction[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "technician", "admin"], default: "user" },
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
