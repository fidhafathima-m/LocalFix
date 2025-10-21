import { ApiResponse } from "../../../utils/responseHelper";
import {
  LoginCredentials,
  OTPVerificationData,
  ResetPasswordData,
  SignupData,
  SocialAuthData,
} from "../../../interfaces/user/IAuthService";

export interface AuthResponse extends ApiResponse {
  user?: any;
  token?: string;
}

export interface IAuthService {
  signup(signupData: SignupData): Promise<AuthResponse>;
  verifyOtp(otpData: OTPVerificationData): Promise<AuthResponse>;
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  forgotPassword(
    phone?: string,
    email?: string,
    userType?: string
  ): Promise<AuthResponse>;
  resetPassword(resetData: ResetPasswordData): Promise<AuthResponse>;
  verifyResetOtp(otpData: OTPVerificationData): Promise<AuthResponse>;
  resendOTP(
    phone?: string,
    email?: string,
    purpose?: string,
    userType?: string
  ): Promise<AuthResponse>;
  facebookLogin(accessToken: string, userID: string): Promise<AuthResponse>;
  googleAuth(socialData: SocialAuthData): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<AuthResponse>;
  logout(userId: string, refreshToken?: string): Promise<AuthResponse>;
}
