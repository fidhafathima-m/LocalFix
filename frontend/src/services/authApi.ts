/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../utils/axiosConfig";

export interface LoginCredentials {
  identifier: string;
  password: string;
  role: "user" | "serviceProvider" | "admin"; // Keep for role-specific login
}

export interface SignupData {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  userType: "user" | "serviceProvider"; // This becomes the initial role
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

// UPDATED: User interface to support multiple roles
export interface User {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  roles: string[]; // Changed from 'role' to 'roles' array
  applicationStatus?: string;
  isVerified?: boolean;
  status?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: User; // Updated to use new User interface
    token?: string;
  };
  user?: User; // Updated to use new User interface
  token?: string;
  error?: string;
  statusCode?: number;
}

// Helper function to normalize response structure
const normalizeAuthResponse = (response: AuthResponse): AuthResponse => {
  return {
    ...response,
    // Extract user and token to root level for easy access
    user: response.data?.user || response.user,
    token: response.data?.token || response.token
  };
};

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Login failed",
        error: "Network error",
      };
    }
  },

  signup: async (userData: SignupData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/signup", userData);
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Signup failed",
        error: "Network error",
      };
    }
  },

  verifyOTP: async (otpData: OTPData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        "/auth/verify-otp",
        otpData
      );
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "OTP verification failed",
        error: "Network error",
      };
    }
  },

  verifyForgotPasswordOTP: async (otpData: OTPData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/verify-reset-otp", {
        ...otpData,
        context: "forgot",
      });
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "OTP verification failed",
        error: "Network error",
      };
    }
  },

  resendOTP: async (otpData: ResendOTPData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        "/auth/resend-otp",
        otpData
      );
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to resend OTP",
        error: "Network error",
      };
    }
  },

  forgotPassword: async (data: ForgotPasswordData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        "/auth/forgot-password",
        data
      );
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to send OTP",
        error: "Network error",
      };
    }
  },

  resetPassword: async (resetData: ResetPasswordData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        "/auth/reset-password",
        resetData
      );
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Password reset failed",
        error: "Network error",
      };
    }
  },

  googleAuth: async (tokenData: GoogleAuthData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/google", tokenData);
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Google authentication failed",
        error: "Network error",
      };
    }
  },

  getProfile: async (): Promise<AuthResponse> => {
    try {
      const response = await api.get<AuthResponse>("/auth/profile");
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to get profile",
        error: "Network error",
      };
    }
  },

  // NEW: Add role management methods
  addRole: async (role: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/add-role", { role });
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to add role",
        error: "Network error",
      };
    }
  },

  removeRole: async (role: string): Promise<AuthResponse> => {
    try {
      const response = await api.delete<AuthResponse>(`/auth/remove-role/${role}`);
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to remove role",
        error: "Network error",
      };
    }
  },

  // NEW: Switch current role for session
  switchRole: async (role: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/switch-role", { role });
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to switch role",
        error: "Network error",
      };
    }
  }
};