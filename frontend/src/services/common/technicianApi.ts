/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  SlotRule,
  TechnicianAvailability,
} from "../../interface/technician/ITechnicianApi";
import { TECHNICIAN_ROUTES } from "../../routes/technicianRoutes";
import type {
  ApplicationData,
  TechnicianProfile,
} from "../../store/slices/technicianSlice";
import api from "../../utils/axiosConfig";
import type {
  CreateSparePartsRequestDto,
  SparePartsRequestResponse,
} from "../technician/sparePartsService";

const normalizeResponse = (response: any) => {
  const responseData = response.data || response;

  return {
    success: responseData.success,
    message: responseData.message,
    data: responseData.data,
    statusCode: responseData.statusCode || 200,
    error: responseData.error,
  };
};

export const technicianAPI = {
  getProfile: async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await api.get<{
        success: boolean;
        message: string;
        data: { profile: TechnicianProfile };
        statusCode: number;
      }>(`${TECHNICIAN_ROUTES.PROFILE.BASE}?nocache=${timestamp}`);

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
        statusCode: 500,
      };
    }
  },

  getSlotRules: async () => {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: { slotRules: SlotRule[] };
        statusCode: number;
      }>(TECHNICIAN_ROUTES.PROFILE.SLOT_RULES);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to get slot rules",
        error: "Network error",
        data: null,
        statusCode: 500,
      };
    }
  },

  getTechnicianAvailability: async () => {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: { availability: TechnicianAvailability[] };
        statusCode: number;
      }>(TECHNICIAN_ROUTES.PROFILE.TECHNICIAN_AVAILABILITY);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to get technician availability",
        error: "Network error",
        data: null,
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.PROFILE.BASE, data);
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
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.ADDRESS);
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
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.ADDRESS, addressData);
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
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.APPLICATION.BY_ID(applicationId));
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
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.APPLICATION.USER_APPLICATIONS);
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
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.APPLICATION.START, data);
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
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.APPLICATION.SAVE_STEP, formData, {
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
        statusCode: 500,
      };
    }
  },

  submitApplication: async (data: {
    applicationId: string;
    userId: string;
  }) => {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data?: { user: any };
        statusCode: number;
      }>(TECHNICIAN_ROUTES.APPLICATION.SUBMIT, data);
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
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.APPLICATION.RESUBMIT(applicationId));
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
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.APPLICATION.START_NEW_AFTER_REJECTION, data);
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
        statusCode: 500,
      };
    }
  },

  getApplicationForEdit: async (applicationId: string) => {
    try {
      try {
        const response = await api.get<{
          success: boolean;
          message: string;
          data: { application: ApplicationData };
          statusCode: number;
        }>(TECHNICIAN_ROUTES.APPLICATION.EDIT(applicationId));
        return normalizeResponse(response);
      } catch (editError: any) {
        console.log(
          "Edit endpoint failed, falling back to regular endpoint:",
          editError.message
        );

        const fallbackResponse = await api.get<{
          success: boolean;
          message: string;
          data: { application: ApplicationData };
          statusCode: number;
        }>(TECHNICIAN_ROUTES.APPLICATION.BY_ID(applicationId));

        return normalizeResponse(fallbackResponse);
      }
    } catch (error: any) {
      console.error("Both endpoints failed:", error);
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to get application for editing",
        error: "Network error",
        data: null,
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.PROFILE.UPLOAD_PHOTO, formData, {
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
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.PROFILE.PERSONAL_INFO, data);
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
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.PROFILE.IDENTITY_VERIFICATION, data);
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
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.PROFILE.UPLOAD_DOCUMENT, formData, {
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
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.PROFILE.SKILLS_SERVICES, data);
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
        statusCode: 500,
      };
    }
  },

  updateAvailability: async (data: {
    availability: {
      isAvailable: boolean;
      weeklyPattern: {
        // Changed from weeklyAvailability
        [key: string]: {
          available: boolean; // Changed from enabled
          startTime: string;
          endTime: string;
        };
      };
      availableWeeks?: number[];
    };
    serviceAreas: string[];
    workRadius: number;
  }) => {
    try {
      const backendData = {
        availability: data.availability,
        workAreas: data.serviceAreas,
        serviceRadiusKm: data.workRadius,
      };

      const response = await api.put<{
        success: boolean;
        message: string;
        data: { profile: TechnicianProfile };
        statusCode: number;
      }>(TECHNICIAN_ROUTES.PROFILE.AVAILABILITY, backendData);
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
        statusCode: 500,
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
      }>(TECHNICIAN_ROUTES.PROFILE.BANK_PAYMENT, data);
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
        statusCode: 500,
      };
    }
  },

  updatePassword: async (data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      const response = await api.put<{
        success: boolean;
        message: string;
        data: any;
        statusCode: number;
      }>(TECHNICIAN_ROUTES.PROFILE.UPDATE_PASSWORD, data);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to update password",
        error: "Network error",
        data: null,
        statusCode: 500,
      };
    }
  },
  requestSpareParts: async (data: CreateSparePartsRequestDto) => {
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        data: SparePartsRequestResponse;
        statusCode: number;
      }>(TECHNICIAN_ROUTES.SPARE_PARTS.REQUESTS, data);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to request spare parts",
        error: "Network error",
        data: null,
        statusCode: 500,
      };
    }
  },

  getSparePartsRequests: async (orderId: string) => {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: SparePartsRequestResponse[];
        statusCode: number;
      }>(TECHNICIAN_ROUTES.SPARE_PARTS.REQUESTS_BY_ORDER(orderId));
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to get spare parts requests",
        error: "Network error",
        data: null,
        statusCode: 500,
      };
    }
  },

  updateSparePartsStatus: async (
    requestId: string,
    data: {
      status: string;
      customerNotes?: string;
    }
  ) => {
    try {
      const response = await api.put<{
        success: boolean;
        message: string;
        data: SparePartsRequestResponse;
        statusCode: number;
      }>(TECHNICIAN_ROUTES.SPARE_PARTS.UPDATE_STATUS(requestId), data);
      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to update spare parts status",
        error: "Network error",
        data: null,
        statusCode: 500,
      };
    }
  },
};
