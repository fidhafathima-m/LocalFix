/* eslint-disable @typescript-eslint/no-explicit-any */
import { TECHNICIAN_ROUTES } from "../../routes/technicianRoutes";
import api from "../../utils/axiosConfig";

export interface SlotRule {
  _id: string;
  technicianId: string;
  name: string;
  rruleString: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  bookingBufferBeforeMinutes: number;
  bookingBufferAfterMinutes: number;
  maxBookingsPerSlot: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  status: "available" | "booked" | "blocked";
  maxBookings: number;
  currentBookings: number;
}

export interface TechnicianAvailability {
  _id: string;
  technicianId: string;
  date: string;
  timeSlots: TimeSlot[];
  isRecurring: boolean;
  slotRuleId: string;
  createdAt: string;
  updatedAt: string;
}

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
    idType?: string;
    idNumber?: string;
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
    withdrawalPreference?: "auto" | "manual";
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
      // ✅ ADD CACHE BUSTING HERE
      const timestamp = new Date().getTime();
      const response = await api.get<{
        success: boolean;
        message: string;
        data: { profile: TechnicianProfile };
        statusCode: number;
      }>(`${TECHNICIAN_ROUTES.PROFILE.BASE}?nocache=${timestamp}`); // Add timestamp to URL
      
      console.log('🔄 Fresh API call with cache busting, timestamp:', timestamp);
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

  // Add the new availability methods
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

  // Add routes for slot rules and availability in your TECHNICIAN_ROUTES
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
      console.log('🔍 getApplicationForEdit called with ID:', applicationId);
      console.log('🔍 Route being called:', TECHNICIAN_ROUTES.APPLICATION.EDIT(applicationId));
      
      // First try the edit endpoint
      try {
        const response = await api.get<{
          success: boolean;
          message: string;
          data: { application: ApplicationData };
          statusCode: number;
        }>(TECHNICIAN_ROUTES.APPLICATION.EDIT(applicationId)); 
        console.log('🔍 getApplicationForEdit response:', response.data);
        return normalizeResponse(response);
      } catch (editError: any) {
        console.log('❌ Edit endpoint failed, falling back to regular endpoint:', editError.message);
        
        // Fallback to regular getApplication endpoint
        const fallbackResponse = await api.get<{
          success: boolean;
          message: string;
          data: { application: ApplicationData };
          statusCode: number;
        }>(TECHNICIAN_ROUTES.APPLICATION.BY_ID(applicationId));
        
        console.log('🔍 Fallback response:', fallbackResponse.data);
        return normalizeResponse(fallbackResponse);
      }
    } catch (error: any) {
      console.error('❌ Both endpoints failed:', error);
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
    weeklyAvailability: {
      [key: string]: {
        enabled: boolean;
        startTime: string;
        endTime: string;
      };
    };
    availableWeeks?: number[]; // Add this
  };
  serviceAreas: string[];
  workRadius: number;
}) => {
  try {
    // Map frontend field names to backend expected names
    const backendData = {
      availability: data.availability,
      workAreas: data.serviceAreas,        // Map serviceAreas → workAreas
      serviceRadiusKm: data.workRadius,    // Map workRadius → serviceRadiusKm
    };

    console.log('🌐 API - Sending to backend:', backendData);

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
};