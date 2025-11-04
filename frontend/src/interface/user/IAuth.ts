/* eslint-disable @typescript-eslint/no-explicit-any */
export interface LoginCredentials {
  identifier: string;
  password: string;
  roles: string[];
}

export interface SignupData {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  userType: "user" | "serviceProvider";
}

export interface OTPData {
  otp: string;
  userType: "user" | "serviceProvider" | "admin";
  context: "signup" | "forgot";
  phone?: string;
  email?: string;
  fullName?: string;
  password?: string;
}

export interface ResendOTPData {
  phone?: string;
  email?: string;
  purpose: "signup" | "reset";
  userType: "user" | "serviceProvider" | "admin";
}

export interface ForgotPasswordData {
  phone?: string;
  email?: string;
  userType: "user" | "serviceProvider" | "admin";
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
  otp?: string;
  token?: string;
  userType: "user" | "serviceProvider" | "admin";
  phone?: string;
  email?: string;
}

export interface GoogleAuthData {
  token: string;
  userType: "user" | "serviceProvider";
}

export interface User {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  roles: string[];
  applicationStatus?: string;
  isVerified?: boolean;
  status?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User;
    accessToken?: string;
    refreshToken?: string;
    token?: string;
    [key: string]: any;
  };
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  error?: string;
  statusCode?: number;
}