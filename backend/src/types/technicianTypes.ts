import { Types } from "mongoose";

// src/types/technicianTypes.ts
export type UnifiedTechnician = {
  _id: string | Types.ObjectId;
  userId: string | Types.ObjectId;
  displayName: string;
  email?: string;
  phone?: string;
  profilePictureUrl?: string;
  bio: string; // Made required to match both interfaces
  
  // Personal Information
  personalInfo?: {
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    languages?: string[];
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
  };

  // Identity Verification
  identityVerification?: {
    governmentIdType?: string;
    governmentIdNumber?: string;
    idDocument?: string;
    verified?: boolean;
    verificationStatus?: "pending" | "approved" | "rejected";
    verifiedAt?: Date;
  };

  // Skills & Services
  services: string[];
  experienceYears?: number;
  basePrices?: { [service: string]: number };
  serviceRates?: Record<string, number>;
  skills?: {
    services?: string[];
    yearsOfExperience?: string;
    languages?: string[];
    bio?: string;
    serviceAreas?: string[];
    workRadius?: string;
  };
  certifications?: string[];

  // Availability & Work Preferences
  availability?: {
    isAvailable: boolean;
    weeklyAvailability?: {
      [day: string]: {
        enabled: boolean;
        startTime: string;
        endTime: string;
      };
    };
  };
  workAreas: string[];
  serviceRadiusKm?: number;

  // Location
  currentLocation?: {
    type: "Point";
    coordinates: [number, number];
  };

  // Bank & Payment Details
  paymentDetails?: {
    bankAccount: {
      holderName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
    };
    upiId?: string;
    withdrawalPreference: "auto" | "manual";
  };

  // Documents
  documents?: Array<{
    _id: string | Types.ObjectId;
    type: string;
    fileName: string;
    url: string;
    uploadedAt: Date;
    verified: boolean;
    status: "pending" | "approved" | "rejected";
    verifiedAt?: Date;
  }>;

  // Status & Ratings
  status: "not-applied" | "draft" | "submitted" | "under_review" | "approved" | "rejected" | "suspended";
  averageRating?: number;
  ratingCount?: number;
  totalJobs?: number;
  completedJobs?: number;
  ongoingJobs?: number;
  totalEarnings?: number;

  // Application/Resubmission tracking
  resubmittedCount?: number;
  previousApplicationId?: string | Types.ObjectId;

  // Suspension/Rejection Details
  suspensionReason?: string;
  suspendedAt?: Date;
  rejectionReason?: string;
  rejectedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
};