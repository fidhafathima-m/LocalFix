import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export type UserType = 'user' | 'serviceProvider' | 'admin';
export type OTPContext = 'signup' | 'forgot';

interface LoginData {
  identifier: string;
  password: string;
  role: UserType;
}

interface ForgotPasswordData {
  phone?: string;
  email?: string;
  userType: UserType;
}

export interface VerifyOTPData {
  otp: string;
  userType: UserType;
  context: OTPContext;
  fullName?: string;
  password?: string;
  phone?: string;
  email?: string;
}

// Login
export const loginUser = async (data: LoginData) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, data);
  return response.data;
};

// Forgot password (send OTP)
export const sendOTP = async (data: ForgotPasswordData) => {
  const response = await axios.post(`${BASE_URL}/auth/forgot-password`, data);
  return response.data;
};

// Verify OTP (signup or forgot)
export const verifyOTP = async (data: VerifyOTPData) => {
  const url =
    data.context === 'signup'
      ? `${BASE_URL}/auth/verify-otp`
      : `${BASE_URL}/auth/verify-reset-otp`;
  const response = await axios.post(url, data);
  return response.data;
};
