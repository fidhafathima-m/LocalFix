import mongoose, { Schema, Document } from "mongoose";

export interface IOtpVerification extends Document {
  phone: string;
  otpHash: string;
  purpose: "signup" | "login" | "reset" | "application";
  expiresAt: Date;
  attempts: number;
}

const otpSchema = new Schema<IOtpVerification>(
  {
    phone: { type: String, required: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ["signup", "login", "reset", "application"], required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IOtpVerification>("OtpVerification", otpSchema);
