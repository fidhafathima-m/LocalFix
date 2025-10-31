import { PersonalInfo } from "../../../interfaces/technician/ITechnician";
import {
  ITechnician,
  ITechnicianApplication,
  TechnicianFilters,
  ApplicationFilters,
} from "../../admin/ITechnicianManagement";
import { Types } from "mongoose";
import { IUser } from "@/interfaces/admin/IUserManagements";
import { IUserAddress } from "@/models/UserAddressSchema";

export type FilterQuery = Record<string, unknown>;

export interface StatusUpdateData {
  notes?: string;
  reason?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  rejectedAt?: Date;
}
interface TechnicianFilter {
  status?: string | { $in: string[] };
  services?: string | { $in: string[] };
  averageRating?: { $gte?: number; $lte?: number };
  workAreas?: { $in: RegExp[] };
  $or?: Array<{ [key: string]: RegExp }>;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  [key: string]: unknown;
}

export interface ITechnicianManagementRepository {
  // Technician methods
  findAllTechnicians(
    filter: FilterQuery,
    skip: number,
    limit: number
  ): Promise<ITechnician[]>;
  countTechnicians(filter: FilterQuery): Promise<number>;
  findTechnicianById(id: string): Promise<ITechnician | null>;
  updateTechnicianStatus(
    id: string,
    status: string,
    additionalData?: StatusUpdateData
  ): Promise<ITechnician | null>;
  updateTechnicianPersonalInfo(
    technicianId: string,
    personalInfo: PersonalInfo
  ): Promise<ITechnician | null>;
  findTechnicianByUserId(userId: string): Promise<ITechnician | null>;
  findTechnicianByApplicationId(
    applicationId: string
  ): Promise<ITechnician | null>;

  // Application methods
  findAllApplications(
    filter: FilterQuery,
    skip: number,
    limit: number
  ): Promise<ITechnicianApplication[]>;
  countApplications(filter: FilterQuery): Promise<number>;
  findApplicationById(id: string): Promise<ITechnicianApplication | null>;
  updateApplicationStatus(
    applicationId: string,
    status: string,
    additionalData?: StatusUpdateData
  ): Promise<ITechnicianApplication | null>;
  findApplicationByTechnicianId(
    technicianId: string
  ): Promise<ITechnicianApplication | null>;

  // User methods
  findUserById(userId: Types.ObjectId): Promise<IUser | null>;
  updateUserApplicationStatus(
    userId: Types.ObjectId,
    applicationStatus: string
  ): Promise<IUser | null>;
  findUserAddress(userId: Types.ObjectId): Promise<IUserAddress | null>;

  // Stats methods
  getTechnicianStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    recent: number;
  }>;
  getApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: number;
  }>;

  // Create technician
  findOrCreateTechnician(
    application: ITechnicianApplication,
    availabilityData?: any
  ): Promise<ITechnician>;
  updateTechnicianPaymentDetails(
    technicianId: string,
    paymentDetails: {
      bankAccount: {
        holderName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
      };
      upiId: string;
      withdrawalPreference: string;
    }
  ): Promise<boolean>;

  updateTechnicianIdentityVerification(
    technicianId: string,
    identityData: {
      idType: string;
      idNumber: string;
      idDocument: string;
      verificationStatus: string;
      verified: boolean;
      verifiedAt: Date;
    }
  ): Promise<boolean>;
  save(application: ITechnicianApplication): Promise<ITechnicianApplication>;
  updateTechnicianDocuments(
    technicianId: string,
    documents: any[]
  ): Promise<ITechnician | null>;
  findTechnicians(filters: TechnicianFilter): Promise<ITechnician[]>;
  findPublicTechnicians(
    filters: TechnicianFilter,
    skip?: number,
    limit?: number
  ): Promise<ITechnician[]>;

  countPublicTechnicians(filters: TechnicianFilter): Promise<number>;
  findById(id: string): Promise<ITechnician | null>;
  updateTechnicianLocation(
    technicianId: string, 
    coordinates: [number, number]
  ): Promise<ITechnician | null>
}
