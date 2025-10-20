/* eslint-disable @typescript-eslint/no-explicit-any */
import { technicianAPI } from "../common/technicianApi";

export class TechnicianApplicationService {
  static async startApplication(data: { email: string; userId: string }) {
    try {
      const response = await technicianAPI.startApplication(data)
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get users");
    }
  }
  static async getApplication(applicationId: string) {
    try {
      const response = await technicianAPI.getApplication(applicationId)
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get users");
    }
  }
  static async saveStep(formData: FormData) {
    try {
      const response = await technicianAPI.saveStep(formData)
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get users");
    }
  }
  static async submitApplication(data: { applicationId: string }) {
    try {
      const response = await technicianAPI.submitApplication(data)
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
