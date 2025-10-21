/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminAPI } from "../common/adminApi";

export class UserMangementService {
  static async getUsers() {
    try {
      const response = await adminAPI.getUsers();
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get users");
    }
  }
  static async updateUserStatus(userId: string, status: string) {
    try {
      const response = await adminAPI.updateUserStatus(userId, status)
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to update user status");
    }
  }
  static async deleteUser(userId: string) {
    try {
      const response = await adminAPI.deleteUser(userId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to delete user");
    }
  }
  static async getTechnicianById(technicianId: string) {
    try {
      const response = await adminAPI.getTechnicianById(technicianId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to reset Password");
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
