import { Types } from "mongoose";
import { ApiResponse } from "../../utils/responseHelper";
import { AvailabilityInfo, BankInfo, DocumentsInfo, IdentityInfo, PersonalInfo, SkillsInfo } from "./ITechnician";

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

export interface ApplicationResponse extends ApiResponse {
  missingSteps?: string[];
}

export interface ITechnicianApplicationData {
  _id: Types.ObjectId;
  technicianId?: Types.ObjectId;
  email: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  stepsCompleted: string[];
  personal: PersonalInfo;
  identity: IdentityInfo;
  skills: SkillsInfo;
  availability: AvailabilityInfo;
  bank: BankInfo;
  documents: DocumentsInfo;
  agreement: boolean;
  submittedAt?: Date;
  reviewNotes?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  resubmittedCount: number;
  lastSubmittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResubmitApplicationRequest {
  applicationId: string;
}