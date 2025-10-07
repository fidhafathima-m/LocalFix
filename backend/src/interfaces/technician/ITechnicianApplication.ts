import { Types } from 'mongoose';

export interface StartApplicationRequest {
  email: string;
  userId: string;
}

export interface SaveStepRequest {
  applicationId: string;
  step: string;
  [key: string]: any;
}

export interface SubmitApplicationRequest {
  applicationId: string;
}

export interface ApplicationResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  missingSteps?: string[];
}

export interface ITechnicianApplicationData {
  _id: Types.ObjectId;
  technicianId?: Types.ObjectId;
  email: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  stepsCompleted: string[];
  personal: Record<string, any>;
  identity: Record<string, any>;
  skills: Record<string, any>;
  availability: Record<string, any>;
  bank: Record<string, any>;
  documents: Record<string, any>;
  agreement: boolean;
  submittedAt?: Date;
  reviewNotes?: string;
  rejectionReason?: string;
  resubmittedCount: number;
  lastSubmittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}