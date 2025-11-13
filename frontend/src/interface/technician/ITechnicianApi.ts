/* eslint-disable @typescript-eslint/no-explicit-any */
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
  workAreas: string[];
  serviceRadiusKm?: number;
  availability?: {
    isAvailable?: boolean;
    weeklyPattern?: { 
      [key: string]: {
        available: boolean; 
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