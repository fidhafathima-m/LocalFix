import { PersonalInfo } from "@/interfaces/technician/ITechnician";
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
  findApplicationByTechnicianId(technicianId: string): Promise<ITechnicianApplication | null>;

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
  findOrCreateTechnician(application: ITechnicianApplication): Promise<ITechnician>;
  updateTechnicianPaymentDetails(
    technicianId: string,
    paymentDetails: Record<string, unknown>
  ): Promise<ITechnician>;
}
