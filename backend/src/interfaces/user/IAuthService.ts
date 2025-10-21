import { ApiResponse } from "../../utils/responseHelper";

export interface AuthResponse extends ApiResponse {
  token?: string;
  user?: any;
}

export interface OTPResponse extends ApiResponse {}

export interface LoginCredentials {
  identifier: string;
  password: string;
  role?: string;
  roles?: string[];
}

export interface SignupData {
  email?: string;
  phone?: string;
  fullName: string;
  password?: string;
  userType: "user" | "serviceProvider";
}

export interface OTPVerificationData {
  email?: string;
  phone?: string;
  otp: string;
  fullName?: string;
  password?: string;
  userType?: string;
}

export interface ResetPasswordData {
  email?: string;
  phone?: string;
  otp: string;
  token?: string;
  password: string;
  userType?: string;
}

export interface SocialAuthData {
  token?: string;
  accessToken?: string;
  userId?: string;
  userType?: string;
}