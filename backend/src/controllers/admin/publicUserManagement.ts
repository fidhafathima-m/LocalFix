import { Request, Response } from "express";
import { UserManagementService } from "../../services/UserManagementService";
import { ResponseHelper } from "../../utils/responseHelper";

export class PublicUserController {
  private userService: UserManagementService;

  constructor(userService: UserManagementService) {
    this.userService = userService;
  }

  getUserProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        const response = ResponseHelper.unauthorized("User not authenticated");
        return res.status(response.statusCode || 401).json(response);
      }

      const result = await this.userService.getPublicUserById(userId);

      if (!result.success) {
        return res.status(result.statusCode || 404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Get user profile error:", error);
      const response = ResponseHelper.error("Failed to fetch user profile");
      return res.status(500).json(response);
    }
  };

  getPublicUserById = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      const result = await this.userService.getPublicUserById(userId);

      if (!result.success) {
        return res.status(result.statusCode || 404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Get public user error:", error);
      const response = ResponseHelper.error("Failed to fetch user");
      return res.status(500).json(response);
    }
  };
}
