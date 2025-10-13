/* eslint-disable @typescript-eslint/no-explicit-any */
// In your technician API file
import api from '../utils/axiosConfig';

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
  status: 'pending' | 'active' | 'inactive' | 'suspended';
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
}

export interface ApplicationData {
  _id: string;
  phone: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  stepsCompleted: string[];
  personal: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
  };
  identity: {
    idType?: string;
    idNumber?: string;
    currentAddress?: string;
  };
  documents?: Record<string, any>;
  submittedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const technicianAPI = {
  // Profile - Updated to include address
  getProfile: () => api.get<{ success: boolean; data: { profile: TechnicianProfile } }>('/technician/profile'),
  
  // Update profile with address support
  updateProfile: (data: Partial<TechnicianProfile>) => 
    api.put<{ success: boolean; data: { profile: TechnicianProfile } }>('/technician/profile', data),
  
  // Get address specifically
  getAddress: () => 
    api.get<{ success: boolean; data: { address: any } }>('/technician/address'),
  
  // Update address
  updateAddress: (addressData: any) => 
    api.put<{ success: boolean; data: { address: any } }>('/technician/address', addressData),

  // Applications
  getApplication: (applicationId: string) => 
    api.get<{ success: boolean; data: { application: ApplicationData } }>(`/technician-application/${applicationId}`),
  
  getUserApplications: () => 
    api.get<{ success: boolean; data: { applications: ApplicationData[] } }>('/technician-application/user/applications'),
  
  startApplication: (data: { email: string; userId: string }) => 
    api.post<{ success: boolean; data: { applicationId: string; redirectTo?: string } }>('/technician-application/start', data),
  
  saveStep: (formData: FormData) => 
    api.post<{ success: boolean }>('/technician-application/save-step', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  submitApplication: (data: { applicationId: string }) => 
    api.post<{ success: boolean; data?: { user: any } }>('/technician-application/submit', data),
  
  resubmitApplication: (applicationId: string) => 
    api.patch<{ success: boolean }>(`/technician-application/${applicationId}/resubmit`),
  
  startNewAfterRejection: (data: { email: string }) => 
    api.post<{ success: boolean; data: { applicationId: string } }>('/technician-application/start-new-after-rejection', data),
};