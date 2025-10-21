/* eslint-disable @typescript-eslint/no-explicit-any */
import { technicianAPI, type TechnicianProfile } from "../common/technicianApi";

export class TechnicianService {
  static async getProfile() {
    try {
      const response = await technicianAPI.getProfile();
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get users");
    }
  }
  static async updateAvailability(data: {
    availability: {
      isAvailable: boolean;
      weeklyAvailability: {
        [key: string]: {
          enabled: boolean;
          startTime: string;
          endTime: string;
        };
      };
    };
    workAreas: string[];
    serviceRadiusKm: number;
  }) {
    try {
      const response = await technicianAPI.updateAvailability(data)
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to update user status");
    }
  }
  static async updateBankPayment(data: {
    paymentDetails: {
      bankAccount: {
        holderName: string;
        accountNumber: string;
        ifscCode: string;
        bankName?: string;
      };
      upiId?: string;
      withdrawalPreference: "auto" | "manual";
    };
  }) {
    try {
      const response = await technicianAPI.updateBankPayment(data)
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to delete user");
    }
  }
  static async updateIdentityVerification(data: any) {
    try {
      const response = await technicianAPI.updateIdentityVerification(data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to reset Password");
    }
  }
  static async uploadDocument(formData: FormData) {
    try {
      const response = await technicianAPI.uploadDocument(formData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to reset Password");
    }
  }
  static async updateProfile(data: Partial<TechnicianProfile>) {
    try {
      const response = await technicianAPI.updateProfile(data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to reset Password");
    }
  }
  static async updateSkillsServices(data: {
    services: string[];
    experienceYears?: number;
    skills?: string[];
    certifications?: string[];
  }) {
    try {
      const response = await technicianAPI.updateSkillsServices(data)
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
