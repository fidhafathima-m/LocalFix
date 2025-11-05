import { Request, Response } from "express";
import { IUserManagementService } from "../../interfaces/services/admin/IUserManagementService";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";
import {
  UsersListResponseDto,
  UserManagementResponseDto,
  UserStatsResponseDto,
  UpdateUserStatusRequestDto,
  EditUserRequestDto,
} from "../../interfaces/dtos/userDtos";
import { LoggerService } from "../../services/LoggerService";

export class UserManagementController {
  private userManagementService: IUserManagementService;
  private logger: LoggerService;

  constructor(userManagementService: IUserManagementService) {
    this.userManagementService = userManagementService;
    this.logger = new LoggerService();
  }

  getUsers = async (req: Request, res: Response): Promise<void> => {
    const context = {
      operation: "getUsers",
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching all users", context);

      const result: UsersListResponseDto =
        await this.userManagementService.getUsers();

      this.logger.info("Users retrieved successfully", {
        ...context,
        count: result?.users?.length,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get users controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const statusData: UpdateUserStatusRequestDto = req.body;

    const context = {
      operation: "updateUserStatus",
      targetUserId: userId,
      newStatus: statusData.status,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating user status", context);

      if (!statusData.status) {
        this.logger.warn(
          "User status update failed - status required",
          context
        );
        const badRequestResponse =
          ResponseHelper.badRequest("Status is required");
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result: UserManagementResponseDto =
        await this.userManagementService.updateUserStatus(userId, statusData);

      this.logger.info("User status updated successfully", {
        ...context,
        userEmail: result?.user?.email,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Update user status controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  editUser = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const userData: EditUserRequestDto = req.body;

    const context = {
      operation: "editUser",
      targetUserId: userId,
      updateFields: Object.keys(userData),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Editing user profile", context);

      if (Object.keys(userData).length === 0) {
        this.logger.warn("User edit failed - no fields to update", context);
        const badRequestResponse = ResponseHelper.badRequest(
          "No fields to update"
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      this.logger.debug("Calling service to edit user", {
        ...context,
        updateFields: userData,
      });

      const result: UserManagementResponseDto =
        await this.userManagementService.editUser(userId, userData);

      this.logger.info("User edited successfully", {
        ...context,
        userEmail: result?.user?.email,
        updatedFieldCount: Object.keys(userData).length,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Edit user controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const context = {
      operation: "deleteUser",
      targetUserId: userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Deleting user", context);

      const result: UserManagementResponseDto =
        await this.userManagementService.deleteUser(userId);

      this.logger.info("User deleted successfully", {
        ...context,
        userEmail: result?.user?.email,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Delete user controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getUserStats = async (req: Request, res: Response): Promise<void> => {
    const context = {
      operation: "getUserStats",
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching user statistics", context);

      const result: UserStatsResponseDto =
        await this.userManagementService.getUserStats();

      this.logger.info("User statistics retrieved successfully", {
        ...context,
        stats: result,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get user stats controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const context = {
      operation: "getUserById",
      targetUserId: userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching user by ID", context);

      const result: UserManagementResponseDto =
        await this.userManagementService.getUserById(userId);

      this.logger.info("User retrieved successfully", {
        ...context,
        userEmail: result?.user?.email,
        userRole: result?.user?.roles?.[0],
        status: result.user?.status,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get user by ID controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
