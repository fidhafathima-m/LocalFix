// Base DTO interfaces
export interface BaseResponseDto {
  success: boolean;
  message: string;
  statusCode: number;
}

// Request DTOs
export interface PersonalInfoUpdateDto {
  personalInfo?: {
    fullName?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    languages?: string[];
  };
  bio?: string;
  email?: string;
  profilePicture?: string;
}

// In your backend DTO interfaces
export interface IdentityVerificationUpdateDto {
  identityVerification?: {
    idType?: string;
    idNumber?: string;
    idDocument?: string;
    verificationStatus?: string;
    verified?: boolean;
  };
  personalInfo?: {
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
      landmark?: string;
    };
  };
}

export interface SkillsServicesUpdateDto {
  services?: string[];
  experienceYears?: number;
  basePrices?: Record<string, number>;
}

export interface AvailabilityPreferencesUpdateDto {
  availability?: {
    isAvailable: boolean;
    weeklyAvailability?: {
      [key: string]: {
        enabled: boolean;
        startTime: string;
        endTime: string;
      };
    };
    availableWeeks?: number[]; // Add this line
  };
  workAreas?: string[];
  serviceAreas?: string[];
  workRadius?: number;
  serviceRadiusKm?: number;
}

export interface BankPaymentUpdateDto {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  upiId?: string;
  withdrawalPreference?: "auto" | "manual";

  paymentDetails?: {
    bankAccount?: {
      holderName?: string;
      accountNumber?: string;
      ifscCode?: string;
      bankName?: string;
    };
    upiId?: string;
    withdrawalPreference?: "auto" | "manual";
  };
}

export interface SecuritySettingsUpdateDto {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export interface DocumentUploadDto {
  type: string;
  fileUrl: string;
  fileName: string;
}

// Static Data DTOs
export interface StaticDataDto {
  languages: Array<{ value: string; label: string }>;
  genders: Array<{ value: string; label: string }>;
  idTypes: Array<{ value: string; label: string }>;
  services: Array<{ value: string; label: string; basePrice?: number }>;
  serviceAreas: Array<{ value: string; label: string }>;
  documentTypes: Array<{ value: string; label: string }>;
  verificationStatuses: Array<{ value: string; label: string; color: string }>;
  withdrawalPreferences: Array<{ value: string; label: string }>;
  daysOfWeek: Array<{ value: string; label: string }>;
}

// Profile Data DTOs
export interface PersonalInfoDto {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  languages: string[];
  bio: string;
  profilePictureUrl: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
}

export interface IdentityVerificationDto {
  verificationStatus: string;
  governmentIdType?: string;
  governmentIdNumber?: string;
  idDocument?: string;
}

export interface SkillsServicesDto {
  services: string[];
  experienceYears: number;
  basePrices: Record<string, number>;
}

export interface AvailabilityPreferencesDto {
  isAvailable: boolean;
  serviceAreas: string[];
  workRadius: number;
  weeklyAvailability?: Record<string, any>;
}

export interface BankPaymentDetailsDto {
  bankAccount: {
    holderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  upiId: string;
  withdrawalPreference: string;
}

export interface DocumentDataDto {
  _id?: string;
  type: string;
  fileName: string;
  url: string;
  uploadedAt: Date;
  verified: boolean;
  status: "pending" | "approved" | "rejected";
  verifiedAt?: Date;
}

export interface SecuritySettingsDto {
  lastLogin?: Date | null;
  loginDevice?: string | null;
}

export interface TechnicianProfileDto {
  _id: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string;
  profilePictureUrl: string;
  bio: string;
  services: string[];
  workAreas: string[];
  serviceRadiusKm: number;
  status: string;
  averageRating?: number;
  ratingCount?: number;
  totalJobs?: number;
  completedJobs?: number;
  ongoingJobs?: number;
  totalEarnings?: number;
  experienceYears: number;
  createdAt: Date;
  updatedAt: Date;
  personalInfo: PersonalInfoDto;
  identityVerification: IdentityVerificationDto;
  skillsServices: SkillsServicesDto;
  availabilityPreferences: AvailabilityPreferencesDto;

  paymentDetails?: {
    bankAccount: {
      holderName: string;
      accountNumber: string;
      ifscCode: string;
      bankName: string;
    };
    upiId: string;
    withdrawalPreference: string;
  };

  documents: DocumentDataDto[];
  securitySettings: SecuritySettingsDto;
}

// Response DTOs
export interface TechnicianProfileResponseDto extends BaseResponseDto {
  profile?: TechnicianProfileDto;
}

export interface StaticDataResponseDto extends BaseResponseDto {
  staticData?: StaticDataDto;
}
