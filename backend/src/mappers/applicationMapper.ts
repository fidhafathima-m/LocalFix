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
      agreement: application.agreement || false, // Add agreement field
      createdAt: application.createdAt, // Add createdAt field
      updatedAt: application.updatedAt, // Add updatedAt field
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
        landmark: personal.address.landmark || '',
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
    // Parse address if it's a JSON string
    let parsedAddress = undefined;
    if (identity?.address && typeof identity.address === 'string') {
      try {
        parsedAddress = JSON.parse(identity.address);
      } catch (error) {
        console.error('Error parsing identity address:', error);
      }
    } else {
      parsedAddress = identity?.address;
    }

    // Parse location if it's a JSON string
    let parsedLocation = undefined;
    if (identity?.location && typeof identity.location === 'string') {
      try {
        parsedLocation = JSON.parse(identity.location);
      } catch (error) {
        console.error('Error parsing identity location:', error);
      }
    } else {
      parsedLocation = identity?.location;
    }

    return {
      idType: identity?.idType || identity?.governmentIdType || '', // Map both field names
      idNumber: identity?.idNumber || identity?.governmentIdNumber || '', // Map both field names
      address: parsedAddress,
      location: parsedLocation,
      verified: identity?.verified || false,
      verificationStatus: identity?.verificationStatus || 'pending',
      verifiedAt: identity?.verifiedAt,
    };
  }

  private static mapAvailability(availability: any): ApplicationAvailabilityDto {
    // Parse availability if it's nested under availability.availability
    let availabilityData = availability?.availability || availability;
    
    // If availability is a string, try to parse it
    if (typeof availabilityData === 'string') {
      try {
        availabilityData = JSON.parse(availabilityData);
      } catch (error) {
        console.error('Error parsing availability:', error);
        availabilityData = {};
      }
    }

    return {
      serviceAreas: Array.isArray(availability?.serviceAreas) ? availability.serviceAreas : [],
      workRadius: availability?.workRadius?.toString() || '',
      availability: availabilityData,
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