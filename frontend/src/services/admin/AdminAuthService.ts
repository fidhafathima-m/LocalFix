/* eslint-disable @typescript-eslint/no-explicit-any */
import { authAPI, type ForgotPasswordData, type LoginCredentials, type ResetPasswordData } from "../common/authApi";

export class AdminAuthService {
  static async resetPassword(resetData: ResetPasswordData) {
    try {
      const response = await authAPI.resetPassword(resetData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to reset Password");
    }
  }
  static async forgetPassword(data: ForgotPasswordData) {
    try {
      const response = await authAPI.forgotPassword(data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to fetch forget Password");
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
