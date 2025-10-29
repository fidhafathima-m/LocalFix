import { Request, Response } from "express";
import { UpdateUserProfileData } from "../../services/UserProfileService";
import { ResponseHelper } from "../../utils/responseHelper";
import { IUserProfileService } from "@/interfaces/services/user/IUserProfileService";

export class UserProfileController {
  private userProfileService: IUserProfileService;

  constructor(userProfileService: IUserProfileService) {
    this.userProfileService = userProfileService;
  }

  getUserProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      const result = await this.userProfileService.getUserProfile(userId);

      if (!result.success) {
        return res.status(result.statusCode || 404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Get user profile error:", error);
      return res
        .status(500)
        .json(ResponseHelper.error("Failed to fetch user profile"));
    }
  };

  updateUserProfile = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      const updateData: UpdateUserProfileData = req.body;

      const result = await this.userProfileService.updateUserProfile(
        userId,
        updateData
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Update user profile error:", error);
      return res
        .status(500)
        .json(ResponseHelper.error("Failed to update user profile"));
    }
  };

  uploadProfilePicture = async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      if (!req.file) {
        return res.status(400).json(ResponseHelper.error("No file uploaded"));
      }

      const result = await this.userProfileService.uploadProfilePicture(
        userId,
        req.file
      );

      if (!result.success) {
        return res.status(result.statusCode || 400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error("Upload profile picture error:", error);
      return res
        .status(500)
        .json(ResponseHelper.error("Failed to upload profile picture"));
    }
  };
}
