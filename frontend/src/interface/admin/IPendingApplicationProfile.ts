
export interface DocumentInfo {
  url: string;
  verified?: boolean;
  type?: string;
  uploadedAt?: string;
  filename?: string;
  mimetype?: string;
  size?: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
}

export interface Location {
  coordinates: number[];
  formattedAddress: string;
  type?: string;
}

export interface AvailabilityDuration {
  months: number;
  startDate: string;
}

export interface WeeklyPattern {
  [key: string]: {
    available: boolean;
    startTime: string;
    endTime: string;
  };
}

export interface AvailabilityData {
  duration?: AvailabilityDuration;
  availableWeeks?: number[];
  weeklyPattern?: WeeklyPattern;
}

export interface Availability {
  serviceAreas?: string[];
  workRadius?: string;
  availability?: AvailabilityData;
}

export interface BankDetails {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  bankName?: string;
  withdrawalPreference?: string;
}

export interface PendingApplication {
  _id: string;
  technicianId: string;
  email: string;
  profilePictureUrl?: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  stepsCompleted: string[];

  // Personal Information
  personal: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    dateOfBirth?: string;
    gender?: string;
    languages?: string[];
    address?: Address;
  };

  // Identity & Verification
  identity: {
    idType?: string;
    idNumber?: string;
    address?: Address; // Can be string or object
    location?: Location; // Can be string or object
    verified?: boolean;
    verificationStatus?: "pending" | "approved" | "rejected";
    verifiedAt?: string;
  };

  // Skills & Services
  skills: {
    services?: string[];
    yearsOfExperience?: number | string;
    languages?: string[];
    bio?: string;
    serviceAreas?: string[];
    workRadius?: number | string;
  };

  // Availability & Work Preferences
  availability?: Availability;

  // Banking Details
  bank?: BankDetails;

  // Documents
  documents?: Record<string, DocumentInfo>;

  // Agreement
  agreement?: boolean;

  // Timestamps
  submittedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDisplay {
  key: string;
  displayName: string;
  url: string;
  verified: boolean;
  type: string;
  isPdf: boolean;
  uploadedAt?: string;
}