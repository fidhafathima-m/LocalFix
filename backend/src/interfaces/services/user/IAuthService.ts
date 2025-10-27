import {
  AuthResponseDto,
  SignupDataDto,
  LoginCredentialsDto,
  OTPVerificationDataDto,
  ResetPasswordDataDto,
  SocialAuthDataDto,
} from "../../dtos/authDtos";

export interface IAuthService {
  signup(signupData: SignupDataDto): Promise<AuthResponseDto>;
  verifyOtp(otpData: OTPVerificationDataDto): Promise<AuthResponseDto>;
  verifyResetOtp(otpData: OTPVerificationDataDto): Promise<AuthResponseDto>;
  login(credentials: LoginCredentialsDto): Promise<AuthResponseDto>;
  forgotPassword(
    phone?: string,
    email?: string,
    userType?: string
  ): Promise<AuthResponseDto>;
  resetPassword(resetData: ResetPasswordDataDto): Promise<AuthResponseDto>;
  resendOTP(
    phone?: string,
    email?: string,
    purpose?: string,
    userType?: string
  ): Promise<AuthResponseDto>;
  googleAuth(socialData: SocialAuthDataDto): Promise<AuthResponseDto>;
  facebookLogin(accessToken: string, userID: string): Promise<AuthResponseDto>;
  refreshToken(refreshToken: string): Promise<AuthResponseDto>;
  logout(userId: string, refreshToken?: string): Promise<AuthResponseDto>;
}