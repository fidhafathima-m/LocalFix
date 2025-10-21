import { Types, Document } from 'mongoose';

export interface IOtpVerification extends Document {
  _id: Types.ObjectId;
  phone?: string;
  email?: string;
  otpHash: string;
  purpose: "signup" | "login" | "reset" | "application";
  expiresAt: Date;
  attempts: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOTPCreate {
  phone?: string;
  email?: string;
  otpHash: string;
  purpose: "signup" | "login" | "reset" | "application";
  expiresAt: Date;
  attempts: number;
}