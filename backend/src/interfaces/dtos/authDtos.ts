// Base DTO interfaces
export interface BaseResponseDto {
  success: boolean;
  message: string;
  statusCode: number;
  data?: any;
}

// Request DTOs
export interface SignupRequestDto {
  email?: string;
  phone?: string;
  userType: string;
  fullName?: string;
}

export interface VerifyOtpRequestDto {
  phone?: string;
  email?: string;
  otp: string;
  fullName?: string;
  password?: string;
  userType: string;
}

export interface VerifyResetOtpRequestDto {
  phone?: string;
  email?: string;
  otp: string;
  userType?: string;
}

export interface LoginRequestDto {
  identifier: string;
  password: string;
  role?: string;
}

export interface ForgotPasswordRequestDto {
  phone?: string;
  email?: string;
  userType?: string;
}

export interface ResetPasswordRequestDto {
  phone?: string;
  email?: string;
  otp?: string;
  token?: string;
  password: string;
  userType?: string;
}

export interface ResendOtpRequestDto {
  phone?: string;
  email?: string;
  purpose: string;
  userType?: string;
}

export interface GoogleAuthRequestDto {
  token: string;
  userType?: string;
}

export interface FacebookLoginRequestDto {
  accessToken: string;
  userID: string;
  userType?: string;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface LogoutRequestDto {
  refreshToken?: string;
}

// Response DTOs
export interface UserResponseDto {
  _id: string;
  fullName: string;
  phone?: string;
  email?: string;
  roles: string[];
  applicationStatus: string;
  isVerified: boolean;
  status: string;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseDto extends BaseResponseDto {
  user?: UserResponseDto;
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  userType?: string;
  identifier?: string;
}

export interface OtpResponseDto extends BaseResponseDto {
  channels?: string[];
}

export interface TokenRefreshResponseDto extends BaseResponseDto {
  accessToken?: string;
  refreshToken?: string;
}

// Internal Service DTOs (for service layer)
export interface SignupDataDto {
  email?: string;
  phone?: string;
  userType: string;
}

export interface LoginCredentialsDto {
  identifier: string;
  password: string;
  role?: string;
}

export interface OTPVerificationDataDto {
  phone?: string;
  email?: string;
  otp: string;
  fullName?: string;
  password?: string;
  userType?: string;
}

export interface ResetPasswordDataDto {
  phone?: string;
  email?: string;
  otp?: string;
  token?: string;
  password: string;
  userType?: string;
}

export interface SocialAuthDataDto {
  token: string;
  userType?: string;
}

// OTP Related DTOs
export interface OtpCreationDataDto {
  otpHash: string;
  purpose: "signup" | "reset" | "login" | "application";
  expiresAt: Date;
  phone?: string;
  email?: string;
}

// JWT Payload DTOs
export interface JwtPayloadDto {
  _id: string;
  roles?: string[];
  type: string;
  purpose?: string;
  identifier?: string;
  userType?: string;
  timestamp?: number;
}

// Social Media Response DTOs
export interface FacebookGraphResponseDto {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data?: {
      url: string;
    };
  };
}

export interface GoogleTokenPayloadDto {
  email?: string;
  name?: string;
  sub: string;
  picture?: string;
}