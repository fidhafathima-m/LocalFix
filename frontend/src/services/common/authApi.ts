/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthResponse, ForgotPasswordData, GoogleAuthData, LoginCredentials, OTPData, ResendOTPData, ResetPasswordData, SignupData } from "../../interface/user/IAuth";
import { AUTH_ROUTES } from "../../routes/authRoutes";
import api from "../../utils/axiosConfig";



const normalizeAuthResponse = (response: AuthResponse): AuthResponse => {
  const normalized = {
    ...response,
    user: response.data?.user || response.user,
    accessToken: response.data?.accessToken || response.accessToken,
    refreshToken: response.data?.refreshToken || response.refreshToken,
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
      const response = await api.post<AuthResponse>(AUTH_ROUTES.REFRESH_TOKEN, {
        refreshToken,
      });
      console.log("🔄 Refresh Token Response:", response.data);
      
      // Your backend returns { success, message, data: { accessToken, refreshToken } }
      const normalized = {
        ...response.data,
        success: response.data.success,
        message: response.data.message,
        data: {
          accessToken: response.data.data?.accessToken,
          refreshToken: response.data.data?.refreshToken,
        },
        accessToken: response.data.data?.accessToken,
        refreshToken: response.data.data?.refreshToken,
      };
      
      console.log("🔄 Normalized Response:", normalized);
      return normalized;
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
      const response = await api.post<AuthResponse>(AUTH_ROUTES.LOGOUT, {
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
      const response = await api.post<AuthResponse>(
        AUTH_ROUTES.LOGIN,
        credentials
      );
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
      const response = await api.post<AuthResponse>(
        AUTH_ROUTES.SIGNUP,
        userData
      );
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
        AUTH_ROUTES.VERIFY_OTP,
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
      const response = await api.post<AuthResponse>(
        AUTH_ROUTES.VERIFY_RESET_OTP,
        {
          ...otpData,
          context: "forgot",
        }
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

  resendOTP: async (otpData: ResendOTPData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        AUTH_ROUTES.RESEND_OTP,
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
        AUTH_ROUTES.FORGOT_PASSWORD,
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
        AUTH_ROUTES.RESET_PASSWORD,
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
      const response = await api.post<AuthResponse>(
        AUTH_ROUTES.GOOGLE_AUTH,
        tokenData
      );
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
      const response = await api.get<AuthResponse>(AUTH_ROUTES.PROFILE);
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
      const response = await api.post<AuthResponse>(AUTH_ROUTES.ADD_ROLE, {
        role,
      });
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
        AUTH_ROUTES.REMOVE_ROLE(role)
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
      const response = await api.post<AuthResponse>(AUTH_ROUTES.SWITCH_ROLE, {
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
