import { ApiResponse } from '../../utils/responseHelper';
import { Types } from 'mongoose';
import {
  AvailabilityInfo,
  BankInfo,
  DocumentsInfo,
  IdentityInfo,
  WeeklyPattern,
} from '../technician/ITechnician';

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
  bio: string;
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
    dateOfBirth?: string | Date | undefined;
    languages?: string[];
    address?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  identityVerification?: IdentityInfo;
  documents?: {
    aadhaarCard?: { url: string; verified: boolean };
    panCard?: { url: string; verified: boolean };
    drivingLicense?: { url: string; verified: boolean };
    [key: string]: unknown;
  };
  availability?: AvailabilityInfo;
  suspensionReason?: string;
  suspendedAt?: Date;
}

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
  totalJobs?: number;
  completedJobs?: number;
  ongoingJobs?: number;
  totalEarnings?: number;
  identityVerification?: IdentityInfo;
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
  status:
    | 'not-applied'
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected';
  suspensionReason?: string;
  suspendedAt?: Date;
  rejectionReason?: string;
  resubmittedCount: number;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  availability?: {
    weeklyPattern: {
      [key: string]: {
        available: boolean;
        startTime: string;
        endTime: string;
      };
    };
  };
}

export interface ITechnicianApplication {
  toObject(): ITechnicianApplication;
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
    address?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  identity: IdentityInfo;
  skills: {
    services?: string[];
    yearsOfExperience?: number;
    bio?: string;
    serviceAreas?: string[];
    workRadius?: string;
    languages?: string[];
  };
  availability: {
    serviceAreas: string[];
    workRadius: string;
    weeklyPattern: WeeklyPattern;
  };
  bank: BankInfo;
  documents: DocumentsInfo;
  agreement: boolean;
  submittedAt?: Date;
  reviewNotes?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  resubmittedCount: number;
  lastSubmittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: unknown;
}

export interface TechnicianListResponse
  extends ApiResponse<{
    technicians: IAdminTechnician[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {}

export interface SingleTechnicianResponse
  extends ApiResponse<{
    technician: IAdminTechnician;
  }> {}

export interface ApplicationListResponse
  extends ApiResponse<{
    applications: ITechnicianApplication[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {}

export interface TechnicianStatsResponse
  extends ApiResponse<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    recent: number;
  }> {}

export interface ApplicationStatsResponse
  extends ApiResponse<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: number;
  }> {}

export interface UpdateStatusRequest {
  status: 'approved' | 'suspended' | 'rejected';
  emailNotification?: boolean;
  reason?: string;
}

export interface ApproveApplicationRequest {
  reviewNotes?: string;
}

export interface RejectApplicationRequest {
  rejectionReason: string;
  emailNotification?: boolean;
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
