/* eslint-disable @typescript-eslint/no-explicit-any */
import { authAPI, type ForgotPasswordData, type LoginCredentials, type OTPData, type ResendOTPData, type ResetPasswordData, type SignupData } from "../common/authApi";

export class TechnicianAuthService {
  static async forgotPassword(data: ForgotPasswordData) {
    try {
      const response = await authAPI.forgotPassword(data)
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get users");
    }
  }
  static async verifyForgotPasswordOTP(otpData: OTPData) {
    try {
      const response = await authAPI.verifyForgotPasswordOTP(otpData)
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get users");
    }
  }
  static async resendOTP(otpData: ResendOTPData) {
    try {
      const response = await authAPI.resendOTP(otpData)
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get users");
    }
  }
  static async login(credentials: LoginCredentials) {
    try {
      const response = await authAPI.login(credentials)
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get users");
    }
  }
  static async resetPassword(resetData: ResetPasswordData) {
    try {
      const response = await authAPI.resetPassword(resetData)
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get users");
    }
  }
  static async signup(userData: SignupData) {
    try {
      const response = await authAPI.signup(userData)
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get users");
    }
  }
  static async verifyOTP(otpData: OTPData) {
    try {
      const response = await authAPI.verifyOTP(otpData)
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get users");
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
