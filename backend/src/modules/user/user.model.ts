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
  role: "user" | "serviceProvider" | "admin";
  status: "Active" | "Inactive" | "Blocked"
  applicationStatus?: "not-applied" | "pending" | "approved" | "rejected";
  applicationDate?: Date;
  approvalDate?: Date;
  rejectionReason?: string;
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
    email: { 
      type: String, 
      // Remove unique: true from here since we're creating index separately
      sparse: true 
    },
    phone: { 
      type: String, 
      // Remove unique: true from here since we're creating index separately
      sparse: true 
    },
    passwordHash: { type: String },
    isVerified: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "serviceProvider", "admin"], default: "user" },
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
    applicationStatus: { 
      type: String, 
      enum: ["not-applied", "pending", "approved", "rejected"], 
      default: "not-applied" 
    },
    applicationDate: { type: Date },
    approvalDate: { type: Date },
    rejectionReason: { type: String },
  },
  
  { timestamps: true }
);

// Create indexes separately - remove the duplicate ones
userSchema.index({ phone: 1 }, { 
  sparse: true, 
  unique: true,
  partialFilterExpression: { phone: { $exists: true, $ne: null } } 
});

userSchema.index({ email: 1 }, { 
  sparse: true, 
  unique: true,
  partialFilterExpression: { email: { $exists: true, $ne: null } } 
});

export default mongoose.model<IUser>("User", userSchema);