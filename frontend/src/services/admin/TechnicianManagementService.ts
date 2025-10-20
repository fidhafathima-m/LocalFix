/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminAPI } from "../common/adminApi";

export class TechnicianMangementService {
  static async getApplicationDetails(applicationId: string) {
    try {
      const response = await adminAPI.getApplicationDetails(applicationId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get application details");
    }
  }
  static async getTechnicians() {
    try {
      const response = await adminAPI.getTechnicians();
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to reset Password");
    }
  }
  static async getPendingTechnicians() {
    try {
      const response = await adminAPI.getPendingApplications();
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to reset Password");
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
