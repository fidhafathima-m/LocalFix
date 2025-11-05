import { Request, Response } from "express";
import { UserManagementService } from "../../services/UserManagementService";
import { ResponseHelper } from "../../utils/responseHelper";
import { LoggerService } from "../../services/LoggerService";

export class PublicUserController {
  private userService: UserManagementService;
  private logger: LoggerService;

  constructor(userService: UserManagementService) {
    this.userService = userService;
    this.logger = new LoggerService();
  }

  getUserProfile = async (req: Request, res: Response) => {
    const userId = (req as any).user?.id;
    const context = {
      operation: "getUserProfile",
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching authenticated user profile", context);

      if (!userId) {
        this.logger.warn("User not authenticated for profile fetch", context);
        const response = ResponseHelper.unauthorized("User not authenticated");
        return res.status(response.statusCode || 401).json(response);
      }

      this.logger.debug("Calling user service to get public user profile", {
        ...context,
        authenticatedUserId: userId,
      });

      const result = await this.userService.getPublicUserById(userId);

      if (!result.success) {
        this.logger.warn("Failed to fetch user profile", {
          ...context,
          error: result.message,
          statusCode: result.statusCode,
        });
        return res.status(result.statusCode || 404).json(result);
      }

      this.logger.info("User profile retrieved successfully", {
        ...context,
        userEmail: result.user?.email,
        hasProfilePicture: !!result.user?.profilePicture,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch user profile";
      this.logger.error("Get user profile error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error("Failed to fetch user profile");
      return res.status(500).json(response);
    }
  };

  getPublicUserById = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const context = {
      operation: "getPublicUserById",
      requestedUserId: userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching public user by ID", context);

      if (!userId) {
        this.logger.warn("User ID parameter missing", context);
        const response = ResponseHelper.badRequest("User ID is required");
        return res.status(response.statusCode || 400).json(response);
      }

      this.logger.debug("Calling user service to get public user", context);

      const result = await this.userService.getPublicUserById(userId);

      if (!result.success) {
        this.logger.warn("Failed to fetch public user", {
          ...context,
          error: result.message,
          statusCode: result.statusCode,
        });
        return res.status(result.statusCode || 404).json(result);
      }

      this.logger.info("Public user retrieved successfully", {
        ...context,
        userEmail: result.user?.email,
        userRole: result.user?.roles,
        isPublicProfile: true,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch user";
      this.logger.error("Get public user error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error("Failed to fetch user");
      return res.status(500).json(response);
    }
  };
}
