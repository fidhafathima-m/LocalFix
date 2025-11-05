/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ForgotPasswordData, GoogleAuthData, LoginCredentials, OTPData, ResendOTPData, ResetPasswordData, SignupData } from "../../interface/user/IAuth";
import { authAPI } from "../common/authApi";


export class UserAuthService {
  static async verifyForgotPasswordOTP(otpData: OTPData) {
    try {
      const response = await authAPI.verifyForgotPasswordOTP(otpData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to verify forget password otp");
    }
  }
  static async resendOTP(otpData: ResendOTPData) {
    try {
      const response = await authAPI.resendOTP(otpData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to resent password");
    }
  }
  static async googleAuth(tokenData: GoogleAuthData) {
    try {
      const response = await authAPI.googleAuth(tokenData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get google auth");
    }
  }
  static async forgotPassword(data: ForgotPasswordData) {
    try {
      const response = await authAPI.forgotPassword(data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to fetch forget password");
    }
  }
  static async login(credentials: LoginCredentials) {
    try {
      const response = await authAPI.login(credentials);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to login");
    }
  }
  static async resetPassword(resetData: ResetPasswordData) {
    try {
      const response = await authAPI.resetPassword(resetData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to reset password");
    }
  }
  static async signup(userData: SignupData) {
    try {
      const response = await authAPI.signup(userData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to signup");
    }
  }
  static async verifyOTP(otpData: OTPData) {
    try {
      const response = await authAPI.verifyOTP(otpData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to verify otp");
    }
  }

  private static handleResponse(response: any) {
    if (response.success === false) {
      throw new Error(response.message || "Operation failed");
    }
    return response;
  }

  private static handleError(error: any, defaultMessage: string) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(defaultMessage);
  }
}
