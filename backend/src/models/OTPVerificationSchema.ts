import { IOtpVerification } from '../interfaces/user/IOTP';
import mongoose, { Schema, Document } from 'mongoose';

const otpSchema = new Schema<IOtpVerification>(
  {
    phone: { type: String, required: false },
    email: { type: String, required: false },
    otpHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['signup', 'login', 'reset', 'application'],
      required: true,
    },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// TTL index on expiresAt field
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IOtpVerification>('OtpVerification', otpSchema);
