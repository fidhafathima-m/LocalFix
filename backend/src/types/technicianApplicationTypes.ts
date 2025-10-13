import { Document, Types } from 'mongoose';

export interface ITechnicianApplication extends Document {
  technicianId?: Types.ObjectId;
  phone: string;
  status: 'not-applied' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  stepsCompleted: string[];
  personal: Record<string, any>;
  identity: Record<string, any>;
  skills: Record<string, any>;
  availability: Record<string, any>;
  bank: Record<string, any>;
  agreement: boolean;
  submittedAt?: Date;
  reviewNotes?: string;
  rejectionReason?: string;
  resubmittedCount: number;
  lastSubmittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITimeSlot {
  start: string;
  end: string;
  status: 'available' | 'booked' | 'blocked';
}

export interface ITechnicianAvailability extends Document {
  technicianId: Types.ObjectId;
  date: Date;
  timeSlots: ITimeSlot[];
  isRecurring: boolean;
  slotRuleId?: Types.ObjectId;
}

export interface ITechnicianDocument extends Document {
  technicianId?: Types.ObjectId;
  applicationId?: Types.ObjectId;
  type: 'idProof' | 'addressProof' | 'experienceCertificate' | 'policeVerification' | 'tradeLicense' | 'other';
  fileUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
  verifiedAt?: Date;
  metadata: Record<string, any>;
}

export interface IGeoPoint {
  type: 'Point';
  coordinates: [number, number];
}

export interface ITechnician extends Document {
  userId: Types.ObjectId;
  displayName: string;
  bio: string;
  experienceYears: number;
  services: Types.ObjectId[];
  serviceRates: Record<string, number>;
  workAreas: string[];
  serviceRadiusKm: number;
  currentLocation?: IGeoPoint;
  averageRating: number;
  ratingCount: number;
  status: 'not-applied' | 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  rejectionReason?: string;
  resubmittedCount: number;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request and Response types
export interface StartApplicationRequest {
  userId: string
  email: string;
}

export interface SaveStepRequest {
  applicationId: string;
  step: string;
  [key: string]: any;
}

export interface SubmitApplicationRequest {
  applicationId: string;
}

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
  error?: string;
  missingSteps?: string[];
}