/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../utils/axiosConfig";

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

const normalizeAuthResponse = (response: AuthResponse): AuthResponse => {
  const normalized = {
    ...response,
    user: response.data?.user || response.user,
    accessToken: response.data?.accessToken || response.accessToken,
    refreshToken: response.data?.refreshToken || response.refreshToken,
    // Add token extraction for forgot password flow
    token:
      response.data?.token ||
      response.data?.data?.token ||
      response.accessToken ||
      response.token,
  };

  return normalized;
};
export const authAPI = {
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/refresh-token", {
        refreshToken,
      });
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Token refresh failed",
        error: "Network error",
      };
    }
  },

  logout: async (refreshToken?: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/logout", {
        refreshToken,
      });
      return normalizeAuthResponse(response.data);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeAuthResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Logout failed",
        error: "Network error",
      };
    }
  },
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

  resetPassword: async (
    resetData: ResetPasswordData
  ): Promise<AuthResponse> => {
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
      const response = await api.delete<AuthResponse>(
        `/auth/remove-role/${role}`
      );
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

  switchRole: async (role: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/switch-role", {
        role,
      });
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
  },
};
