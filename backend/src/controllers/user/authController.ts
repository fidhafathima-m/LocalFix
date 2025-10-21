import { Request, Response } from "express";
import { IAuthService } from "../../interfaces/services/user/IAuthService";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";
import { AuthRequest } from "@/middleware/authMiddleware";

export class AuthController {
  private authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.signup(req.body);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Signup controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.verifyOtp(req.body);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Verify OTP controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.verifyResetOtp(req.body);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Verify reset OTP controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Login controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone, email, userType } = req.body;
      const result = await this.authService.forgotPassword(
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
      const result = await this.authService.resetPassword(req.body);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Reset password controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  resendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone, email, purpose, userType } = req.body;
      const result = await this.authService.resendOTP(
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
      const result = await this.authService.googleAuth(req.body);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Google auth controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  facebookLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { accessToken, userID } = req.body;
      const result = await this.authService.facebookLogin(accessToken, userID);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Facebook login controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  async refreshToken(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    const result = await this.authService.refreshToken(refreshToken);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(result.statusCode || 401).json(result);
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    const { refreshToken } = req.body;
    const userId = req.user?.id;

    const result = await this.authService.logout(userId!, refreshToken);

    res.status(result.statusCode || 200).json(result);
  }
}
