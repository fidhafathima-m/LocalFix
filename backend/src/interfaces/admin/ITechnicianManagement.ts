// src/interfaces/admin/ITechnicianManagement.ts
import { Types } from 'mongoose';

// ADMIN VIEW - For admin panel display (combines data from multiple sources)
// In your ITechnicianManagement.ts file
export interface IAdminTechnician {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  displayName: string;
  email?: string;
  phone?: string;
  services: string[];
  experienceYears: number;
  workAreas: string[];
  serviceRadiusKm: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  averageRating: number;
  ratingCount: number;
  totalJobs?: number;
  completedJobs?: number;
  ongoingJobs?: number;
  totalEarnings?: number;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    email: string;
    phone: string;
    fullName: string;
    createdAt: Date;
  };
  personalInfo?: {
    fullName: string;
    gender?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    languages?: string[];
    address?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  documents?: { // ✅ ADD THIS
    aadhaarCard?: { url: string; verified: boolean };
    panCard?: { url: string; verified: boolean };
    drivingLicense?: { url: string; verified: boolean };
    [key: string]: any;
  };
  availability?: any;
}

// DATABASE SCHEMA - For the actual Technician model in database
export interface ITechnician {
  _id: Types.ObjectId;
  phone?: string;
  personalInfo?: {
    fullName: string;
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
  userId: Types.ObjectId;
  displayName: string;
  bio: string;
  experienceYears: number;
  services: string[];
  serviceRates: Record<string, number>;
  workAreas: string[];
  serviceRadiusKm: number;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number];
  };
  averageRating: number;
  ratingCount: number;
  status: 'not-applied' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  resubmittedCount: number;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITechnicianApplication {
  _id: Types.ObjectId;
  technicianId?: Types.ObjectId;
  email: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  stepsCompleted: string[];
  personal: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    gender?: string;
    dateOfBirth?: string;
    languages?: string[];
    address?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  identity: Record<string, any>;
  skills: {
    services?: string[];
    yearsOfExperience?: number;
    bio?: string;
    serviceAreas?: string[];
    workRadius?: string;
  };
  availability: Record<string, any>;
  bank: Record<string, any>;
  documents: Record<string, any>;
  agreement: boolean;
  submittedAt?: Date;
  reviewNotes?: string;
  rejectionReason?: string;
  rejectedAt?: string
  resubmittedCount: number;
  lastSubmittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: any;
}

// Update response interfaces to use IAdminTechnician for admin views
export interface TechnicianListResponse {
  success: boolean;
  message: string;
  data?: {
    technicians: IAdminTechnician[]; // Changed from ITechnician to IAdminTechnician
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  error?: string;
}

export interface SingleTechnicianResponse {
  success: boolean;
  message: string;
  data?: {
    technician: IAdminTechnician; // Single technician for get by ID
  };
  error?: string;
}

export interface ApplicationListResponse {
  success: boolean;
  message: string;
  data?: {
    applications: ITechnicianApplication[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  error?: string;
}

export interface TechnicianStatsResponse {
  success: boolean;
  message: string;
  data?: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    recent: number;
  };
  error?: string;
}

export interface ApplicationStatsResponse {
  success: boolean;
  message: string;
  data?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: number;
  };
  error?: string;
}

export interface UpdateStatusRequest {
  status: 'approved' | 'suspended' | 'rejected';
  emailNotification?: boolean
  reason?: string
}

export interface ApproveApplicationRequest {
  reviewNotes?: string;
}

export interface RejectApplicationRequest {
  rejectionReason: string;
  emailNotification?: boolean
}

export interface TechnicianFilters {
  status?: string;
  service?: string;
  rating?: string;
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApplicationFilters {
  status?: string;
  search?: string;
  service?: string;
  page?: number;
  limit?: number;
}