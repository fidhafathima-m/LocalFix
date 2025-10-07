export interface IOtpVerification extends Document {
  _id?: string
  phone?: string;
  email?: string;
  otpHash: string;
  purpose: "signup" | "login" | "reset" | "application";
  expiresAt: Date;
  attempts: number;
}

export interface IOTPCreate {
  phone?: string;
  email?: string;
  otpHash: string;
  purpose: "signup" | "login" | "reset" | "application";
  expiresAt: Date;
  attempts: number;
}