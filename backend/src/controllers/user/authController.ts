import { Request, Response } from "express";
import { AuthService } from "../../services/AuthService";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signup = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.signup(req.body);
    res.status(result.success ? 200 : 400).json(result);
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.verifyOtp(req.body);
    res.status(result.success ? 200 : 400).json(result);
  };

  verifyResetOtp = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.verifyResetOtp(req.body);
    res.status(result.success ? 200 : 400).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);
    res.status(result.success ? 200 : 400).json(result);
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const { phone, email, userType } = req.body;
    const result = await this.authService.forgotPassword(
      phone,
      email,
      userType
    );
    res.status(result.success ? 200 : 400).json(result);
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.resetPassword(req.body);
    res.status(result.success ? 200 : 400).json(result);
  };

  resendOTP = async (req: Request, res: Response): Promise<void> => {
    const { phone, email, purpose, userType } = req.body;
    const result = await this.authService.resendOTP(
      phone,
      email,
      purpose,
      userType
    );
    res.status(result.success ? 200 : 400).json(result);
  };

  googleAuth = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.googleAuth(req.body);
    res.status(result.success ? 200 : 400).json(result);
  };

  facebookLogin = async (req: Request, res: Response): Promise<void> => {
    const { accessToken, userID } = req.body;
    const result = await this.authService.facebookLogin(accessToken, userID);
    res.status(result.success ? 200 : 400).json(result);
  };
}

export default new AuthController();
