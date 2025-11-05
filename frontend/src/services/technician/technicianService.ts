/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TechnicianProfile } from "../../store/slices/technicianSlice";
import { technicianAPI } from "../common/technicianApi";

export class TechnicianService {
  static async getProfile() {
    try {
      const response = await technicianAPI.getProfile();
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get technician profile");
    }
  }
  static async getTechnicianAvailability() {
    try {
      const response = await technicianAPI.getTechnicianAvailability();
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get technician availability");
    }
  }
  static async getSlotRules() {
    try {
      const response = await technicianAPI.getSlotRules();
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to get technician availability");
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
    availableWeeks?: number[]; 
  };
  serviceAreas: string[];
  workRadius: number;
}) {
  try {
    const response = await technicianAPI.updateAvailability(data);
    return this.handleResponse(response);
  } catch (error) {
    throw this.handleError(error, "Failed to update availability");
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
      const response = await technicianAPI.updateBankPayment(data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to update bank payments");
    }
  }
  static async updateIdentityVerification(data: any) {
    try {
      const response = await technicianAPI.updateIdentityVerification(data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to update identity verification");
    }
  }
  static async uploadDocument(formData: FormData) {
    try {
      const response = await technicianAPI.uploadDocument(formData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to upload document");
    }
  }
  static async updateProfile(data: Partial<TechnicianProfile>) {
    try {
      const response = await technicianAPI.updateProfile(data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to update profile");
    }
  }
  static async updatePersonalInfo(data: any) {
    try {
      const response = await technicianAPI.updatePersonalInfo(data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to update profile");
    }
  }
  static async uploadPhoto(formData: FormData) {
    try {
      const response = await technicianAPI.uploadPhoto(formData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to update profile photo");
    }
  }
  static async updatePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    try {
      const response = await technicianAPI.updatePassword(data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to update password");
    }
  }
  static async updateSkillsServices(data: {
    services: string[];
    experienceYears?: number;
    skills?: string[];
    certifications?: string[];
  }) {
    try {
      const response = await technicianAPI.updateSkillsServices(data);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to update skills and services");
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
