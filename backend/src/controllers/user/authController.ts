import { Request, Response } from "express";
import { IAuthService } from "../../interfaces/services/user/IAuthService";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";
import { AuthRequest } from "@/middleware/authMiddleware";

// Import DTOs
import {
  SignupRequestDto,
  VerifyOtpRequestDto,
  VerifyResetOtpRequestDto,
  LoginRequestDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  ResendOtpRequestDto,
  GoogleAuthRequestDto,
  FacebookLoginRequestDto,
  RefreshTokenRequestDto,
  LogoutRequestDto,
  AuthResponseDto,
} from "../../interfaces/dtos/authDtos";

export class AuthController {
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const signupData: SignupRequestDto = req.body;
      const result: AuthResponseDto = await this.authService.signup(signupData);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Signup controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const otpData: VerifyOtpRequestDto = req.body;
      const result: AuthResponseDto = await this.authService.verifyOtp(otpData);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Verify OTP controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const otpData: VerifyResetOtpRequestDto = req.body;
      const result: AuthResponseDto = await this.authService.verifyResetOtp(otpData);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Verify reset OTP controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const credentials: LoginRequestDto = req.body;
      const result: AuthResponseDto = await this.authService.login(credentials);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Login controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone, email, userType }: ForgotPasswordRequestDto = req.body;
      const result: AuthResponseDto = await this.authService.forgotPassword(
        phone,
        email,
        userType
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Forgot password controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const resetData: ResetPasswordRequestDto = req.body;
      const result: AuthResponseDto = await this.authService.resetPassword(resetData);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Reset password controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  resendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone, email, purpose, userType }: ResendOtpRequestDto = req.body;
      const result: AuthResponseDto = await this.authService.resendOTP(
        phone,
        email,
        purpose,
        userType
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Resend OTP controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  googleAuth = async (req: Request, res: Response): Promise<void> => {
    try {
      const googleData: GoogleAuthRequestDto = req.body;
      const result: AuthResponseDto = await this.authService.googleAuth(googleData);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Google auth controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  facebookLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { accessToken, userID }: FacebookLoginRequestDto = req.body;
      const result: AuthResponseDto = await this.authService.facebookLogin(accessToken, userID);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Facebook login controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken }: RefreshTokenRequestDto = req.body;
      const result: AuthResponseDto = await this.authService.refreshToken(refreshToken);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Refresh token controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { refreshToken }: LogoutRequestDto = req.body;
      const userId = req.user?.id;

      if (!userId) {
        const unauthorizedResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: AuthResponseDto = await this.authService.logout(userId, refreshToken);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Logout controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }
}