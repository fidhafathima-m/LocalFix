/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../utils/axiosConfig";

export interface TechnicianProfile {
  _id: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string;
  services: string[];
  experienceYears: number;
  workAreas: string[];
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
  bank?: Record<string,any>;
  submittedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const technicianAPI = {
  getProfile: () =>
    api.get<{ success: boolean; data: { profile: TechnicianProfile } }>(
      "/technician/profile"
    ),

  updateProfile: (data: Partial<TechnicianProfile>) =>
    api.put<{ success: boolean; data: { profile: TechnicianProfile } }>(
      "/technician/profile",
      data
    ),

  getAddress: () =>
    api.get<{ success: boolean; data: { address: any } }>(
      "/technician/address"
    ),

  updateAddress: (addressData: any) =>
    api.put<{ success: boolean; data: { address: any } }>(
      "/technician/address",
      addressData
    ),

  getApplication: (applicationId: string) =>
    api.get<{ success: boolean; data: { application: ApplicationData } }>(
      `/technician-application/${applicationId}`
    ),

  getUserApplications: () =>
    api.get<{ success: boolean; data: { applications: ApplicationData[] } }>(
      "/technician-application/user/applications"
    ),

  startApplication: (data: { email: string; userId: string }) =>
    api.post<{
      success: boolean;
      data: { applicationId: string; redirectTo?: string };
    }>("/technician-application/start", data),

  saveStep: (formData: FormData) =>
    api.post<{ success: boolean }>(
      "/technician-application/save-step",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    ),

  submitApplication: (data: { applicationId: string }) =>
    api.post<{ success: boolean; data?: { user: any } }>(
      "/technician-application/submit",
      data
    ),

  resubmitApplication: (applicationId: string) =>
    api.patch<{ success: boolean }>(
      `/technician-application/${applicationId}/resubmit`
    ),

  startNewAfterRejection: (data: { email: string }) =>
    api.post<{ success: boolean; data: { applicationId: string } }>(
      "/technician-application/start-new-after-rejection",
      data
    ),
};
