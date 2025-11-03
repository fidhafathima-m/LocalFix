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
      throw this.handleError(error, "Failed to get technicians");
    }
  }
  static async getPendingTechnicians() {
    try {
      const response = await adminAPI.getPendingApplications();
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get pending technicians");
    }
  }
  static async getTechnicianSlotRules(technicianId: string) {
    try {
      const response = await adminAPI.getTechnicianSlotRules(technicianId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get technician slots");
    }
  }
  static async getTechnicianById(technicianId: string) {
    try {
      const response = await adminAPI.getTechnicianById(technicianId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get technician by id");
    }
  }
  static async getTechnicianAvailability(technicianId: string, startDate: string, endDate: string) {
    try {
      const response = await adminAPI.getTechnicianAvailability(technicianId, startDate, endDate);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get technician availability");
    }
  }
  static async getPublicTechnicians(filters: {
    service?: string;
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
  }) {
    try {
      const response = await adminAPI.getPublicTechnicians(filters);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get public technicians");
    }
  }

  static async getPublicTechnicianById(technicianId: string) {
    try {
      const response = await adminAPI.getPublicTechnicianById(technicianId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get public technician");
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
