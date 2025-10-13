/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../utils/axiosConfig";

export interface LoginCredentials {
  identifier: string;
  password: string;
  role: "user" | "serviceProvider" | "admin";
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
  identifier: string;
  userType: "user" | "serviceProvider" | "admin";
}

export interface ResetPasswordData {
  password: string;
  confirmPassword: string;
  otp: string;
  userType: "user" | "serviceProvider" | "admin";
  phone?: string;
  email?: string;
}

export interface GoogleAuthData {
  token: string;
  userType: "user" | "serviceProvider";
}

// ✅ CORRECTED AuthResponse to match ACTUAL backend structure
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    _id: string;
    fullName: string;
    phone?: string;
    email?: string;
    role: "user" | "serviceProvider" | "admin";
    applicationStatus?: string;
    isVerified?: boolean;
    status?: string;
  };
  token?: string;
  error?: string;
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);
      return response.data;
    } catch (error: any) {
      // Return the backend error response directly
      if (error.response?.data) {
        return error.response.data;
      }
      // If no response from backend, create a generic error
      return {
        success: false,
        message: error.message || "Login failed",
        error: "Network error"
      };
    }
  },

  signup: async (userData: SignupData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", userData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Signup failed",
        error: "Network error"
      };
    }
  },

  verifyOTP: async (otpData: OTPData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/verify-otp", otpData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "OTP verification failed",
        error: "Network error"
      };
    }
  },

  verifyForgotPasswordOTP: async (otpData: OTPData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/verify-reset-otp", {
        ...otpData,
        context: "forgot"
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "OTP verification failed",
        error: "Network error"
      };
    }
  },

  resendOTP: async (otpData: ResendOTPData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/resend-otp", otpData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Failed to resend OTP",
        error: "Network error"
      };
    }
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/forgot-password", data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Failed to send OTP",
        error: "Network error"
      };
    }
  },

  resetPassword: async (resetData: ResetPasswordData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/reset-password", resetData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Password reset failed",
        error: "Network error"
      };
    }
  },

  googleAuth: async (tokenData: GoogleAuthData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/google", tokenData);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Google authentication failed",
        error: "Network error"
      };
    }
  },

  getProfile: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get<AuthResponse>("/auth/profile");
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Failed to get profile",
        error: "Network error"
      };
    }
  },
};