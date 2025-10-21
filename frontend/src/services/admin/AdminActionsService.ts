/* eslint-disable @typescript-eslint/no-explicit-any */

import { adminAPI } from "../common/adminApi";

export class AdminActionsService {
  static async updateTechnicianStatus(technicianId: string, status: string) {
    try {
      const response = await adminAPI.updateTechnicianStatus(
        technicianId,
        status
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to update techniciian status");
    }
  }
  static async approveApplication(applicationId: string) {
    try {
      const response = await adminAPI.approveApplication(applicationId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to approve application");
    }
  }
  static async rejectApplication(
    applicationId: string,
    rejectionReason: string
  ) {
    try {
      const response = await adminAPI.rejectApplication(
        applicationId,
        rejectionReason
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to reject application");
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
