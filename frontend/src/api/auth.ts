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
  context: OTPContext;
  userType: UserType;
  phone?: string;
  email?: string;
  fullName?: string;
  password?: string;
}

export interface ResetPasswordData {
  phone?: string;
  email?: string;
  otp: string;
  newPassword: string;
  userType: UserType;
}

export interface ResendOTPData {
  phone?: string;
  email?: string;
  purpose: 'signup' | 'reset';
  userType: UserType;
}

// In your api/auth.ts file
export const signupAPI = async (data: {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  userType: string;
}) => {
  console.log('Making signup API call with:', data);
  const response = await axios.post(`${BASE_URL}/auth/signup`, data);
  console.log('Signup API response received:', response);
  return response.data;
};

// Login
export const loginUser = async (credentials: LoginData) => {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, credentials);
    return response;
  } catch (error) {
    // Re-throw the error with more context
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
    throw error;
  }
};
// Forgot password (send OTP)
export const sendOTP = async (data: ForgotPasswordData) => {
  const response = await axios.post(`${BASE_URL}/auth/forgot-password`, data);
  return response.data;
};

// Verify OTP (signup or forgot)
export const verifyOTP = async (data: VerifyOTPData) => {
  
  // Use different endpoints based on context
  const endpoint = data.context === 'signup' ? '/verify-otp' : '/verify-reset-otp';
  const response = await axios.post(`${BASE_URL}/auth${endpoint}`, data);
  return response.data;
};

export const resetPassword = async (data: ResetPasswordData) => {
  const response = await axios.post(`${BASE_URL}/auth/reset-password`, data);
  return response.data;
};

export const resendOTP = async (data: {
  phone?: string;
  email?: string;
  purpose: 'signup' | 'reset';
  userType: UserType;
}) => {
  const response = await axios.post(`${BASE_URL}/auth/resend-otp`, data);
  return response.data;
};
