// Base DTO interfaces
export interface BaseResponseDto {
  success: boolean;
  message: string;
  statusCode: number;
}

export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// Technician DTOs
export interface TechnicianListDto {
  _id: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string;
  services: string[];
  status: string;
  averageRating: number;
  totalJobs: number;
  completedJobs: number;
  createdAt: Date;
  profilePictureUrl?: string;
  experienceYears?: number;
  ratingCount?: number;
}

export interface TechnicianDetailDto {
  _id: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string;
  services: string[];
  status: string;
  bio: string;
  profilePictureUrl: string;
  averageRating: number;
  ratingCount: number;
  totalJobs: number;
  completedJobs: number;
  ongoingJobs: number;
  totalEarnings: number;
  experienceYears: number;
  workAreas: string[];
  serviceRadiusKm: number;
  personalInfo: PersonalInfoDto;
  documents: DocumentDto[];
  availability?: Record<string, any>;
  suspensionReason?: string;
  suspendedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonalInfoDto {
  fullName: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: string | Date;
  languages: string[];
  address?: AddressDto;
}

export interface AddressDto {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

export interface DocumentDto {
  type: string;
  url: string;
  verified: boolean;
  uploadedAt: Date;
}

export interface AvailabilityDto {
  [key: string]: {
    available: boolean;
    startTime?: string;
    endTime?: string;
  };
}

// Application DTOs
export interface ApplicationListDto {
  _id: string;
  technicianId: string;
  email: string;
  status: string;
  personal: ApplicationPersonalDto;
  skills: SkillsDto;
  submittedAt?: Date;
  rejectionReason?: string;
}
export interface ApplicationDetailDto {
  _id: string;
  technicianId: string;
  email: string;
  status: string;
  personal: ApplicationPersonalDto;
  skills: SkillsDto;
  identity: IdentityDto;
  availability: ApplicationAvailabilityDto;
  bank: BankDetailsDto;
  documents: Record<string, any>;
  stepsCompleted: string[];
  reviewNotes?: string;
  rejectionReason?: string;
  rejectedAt?: Date;
  resubmittedCount: number;
  lastSubmittedAt?: Date;
  submittedAt?: Date;
}
export interface ApplicationPersonalDto {
  fullName: string;
  phoneNumber: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  languages: string[];
  address?: AddressDto;
}

export interface SkillsDto {
  services: string[];
  yearsOfExperience: string;
  languages: string[];
  bio: string;
  serviceAreas: string[];
  workRadius: string;
}

export interface IdentityDto {
  governmentIdType: string;
  governmentIdNumber: string;
  idDocument: string;
  verified: boolean;
  verificationStatus: string;
}

export interface ApplicationAvailabilityDto {
  serviceAreas: string[];
  workRadius: string;
  availability: AvailabilityDto;
}

export interface BankDetailsDto {
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  bankName: string;
  withdrawalPreference: string;
}

// Request DTOs
export interface UpdateStatusRequestDto {
  status: string;
  emailNotification?: boolean;
  reason?: string;
}

export interface RejectApplicationRequestDto {
  rejectionReason: string;
  emailNotification?: boolean;
}

export interface TechnicianFiltersDto {
  status?: string;
  service?: string;
  rating?: string | number;
  location?: string;
  search?: string;
  page?: number | string;
  limit?: number | string;
}

export interface ApplicationFiltersDto {
  status?: string;
  search?: string;
  service?: string;
  page?: number | string;
  limit?: number | string;
}

// Response DTOs
export interface TechnicianListResponseDto extends BaseResponseDto {
  data?: {
    technicians: TechnicianListDto[];
    pagination: PaginationDto;
  };
}

export interface SingleTechnicianResponseDto extends BaseResponseDto {
  data?: {
    technician: TechnicianDetailDto;
  };
}

export interface ApplicationListResponseDto extends BaseResponseDto {
  data?: {
    applications: ApplicationListDto[];
    pagination: PaginationDto;
  };
}

export interface TechnicianStatsResponseDto extends BaseResponseDto {
  data?: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    recent: number;
  };
}

export interface ApplicationStatsResponseDto extends BaseResponseDto {
  data?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: number;
  };
}