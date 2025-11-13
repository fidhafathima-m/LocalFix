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
import { ILogger } from "@/interfaces/utils/ILogger";

export class AuthController {
  private authService: IAuthService;
  private logger: ILogger;

  constructor(
    authService: IAuthService,
    logger: ILogger
  ) {
    this.authService = authService;
    this.logger = logger;
  }

  signup = async (req: Request, res: Response): Promise<void> => {
    const signupData: SignupRequestDto = req.body;
    const context = {
      operation: "signup",
      userType: signupData.userType,
      email: signupData.email,
      phone: signupData.phone,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Signup request received", context);

      const result: AuthResponseDto = await this.authService.signup(signupData);

      this.logger.info("Signup completed successfully", {
        ...context,
        userId: result.data?.user?._id,
        success: result.success,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Signup controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const otpData: VerifyOtpRequestDto = req.body;
    const context = {
      operation: "verifyOtp",
      email: otpData.email,
      phone: otpData.phone,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("OTP verification request received", context);

      const result: AuthResponseDto = await this.authService.verifyOtp(otpData);

      this.logger.info("OTP verification completed", {
        ...context,
        success: result.success,
        verified: result.data?.verified,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Verify OTP controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
    const otpData: VerifyResetOtpRequestDto = req.body;
    const context = {
      operation: "verifyResetOtp",
      email: otpData.email,
      phone: otpData.phone,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Reset OTP verification request received", context);

      const result: AuthResponseDto = await this.authService.verifyResetOtp(
        otpData
      );

      this.logger.info("Reset OTP verification completed", {
        ...context,
        success: result.success,
        verified: result.data?.verified,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Verify reset OTP controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const credentials: LoginRequestDto = req.body;
    const context = {
      operation: "login",
      emailPhone: credentials?.identifier,
      userType: credentials?.role,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Login request received", context);

      const result: AuthResponseDto = await this.authService.login(credentials);

      this.logger.info("Login completed", {
        ...context,
        success: result.success,
        userId: result.data?.user?._id,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Login controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { phone, email, userType }: ForgotPasswordRequestDto = req.body;
    const context = {
      operation: "forgotPassword",
      email,
      phone,
      userType,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Forgot password request received", context);

      const result: AuthResponseDto = await this.authService.forgotPassword(
        phone,
        email,
        userType
      );

      this.logger.info("Forgot password request processed", {
        ...context,
        success: result.success,
        otpSent: result.data?.otpSent,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Forgot password controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const resetData: ResetPasswordRequestDto = req.body;
    const context = {
      operation: "resetPassword",
      email: resetData.email,
      phone: resetData.phone,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Reset password request received", context);

      const result: AuthResponseDto = await this.authService.resetPassword(
        resetData
      );

      this.logger.info("Password reset completed", {
        ...context,
        success: result.success,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Reset password controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  resendOTP = async (req: Request, res: Response): Promise<void> => {
    const { phone, email, purpose, userType }: ResendOtpRequestDto = req.body;
    const context = {
      operation: "resendOTP",
      email,
      phone,
      purpose,
      userType,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Resend OTP request received", context);

      const result: AuthResponseDto = await this.authService.resendOTP(
        phone,
        email,
        purpose,
        userType
      );

      this.logger.info("OTP resent successfully", {
        ...context,
        success: result.success,
        otpSent: result.data?.otpSent,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Resend OTP controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  googleAuth = async (req: Request, res: Response): Promise<void> => {
    const googleData: GoogleAuthRequestDto = req.body;
    const context = {
      operation: "googleAuth",
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Google authentication request received", context);

      const result: AuthResponseDto = await this.authService.googleAuth(
        googleData
      );

      this.logger.info("Google authentication completed", {
        ...context,
        success: result.success,
        userId: result.data?.user?._id,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Google auth controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  facebookLogin = async (req: Request, res: Response): Promise<void> => {
    const { accessToken, userID }: FacebookLoginRequestDto = req.body;
    const context = {
      operation: "facebookLogin",
      facebookUserId: userID,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Facebook login request received", context);

      const result: AuthResponseDto = await this.authService.facebookLogin(
        accessToken,
        userID
      );

      this.logger.info("Facebook login completed", {
        ...context,
        success: result.success,
        userId: result.data?.user?._id,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Facebook login controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken }: RefreshTokenRequestDto = req.body;
    const context = {
      operation: "refreshToken",
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Refresh token request received", context);

      const result: AuthResponseDto = await this.authService.refreshToken(
        refreshToken
      );

      this.logger.info("Token refresh completed", {
        ...context,
        success: result.success,
        tokensRefreshed: !!result.data?.tokens,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Refresh token controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    const { refreshToken }: LogoutRequestDto = req.body;
    const userId = req.user?.id;

    const context = {
      operation: "logout",
      userId,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Logout request received", context);

      if (!userId) {
        this.logger.warn("Logout failed - authentication required", context);
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: AuthResponseDto = await this.authService.logout(
        userId,
        refreshToken
      );

      this.logger.info("Logout completed successfully", context);

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Logout controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  }
}
