import { Request, Response } from "express";
import { IUserManagementService } from "../../interfaces/services/admin/IUserManagementService";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";

export class UserManagementController {
  private userManagementService: IUserManagementService;

  constructor(userManagementService: IUserManagementService) {
    this.userManagementService = userManagementService;
  }

  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userManagementService.getUsers();
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get users controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const result = await this.userManagementService.updateUserStatus(
        userId,
        req.body
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Update user status controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  editUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const result = await this.userManagementService.editUser(
        userId,
        req.body
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Edit user controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const result = await this.userManagementService.deleteUser(userId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Delete user controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.userManagementService.getUserStats();
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get user stats controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const result = await this.userManagementService.getUserById(userId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get user by ID controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
