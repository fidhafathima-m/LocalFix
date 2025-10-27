import { Types } from "mongoose";
import {
  ApplicationListDto,
  ApplicationDetailDto,
  ApplicationPersonalDto,
  SkillsDto,
  IdentityDto,
  ApplicationAvailabilityDto,
  BankDetailsDto,
} from "../interfaces/dtos/technicianDtos";
import { ITechnicianApplication } from "../interfaces/admin/ITechnicianManagement";

export class ApplicationMapper {
  // Map to list DTO
  static toListDto(application: ITechnicianApplication): ApplicationListDto {
    return {
      _id: application._id?.toString() || '',
      technicianId: application.technicianId?.toString() || '',
      email: application.email || '',
      status: application.status || '',
      personal: this.mapPersonalInfo(application.personal),
      skills: this.mapSkills(application.skills),
      submittedAt: application.submittedAt,
      rejectionReason: application.rejectionReason,
    };
  }

  // Map to detail DTO
  static toDetailDto(application: ITechnicianApplication): ApplicationDetailDto {
    const baseDto = this.toListDto(application);
    
    return {
      ...baseDto,
      identity: this.mapIdentity(application.identity),
      availability: this.mapAvailability(application.availability),
      bank: this.mapBankDetails(application.bank),
      documents: application.documents || {},
      stepsCompleted: application.stepsCompleted || [],
      reviewNotes: application.reviewNotes,
      rejectedAt: application.rejectedAt ? new Date(application.rejectedAt) : undefined,
      resubmittedCount: application.resubmittedCount || 0,
      lastSubmittedAt: application.lastSubmittedAt,
    };
  }

  private static mapPersonalInfo(personal: any): ApplicationPersonalDto {
    return {
      fullName: personal?.fullName || '',
      phoneNumber: personal?.phoneNumber || '',
      email: personal?.email || '',
      gender: personal?.gender || '',
      dateOfBirth: personal?.dateOfBirth || '',
      languages: Array.isArray(personal?.languages) ? personal.languages : [],
      address: personal?.address ? {
        street: personal.address.street || '',
        city: personal.address.city || '',
        state: personal.address.state || '',
        pincode: personal.address.pincode || '',
      } : undefined,
    };
  }

  private static mapSkills(skills: any): SkillsDto {
    return {
      services: Array.isArray(skills?.services) ? skills.services : [],
      yearsOfExperience: skills?.yearsOfExperience?.toString() || '',
      languages: Array.isArray(skills?.languages) ? skills.languages : [],
      bio: skills?.bio || '',
      serviceAreas: Array.isArray(skills?.serviceAreas) ? skills.serviceAreas : [],
      workRadius: skills?.workRadius?.toString() || '',
    };
  }

  private static mapIdentity(identity: any): IdentityDto {
    return {
      governmentIdType: identity?.governmentIdType || '',
      governmentIdNumber: identity?.governmentIdNumber || '',
      idDocument: identity?.idDocument || '',
      verified: identity?.verified || false,
      verificationStatus: identity?.verificationStatus || 'pending',
    };
  }

  private static mapAvailability(availability: any): ApplicationAvailabilityDto {
    return {
      serviceAreas: Array.isArray(availability?.serviceAreas) ? availability.serviceAreas : [],
      workRadius: availability?.workRadius?.toString() || '',
      availability: availability?.availability || {},
    };
  }

  private static mapBankDetails(bank: any): BankDetailsDto {
    return {
      accountHolderName: bank?.accountHolderName || '',
      accountNumber: bank?.accountNumber || '',
      ifscCode: bank?.ifscCode || '',
      upiId: bank?.upiId || '',
      bankName: bank?.bankName || '',
      withdrawalPreference: bank?.withdrawalPreference || '',
    };
  }
}