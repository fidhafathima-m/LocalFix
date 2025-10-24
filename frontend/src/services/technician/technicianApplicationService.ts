/* eslint-disable @typescript-eslint/no-explicit-any */
import { technicianAPI } from "../common/technicianApi";

export class TechnicianApplicationService {
  static async startApplication(data: { email: string; userId: string }) {
    try {
      const response = await technicianAPI.startApplication(data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to start application");
    }
  }
  static async getApplication(applicationId: string) {
    try {
      const response = await technicianAPI.getApplication(applicationId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get application");
    }
  }
  static async saveStep(formData: FormData) {
    try {
      const response = await technicianAPI.saveStep(formData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to save step");
    }
  }
  static async submitApplication(data: {
    applicationId: string;
    userId: string;
  }) {
    try {
      const response = await technicianAPI.submitApplication(data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to submit application");
    }
  }
  static async resubmitApplication(applicationId: string) {
    try {
      const response = await technicianAPI.resubmitApplication(applicationId);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to re-submit application");
    }
  }
  static async getApplicationForEdit(applicationId: string) {
  try {
    console.log('🔍 Service: getApplicationForEdit called with ID:', applicationId);
    
    const response = await technicianAPI.getApplicationForEdit(applicationId);
    
    // If the response indicates failure, try the regular getApplication
    if (!response.success || !response.data) {
      console.log('🔄 Edit endpoint failed, trying regular getApplication...');
      const fallbackResponse = await technicianAPI.getApplication(applicationId);
      return this.handleResponse(fallbackResponse);
    }
    
    return this.handleResponse(response);
  } catch (error) {
    console.error('❌ Service: getApplicationForEdit error:', error);
    
    // Last resort: try regular getApplication
    try {
      console.log('🔄 Service: Trying fallback to regular getApplication...');
      const fallbackResponse = await technicianAPI.getApplication(applicationId);
      return this.handleResponse(fallbackResponse);
    } catch (fallbackError) {
      throw this.handleError(fallbackError, "Failed to get application for editing");
    }
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
