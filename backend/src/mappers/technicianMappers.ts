import { Types } from "mongoose";
import {
  TechnicianListDto,
  TechnicianDetailDto,
  PersonalInfoDto,
  AddressDto,
  DocumentDto,
} from "../interfaces/dtos/technicianDtos";
import { ITechnician, IAdminTechnician } from "../interfaces/admin/ITechnicianManagement";
import { IUser } from "../interfaces/user/IUser";

export class TechnicianMapper {
  // Map to basic list DTO
  static toListDto(technician: ITechnician, user?: IUser): TechnicianListDto {
    return {
      _id: technician._id?.toString() || '',
      userId: technician.userId?.toString() || '',
      displayName: technician.displayName || '',
      email: user?.email || '',
      phone: user?.phone || technician.phone || '',
      services: technician.services || [],
      status: technician.status || '',
      averageRating: technician.averageRating || 0,
      totalJobs: technician.totalJobs || 0,
      completedJobs: technician.completedJobs || 0,
      createdAt: technician.createdAt || new Date(),
      profilePictureUrl: technician.profilePictureUrl,
    };
  }

  // Map to detailed DTO
  static toDetailDto(adminTechnician: IAdminTechnician): TechnicianDetailDto {
    // Convert availability to a compatible type
    const availability = adminTechnician.availability 
      ? this.mapAvailability(adminTechnician.availability)
      : undefined;

    return {
      // Basic info
      _id: adminTechnician._id?.toString() || '',
      userId: adminTechnician.userId?.toString() || '',
      displayName: adminTechnician.displayName || '',
      email: adminTechnician.email || '',
      phone: adminTechnician.phone || '',
      services: adminTechnician.services || [],
      status: adminTechnician.status || '',
      
      // Ratings and jobs
      averageRating: adminTechnician.averageRating || 0,
      ratingCount: adminTechnician.ratingCount || 0,
      totalJobs: adminTechnician.totalJobs || 0,
      completedJobs: adminTechnician.completedJobs || 0,
      ongoingJobs: adminTechnician.ongoingJobs || 0,
      totalEarnings: adminTechnician.totalEarnings || 0,
      
      // Professional info
      experienceYears: adminTechnician.experienceYears || 0,
      workAreas: adminTechnician.workAreas || [],
      serviceRadiusKm: adminTechnician.serviceRadiusKm || 0,
      
      // Personal info
      personalInfo: this.mapPersonalInfo(adminTechnician.personalInfo),
      
      // Documents
      documents: this.mapDocuments(adminTechnician.documents),
      
      // Additional fields
      availability,
      suspensionReason: adminTechnician.suspensionReason,
      suspendedAt: adminTechnician.suspendedAt,
      createdAt: adminTechnician.createdAt || new Date(),
      updatedAt: adminTechnician.updatedAt || new Date(),
    };
  }

  private static mapPersonalInfo(personalInfo: any): PersonalInfoDto {
    return {
      fullName: personalInfo?.fullName || '',
      gender: personalInfo?.gender || '',
      phoneNumber: personalInfo?.phoneNumber || '',
      dateOfBirth: personalInfo?.dateOfBirth || '',
      languages: Array.isArray(personalInfo?.languages) ? personalInfo.languages : [],
      address: personalInfo?.address ? this.mapAddress(personalInfo.address) : undefined,
    };
  }

  private static mapAddress(address: any): AddressDto {
    return {
      street: address?.street || '',
      city: address?.city || '',
      state: address?.state || '',
      pincode: address?.pincode || '',
    };
  }

  private static mapDocuments(documents: any): DocumentDto[] {
    if (!documents || typeof documents !== 'object') {
      return [];
    }

    return Object.entries(documents)
      .filter(([_, doc]: [string, any]) => doc && doc.url)
      .map(([type, doc]: [string, any]) => ({
        type,
        url: doc.url,
        verified: doc.verified || false,
        uploadedAt: doc.uploadedAt || new Date(),
      }));
  }

  private static mapAvailability(availability: any): Record<string, any> {
    if (!availability || typeof availability !== 'object') {
      return {};
    }

    // Convert availability to a plain object with string index signature
    const result: Record<string, any> = {};
    Object.entries(availability).forEach(([key, value]) => {
      result[key] = value;
    });
    return result;
  }
}