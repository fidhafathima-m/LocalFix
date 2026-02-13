import { IUser } from '../interfaces/user/IUser';
import mongoose, { Schema, Document } from 'mongoose';

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
    profilePictureUrl: { type: String },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    },
    dateOfBirth: { type: String },
    isVerified: { type: Boolean, default: false },
    roles: {
      type: [String],
      enum: ['user', 'serviceProvider', 'admin'],
      default: ['user'],
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Blocked'],
      default: 'Active',
    },
    isDeleted: { type: Boolean, default: false },
    wallet: {
      balance: { type: Number, default: 0 },
      transactions: [
        {
          txId: { type: String, required: true },
          type: { type: String, enum: ['credit', 'debit'], required: true },
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
        'not-applied',
        'draft',
        'submitted',
        'under_review',
        'approved',
        'rejected',
      ],
      default: 'not-applied',
    },
    applicationDate: { type: Date },
    approvalDate: { type: Date },
    rejectionReason: { type: String },
    refreshTokens: [
      {
        token: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    bankAccounts: [
      {
        accountNumber: { type: String, required: true },
        accountHolderName: { type: String, required: true },
        bankName: { type: String, required: true },
        ifscCode: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
        isVerified: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
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

// Compound index for email/phone + role queries
UserSchema.index({ email: 1, roles: 1 });
UserSchema.index({ phone: 1, roles: 1 });

export default mongoose.model<IUser>('User', UserSchema);
