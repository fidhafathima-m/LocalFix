// Base DTO interfaces
export interface BaseResponseDto {
  success: boolean;
  message: string;
  statusCode: number;
}

// User DTOs
export interface UserListDto {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  status: string;
  roles: string[];
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  defaultAddress?: AddressDto;
  addresses?: AddressDto[];
  profilePicture?: string; 
  profilePictureUrl?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface UserDetailDto extends UserListDto {
  applicationStatus?: string;
  lastLogin?: Date;
  loginCount?: number;
  profilePicture?: string;
  profilePictureUrl?: string;
  dateOfBirth?: string;
  gender?: string;
  wallet?: {
    balance: number;
    transactions: any[];
  };
}

export interface AddressDto {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  isDefault?: boolean;
  location?: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  formattedAddress?: string;
}

// Request DTOs
export interface UpdateUserStatusRequestDto {
  status: "Active" | "Inactive" | "Blocked";
}

export interface EditUserRequestDto {
  fullName?: string;
  email?: string;
  phone?: string;
  status?: "Active" | "Inactive" | "Blocked";
}

// Stats DTOs
export interface UserStatsDto {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  blockedUsers: number;
}

export interface UsersListResponseDto extends BaseResponseDto {
  users?: UserListDto[];
}

export interface UserManagementResponseDto extends BaseResponseDto {
  user?: UserDetailDto;
}

export interface UserStatsResponseDto extends BaseResponseDto {
  stats?: UserStatsDto;
}
