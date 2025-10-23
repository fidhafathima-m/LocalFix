import { Types, Document } from "mongoose";

export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export type ServiceRates = Record<string, number>;

export interface PersonalInfo {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  languages?: string[];
  bio?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
}
export interface IdentityInfo {
  governmentIdType?: string;
    governmentIdNumber?: string;
    idDocument?: string;
    verified?: boolean;
    verificationStatus?: "pending" | "approved" | "rejected";
    verifiedAt?: Date;
  location?: {
    coordinates?: [number, number];
    formattedAddress?: string;
    placeId?: string;
  };
  address?: {
    street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  }
}

export interface SkillsInfo {
  services?: string[];
  yearsOfExperience?: string; 
  languages?: string[];
  bio?: string;
  serviceAreas?: string[];
  workRadius?: string;
}

export interface DayAvailability {
  available?: boolean;
  startTime?: string;
  endTime?: string;
}

export interface WeeklyAvailability {
  monday?: DayAvailability;
  tuesday?: DayAvailability;
  wednesday?: DayAvailability;
  thursday?: DayAvailability;
  friday?: DayAvailability;
  saturday?: DayAvailability;
  sunday?: DayAvailability;
}

export interface AvailabilityInfo {
  serviceAreas?: string[];
  workRadius?: string; 
  availability?: WeeklyAvailability;
}

export interface BankInfo {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  bankName?: string;
  withdrawalPreference?: string;
}

export interface DocumentFile {
  url?: string;
  publicId?: string;
  filename?: string;
  mimetype?: string;
  size?: number;
  uploadedAt?: Date;
  verified?: boolean;
  uploadFailed?: boolean;
}

export interface DocumentsInfo {
  idProof?: DocumentFile;
  addressProof?: DocumentFile;
  passportPhoto?: DocumentFile;
  profilePhoto?: DocumentFile
}


export interface ITechnician extends Document {
  statusCode(statusCode: any): unknown;
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  displayName: string;
  email?: string;
  phone?: string;
  profilePictureUrl?: string;
  bio?: string;

  // Personal Information
  personalInfo?: PersonalInfo;

  // Identity Verification
  identityVerification?: IdentityInfo;

  // Skills & Services
  services: string[];
  experienceYears?: number;
  basePrices?: { [service: string]: number };
  serviceRates?: Record<string, number>;
  skills?: SkillsInfo;
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
    _id: Types.ObjectId;
    type: string;
    fileName: string;
    url: string;
    uploadedAt: Date;
    verified: boolean;
    status: "pending" | "approved" | "rejected";
    verifiedAt?: Date;
  }>;

  // Status & Ratings
  status:
    | "not-applied"
    | "draft"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected"
    | "suspended";
  averageRating?: number;
  ratingCount?: number;
  totalJobs?: number;
  completedJobs?: number;
  ongoingJobs?: number;
  totalEarnings?: number;

  // Application/Resubmission tracking
  resubmittedCount?: number;
  previousApplicationId?: Types.ObjectId;

  // Suspension/Rejection Details
  suspensionReason?: string;
  suspendedAt?: Date;
  rejectionReason?: string;
  rejectedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
