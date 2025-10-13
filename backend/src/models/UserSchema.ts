import { IUser } from "../interfaces/user/IUser";
import mongoose, { Schema, Document } from "mongoose";

const UserSchema = new Schema<IUser>(
  {
    fullName: { type: String, required: true },
    email: {
      type: String,
      sparse: true,
    },
    phone: {
      type: String,
      sparse: true,
    },
    passwordHash: { type: String },
    isVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ["user", "serviceProvider", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["Active", "Inactive", "Blocked"],
      default: "Active",
    },
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
      enum: [
        "not-applied",
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
      ],
      default: "not-applied",
    },
    applicationDate: { type: Date },
    approvalDate: { type: Date },
    rejectionReason: { type: String },
  },

  { timestamps: true }
);

UserSchema.index(
  { phone: 1 },
  {
    sparse: true,
    unique: true,
    partialFilterExpression: { phone: { $exists: true, $ne: null } },
  }
);

UserSchema.index(
  { email: 1 },
  {
    sparse: true,
    unique: true,
    partialFilterExpression: { email: { $exists: true, $ne: null } },
  }
);

export default mongoose.model<IUser>("User", UserSchema);
