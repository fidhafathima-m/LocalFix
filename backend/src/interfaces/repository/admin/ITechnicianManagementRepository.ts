import { 
  ITechnician, 
  ITechnicianApplication, 
  TechnicianFilters, 
  ApplicationFilters 
} from "../../admin/ITechnicianManagement";
import { Types } from "mongoose";

export interface ITechnicianManagementRepository {
  // Technician methods
  findAllTechnicians(filter: any, skip: number, limit: number): Promise<ITechnician[]>;
  countTechnicians(filter: any): Promise<number>;
  findTechnicianById(id: string): Promise<ITechnician | null>;
  updateTechnicianStatus(id: string, status: string, additionalData?: any): Promise<ITechnician | null>;
  updateTechnicianPersonalInfo(technicianId: string, personalInfo: any): Promise<ITechnician | null>;
  findTechnicianByUserId(userId: string): Promise<ITechnician | null>;
  findTechnicianByApplicationId(applicationId: string): Promise<ITechnician | null>;
  
  // Application methods
  findAllApplications(filter: any, skip: number, limit: number): Promise<ITechnicianApplication[]>;
  countApplications(filter: any): Promise<number>;
  findApplicationById(id: string): Promise<ITechnicianApplication | null>;
  updateApplicationStatus(applicationId: string, status: string, additionalData?: any): Promise<ITechnicianApplication | null>;
  findApplicationByTechnicianId(technicianId: string): Promise<any>;
  
  // User methods
  findUserById(userId: Types.ObjectId): Promise<any>;
  updateUserApplicationStatus(userId: Types.ObjectId, applicationStatus: string): Promise<any>;
  findUserAddress(userId: Types.ObjectId): Promise<any>;
  
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
  findOrCreateTechnician(application: any): Promise<ITechnician>;
}