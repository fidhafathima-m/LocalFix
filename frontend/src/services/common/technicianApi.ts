/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../utils/axiosConfig";

export interface TechnicianProfile {
  _id: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string;
  services: string[];
  experienceYears: number;
  averageRating: number;
  ratingCount: number;
  profilePictureUrl: string;
  isVerified: boolean;
  status: "pending" | "active" | "inactive" | "suspended";
  isApproved: boolean;
  personalInfo?: {
    fullName?: string;
    gender?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    languages?: string[];
  };
  identityVerification?: {
    governmentIdType?: string;
    governmentIdNumber?: string;
    idDocument?: string;
    verified?: boolean;
    verificationStatus?: "pending" | "approved" | "rejected";
    verifiedAt?: string;
  };
  // Availability & Work Preferences
  workAreas: string[];
  serviceRadiusKm?: number;
  availability?: {
    isAvailable?: boolean;
    weeklyAvailability?: {
      [key: string]: {
        enabled: boolean;
        startTime: string;
        endTime: string;
      };
    };
  };
  // Bank & Payment Details
  paymentDetails?: {
    bankAccount?: {
      holderName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
    };
    upiId?: string;
    withdrawalPreference?: 'auto' | 'manual';
  };
  skills?: string[];
  certifications?: string[];
  bio?: string;
  createdAt: string;
  updatedAt: string;
  suspensionReason?: string;
  suspendedAt?: string;
}

export interface ApplicationData {
  _id: string;
  phone: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  stepsCompleted: string[];
  personal: {
    fullName: string;
    phoneNumber: string;
    email: string;
    dateOfBirth: string;
    gender: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
      landmark: string;
    };
  };
  identity: {
    idType: string;
    idNumber: string;
    currentAddress?: string;
  };
  documents?: Record<string, any>;
  availability: {
    monday: {
      available: boolean;
      startTime: string;
      endTime: string;
    };
    tuesday: {
      available: boolean;
      startTime: string;
      endTime: string;
    };
    wednesday: {
      available: boolean;
      startTime: string;
      endTime: string;
    };
    thursday: {
      available: boolean;
      startTime: string;
      endTime: string;
    };
    friday: {
      available: boolean;
      startTime: string;
      endTime: string;
    };
    saturday: {
      available: boolean;
      startTime: string;
      endTime: string;
    };
    sunday: {
      available: boolean;
      startTime: string;
      endTime: string;
    };
  };
  skills?: Record<string, any>;
  agreement: boolean;
  bank?: Record<string, any>;
  submittedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// FIX: Remove the extra data wrapping
const normalizeResponse = (response: any) => {
  const responseData = response.data || response;
  
  return {
    success: responseData.success,
    message: responseData.message,
    data: responseData.data, // Remove the || responseData part
    statusCode: responseData.statusCode || 200,
    error: responseData.error
  };
};

export const technicianAPI = {
  getProfile: async () => {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: { profile: TechnicianProfile };
        statusCode: number;
      }>("/technician/profile");
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to get profile",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  updateProfile: async (data: Partial<TechnicianProfile>) => {
    try {
      const response = await api.put<{
        success: boolean;
        message: string;
        data: { profile: TechnicianProfile };
        statusCode: number;
      }>("/technician/profile", data);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to update profile",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  getAddress: async () => {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: { address: any };
        statusCode: number;
      }>("/technician/address");
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to get address",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  updateAddress: async (addressData: any) => {
    try {
      const response = await api.put<{
        success: boolean;
        message: string;
        data: { address: any };
        statusCode: number;
      }>("/technician/address", addressData);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to update address",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  getApplication: async (applicationId: string) => {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: { application: ApplicationData };
        statusCode: number;
      }>(`/technician-application/${applicationId}`);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to get application",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  getUserApplications: async () => {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: { applications: ApplicationData[] };
        statusCode: number;
      }>("/technician-application/user/applications");
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to get user applications",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  startApplication: async (data: { email: string; userId: string }) => {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data: { applicationId: string; redirectTo?: string };
        statusCode: number;
      }>("/technician-application/start", data);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to start application",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  saveStep: async (formData: FormData) => {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data: any;
        statusCode: number;
      }>("/technician-application/save-step", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to save step",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  submitApplication: async (data: { applicationId: string }) => {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data?: { user: any };
        statusCode: number;
      }>("/technician-application/submit", data);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to submit application",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  resubmitApplication: async (applicationId: string) => {
    try {
      const response = await api.patch<{
        success: boolean;
        message: string;
        data: any;
        statusCode: number;
      }>(`/technician-application/${applicationId}/resubmit`);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to resubmit application",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  startNewAfterRejection: async (data: { email: string }) => {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data: { applicationId: string };
        statusCode: number;
      }>("/technician-application/start-new-after-rejection", data);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to start new application",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  // technician profile
  uploadPhoto: async (formData: FormData) => {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data: { profilePictureUrl: string };
        statusCode: number;
      }>("/technician/profile/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to upload photo",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  updatePersonalInfo: async (data: any) => {
    try {
      const response = await api.put<{
        success: boolean;
        message: string;
        data: { profile: TechnicianProfile };
        statusCode: number;
      }>("/technician/profile/personal-info", data);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to update personal info",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  updateIdentityVerification: async (data: any) => {
    try {
      const response = await api.put<{
        success: boolean;
        message: string;
        data: { profile: TechnicianProfile };
        statusCode: number;
      }>("/technician/profile/identity-verification", data);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to update identity verification",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  uploadDocument: async (formData: FormData) => {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data: { document: any };
        statusCode: number;
      }>("/technician/profile/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to upload document",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  updateSkillsServices: async (data: {
    services: string[];
    experienceYears?: number;
    skills?: string[];
    certifications?: string[];
  }) => {
    try {
      const response = await api.put<{
        success: boolean;
        message: string;
        data: { profile: TechnicianProfile };
        statusCode: number;
      }>("/technician/profile/skills-services", data);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to update skills and services",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  updateAvailability: async (data: {
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
  }) => {
    try {
      const response = await api.put<{
        success: boolean;
        message: string;
        data: { profile: TechnicianProfile };
        statusCode: number;
      }>("/technician/profile/availability", data);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to update availability",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },

  updateBankPayment: async (data: {
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
  }) => {
    try {
      const response = await api.put<{
        success: boolean;
        message: string;
        data: { profile: TechnicianProfile };
        statusCode: number;
      }>("/technician/profile/bank-payment", data);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to update bank payment details",
        error: "Network error",
        data: null,
        statusCode: 500
      };
    }
  },
};