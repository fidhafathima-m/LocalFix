import { Request, Response } from "express";
import { UpdateUserProfileData } from "../../services/UserProfileService";
import { ResponseHelper } from "../../utils/responseHelper";
import { IUserProfileService } from "@/interfaces/services/user/IUserProfileService";
import { ILogger } from "@/interfaces/utils/ILogger";

export class UserProfileController {
  private _userProfileService: IUserProfileService;
  private _logger: ILogger;

  constructor(userProfileService: IUserProfileService, logger: ILogger) {
    this._userProfileService = userProfileService;
    this._logger = logger;
  }

  getUserProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const context = {
      operation: "getUserProfile",
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Fetching user profile", context);

      if (!userId) {
        this._logger.warn(
          "Get user profile failed - user not authenticated",
          context
        );
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      const result = await this._userProfileService.getUserProfile(userId);

      if (!result.success) {
        this._logger.warn("Get user profile service returned failure", {
          ...context,
          error: result.message,
          statusCode: result.statusCode,
        });
        return res.status(result.statusCode || 404).json(result);
      }

      this._logger.info("User profile retrieved successfully", {
        ...context,
        userEmail: result.data?.user?.email,
        hasProfilePicture: !!result.data?.user?.profilePicture,
      });

      return res.status(200).json(result);
    } catch (error: unknown) {
      this._logger.error("Get user profile error", {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      return res
        .status(500)
        .json(ResponseHelper.error("Failed to fetch user profile"));
    }
  };

  updateUserProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const updateData: UpdateUserProfileData = req.body;

    const context = {
      operation: "updateUserProfile",
      userId,
      updateFields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Updating user profile", context);

      if (!userId) {
        this._logger.warn(
          "Update user profile failed - user not authenticated",
          context
        );
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      if (Object.keys(updateData).length === 0) {
        this._logger.warn(
          "Update user profile failed - no fields to update",
          context
        );
        return res
          .status(400)
          .json(ResponseHelper.error("No fields to update"));
      }

      this._logger.debug("Profile update data", {
        ...context,
        updateFields: updateData,
      });

      const result = await this._userProfileService.updateUserProfile(
        userId,
        updateData
      );

      if (!result.success) {
        this._logger.warn("Update user profile service returned failure", {
          ...context,
          error: result.message,
          statusCode: result.statusCode,
        });
        return res.status(result.statusCode || 400).json(result);
      }

      this._logger.info("User profile updated successfully", {
        ...context,
        updatedFieldCount: Object.keys(updateData).length,
        userEmail: result.data?.user?.email,
      });

      return res.status(200).json(result);
    } catch (error: unknown) {
      this._logger.error("Update user profile error", {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      return res
        .status(500)
        .json(ResponseHelper.error("Failed to update user profile"));
    }
  };

  uploadProfilePicture = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const file = req.file;

    const context = {
      operation: "uploadProfilePicture",
      userId,
      fileName: file?.originalname,
      fileSize: file?.size,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Uploading profile picture", context);

      if (!userId) {
        this._logger.warn(
          "Upload profile picture failed - user not authenticated",
          context
        );
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      if (!file) {
        this._logger.warn(
          "Upload profile picture failed - no file uploaded",
          context
        );
        return res.status(400).json(ResponseHelper.error("No file uploaded"));
      }

      this._logger.debug("Processing profile picture upload", {
        ...context,
        mimetype: file.mimetype,
      });

      const result = await this._userProfileService.uploadProfilePicture(
        userId,
        file
      );

      if (!result.success) {
        this._logger.warn("Upload profile picture service returned failure", {
          ...context,
          error: result.message,
          statusCode: result.statusCode,
        });
        return res.status(result.statusCode || 400).json(result);
      }

      this._logger.info("Profile picture uploaded successfully", {
        ...context,
        uploadSuccess: result.success,
        profilePictureUrl: result.data?.profilePictureUrl,
      });

      return res.status(200).json(result);
    } catch (error: unknown) {
      this._logger.error("Upload profile picture error", {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      return res
        .status(500)
        .json(ResponseHelper.error("Failed to upload profile picture"));
    }
  };

  changePassword = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const context = {
      operation: "changePassword",
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info("Changing user password", context);

      if (!userId) {
        this._logger.warn(
          "Change password failed - user not authenticated",
          context
        );
        return res
          .status(401)
          .json(ResponseHelper.error("User not authenticated"));
      }

      if (!currentPassword || !newPassword || !confirmPassword) {
        this._logger.warn("Change password failed - missing required fields", {
          ...context,
          hasCurrentPassword: !!currentPassword,
          hasNewPassword: !!newPassword,
          hasConfirmPassword: !!confirmPassword,
        });
        return res
          .status(400)
          .json(ResponseHelper.error("All password fields are required"));
      }

      if (newPassword !== confirmPassword) {
        this._logger.warn(
          "Change password failed - password confirmation mismatch",
          context
        );
        return res
          .status(400)
          .json(ResponseHelper.error("New passwords do not match"));
      }

      this._logger.debug("Initiating password change process", context);

      const result = await this._userProfileService.changePassword(
        userId,
        currentPassword,
        newPassword,
        confirmPassword
      );

      if (!result.success) {
        this._logger.warn("Change password service returned failure", {
          ...context,
          error: result.message,
          statusCode: result.statusCode,
        });
        return res.status(result.statusCode || 400).json(result);
      }

      this._logger.info("Password changed successfully", context);

      return res.status(200).json(result);
    } catch (error: unknown) {
      this._logger.error("Change password error", {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      return res
        .status(500)
        .json(ResponseHelper.error("Failed to change password"));
    }
  };
}
