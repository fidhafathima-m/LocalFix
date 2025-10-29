// Base DTO interfaces
export interface BaseResponseDto {
  success: boolean;
  message: string;
  statusCode: number;
}

// Dashboard Overview DTOs
export interface DashboardOverviewDto {
  upcomingBookings?: number;
  monthlyEarnings?: number;
  totalJobs?: number;
  averageRating: number;
}

export interface PersonalInfoDto {
  fullName: string;
  gender: string;
  phoneNumber: string;
  dateOfBirth: string;
  languages: string[];
  address: AddressDto;
}

export interface AddressDto {
  street: string;
  city: string;
  state: string;
  pincode: string;
}

// Technician Profile DTOs
export interface TechnicianProfileDto {
  _id: string;
  userId: string;
  displayName: string;
  email: string;
  phone: string;
  services: string[];
  experienceYears: number;
  workAreas: string[];
  averageRating: number;
  ratingCount: number;
  profilePictureUrl: string;
  isVerified: boolean;
  bio: string;
  status: string;
  suspensionReason?: string;
  suspendedAt?: Date;
  personalInfo: PersonalInfoDto;
  createdAt: Date;
  updatedAt: Date;
}

// Response DTOs
export interface DashboardOverviewResponseDto extends BaseResponseDto {
  overview?: DashboardOverviewDto;
}

export interface TechnicianProfileResponseDto extends BaseResponseDto {
  profile?: TechnicianProfileDto;
}
