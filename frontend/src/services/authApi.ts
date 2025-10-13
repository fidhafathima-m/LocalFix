import api from '../utils/axiosConfig';

export interface LoginCredentials {
  identifier: string;
  password: string;
  role: 'user' | 'serviceProvider' | 'admin';
}

export interface SignupData {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  userType: 'user' | 'serviceProvider';
}

export interface OTPData {
  otp: string;
  userType: 'user' | 'serviceProvider' | 'admin';
  context: 'signup' | 'forgot';
  phone?: string;
  email?: string;
  fullName?: string; // Add this
  password?: string;
}

export interface ResendOTPData {
  phone?: string;
  email?: string;
  purpose: 'signup' | 'reset';
  userType: 'user' | 'serviceProvider' | 'admin';
}

export interface ForgotPasswordData {
  identifier: string;
  userType: 'user' | 'serviceProvider' | 'admin';
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
  otp: string;
  userType: 'user' | 'serviceProvider' | 'admin';
  phone?: string;
  email?: string;
}

export interface GoogleAuthData {
  token: string;
  userType: 'user' | 'serviceProvider';
}

export interface AuthResponse {
  user: {
    _id: string;
    fullName: string;
    phone: string;
    email: string;
    role: 'user' | 'serviceProvider' | 'admin';
    applicationStatus?: string;
    isVerified?: boolean;
  };
  token: string;
  message?: string;
}

export const authAPI = {
  login: (credentials: LoginCredentials) => 
    api.post<AuthResponse>('/auth/login', credentials),
  
  signup: (userData: SignupData) => 
    api.post<{ message: string; data?: unknown }>('/auth/register', userData),
  
  verifyOTP: (otpData: OTPData) => 
    api.post<AuthResponse>('/auth/verify-otp', otpData),
  
  resendOTP: (otpData: ResendOTPData) => 
    api.post<{ message: string }>('/auth/resend-otp', otpData),
  
  forgotPassword: (data: ForgotPasswordData) => 
    api.post<{ message: string }>('/auth/forgot-password', data),
  
  resetPassword: (resetData: ResetPasswordData) => 
    api.post<{ message: string }>('/auth/reset-password', resetData),
  
  googleAuth: (tokenData: GoogleAuthData) => 
    api.post<AuthResponse>('/auth/google', tokenData),
  
  getProfile: () => 
    api.get<{ user: AuthResponse['user'] }>('/auth/profile'),
};