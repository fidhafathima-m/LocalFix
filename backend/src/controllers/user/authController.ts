import { IAuthService } from '../../interfaces/services/user/IAuthService';
import { ResponseHelper } from '../../utils/responseHelper';
import { GeneralMessages } from '../../constants';
import { AuthRequest, Response } from '../../types/express';

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
} from '../../interfaces/dtos/authDtos';
import { ILogger } from '@/interfaces/utils/ILogger';

export class AuthController {
  private _authService: IAuthService;
  private _logger: ILogger;

  constructor(authService: IAuthService, logger: ILogger) {
    this._authService = authService;
    this._logger = logger;
  }

  signup = async (req: AuthRequest, res: Response): Promise<void> => {
    const signupData: SignupRequestDto = req.body;
    const context = {
      operation: 'signup',
      userType: signupData.userType,
      email: signupData.email,
      phone: signupData.phone,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Signup request received', context);

      const result: AuthResponseDto =
        await this._authService.signup(signupData);

      this._logger.info('Signup completed successfully', {
        ...context,
        userId: result.data?.user?._id,
        success: result.success,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Signup controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  verifyOtp = async (req: AuthRequest, res: Response): Promise<void> => {
    const otpData: VerifyOtpRequestDto = req.body;
    const context = {
      operation: 'verifyOtp',
      email: otpData.email,
      phone: otpData.phone,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('OTP verification request received', context);

      const result: AuthResponseDto =
        await this._authService.verifyOtp(otpData);

      this._logger.info('OTP verification completed', {
        ...context,
        success: result.success,
        verified: result.data?.verified,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Verify OTP controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  verifyResetOtp = async (req: AuthRequest, res: Response): Promise<void> => {
    const otpData: VerifyResetOtpRequestDto = req.body;
    const context = {
      operation: 'verifyResetOtp',
      email: otpData.email,
      phone: otpData.phone,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Reset OTP verification request received', context);

      const result: AuthResponseDto =
        await this._authService.verifyResetOtp(otpData);

      this._logger.info('Reset OTP verification completed', {
        ...context,
        success: result.success,
        verified: result.data?.verified,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Verify reset OTP controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  login = async (req: AuthRequest, res: Response): Promise<void> => {
    const credentials: LoginRequestDto = req.body;
    const context = {
      operation: 'login',
      emailPhone: credentials?.identifier,
      userType: credentials?.role,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Login request received', context);

      const result: AuthResponseDto =
        await this._authService.login(credentials);

      this._logger.info('Login completed', {
        ...context,
        success: result.success,
        userId: result.data?.user?._id,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Login controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const { phone, email, userType }: ForgotPasswordRequestDto = req.body;
    const context = {
      operation: 'forgotPassword',
      email,
      phone,
      userType,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Forgot password request received', context);

      const result: AuthResponseDto = await this._authService.forgotPassword(
        phone,
        email,
        userType
      );

      this._logger.info('Forgot password request processed', {
        ...context,
        success: result.success,
        otpSent: result.data?.otpSent,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Forgot password controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const resetData: ResetPasswordRequestDto = req.body;
    const context = {
      operation: 'resetPassword',
      email: resetData.email,
      phone: resetData.phone,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Reset password request received', context);

      const result: AuthResponseDto =
        await this._authService.resetPassword(resetData);

      this._logger.info('Password reset completed', {
        ...context,
        success: result.success,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Reset password controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  resendOTP = async (req: AuthRequest, res: Response): Promise<void> => {
    const { phone, email, purpose, userType }: ResendOtpRequestDto = req.body;
    const context = {
      operation: 'resendOTP',
      email,
      phone,
      purpose,
      userType,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Resend OTP request received', context);

      const result: AuthResponseDto = await this._authService.resendOTP(
        phone,
        email,
        purpose,
        userType
      );

      this._logger.info('OTP resent successfully', {
        ...context,
        success: result.success,
        otpSent: result.data?.otpSent,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Resend OTP controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  googleAuth = async (req: AuthRequest, res: Response): Promise<void> => {
    const googleData: GoogleAuthRequestDto = req.body;
    const context = {
      operation: 'googleAuth',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Google authentication request received', context);

      const result: AuthResponseDto =
        await this._authService.googleAuth(googleData);

      this._logger.info('Google authentication completed', {
        ...context,
        success: result.success,
        userId: result.data?.user?._id,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Google auth controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  facebookLogin = async (req: AuthRequest, res: Response): Promise<void> => {
    const { accessToken, userID }: FacebookLoginRequestDto = req.body;
    const context = {
      operation: 'facebookLogin',
      facebookUserId: userID,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Facebook login request received', context);

      const result: AuthResponseDto = await this._authService.facebookLogin(
        accessToken,
        userID
      );

      this._logger.info('Facebook login completed', {
        ...context,
        success: result.success,
        userId: result.data?.user?._id,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Facebook login controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
    const { refreshToken }: RefreshTokenRequestDto = req.body;
    const context = {
      operation: 'refreshToken',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Refresh token request received', context);

      const result: AuthResponseDto =
        await this._authService.refreshToken(refreshToken);

      this._logger.info('Token refresh completed', {
        ...context,
        success: result.success,
        tokensRefreshed: !!result.data?.tokens,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Refresh token controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  logout = async (req: AuthRequest, res: Response): Promise<void> => {
    const { refreshToken }: LogoutRequestDto = req.body;
    const userId = req.user?.id;

    const context = {
      operation: 'logout',
      userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Logout request received', context);

      if (!userId) {
        this._logger.warn('Logout failed - authentication required', context);
        const unauthorizedResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: AuthResponseDto = await this._authService.logout(
        userId,
        refreshToken
      );

      this._logger.info('Logout completed successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Logout controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
