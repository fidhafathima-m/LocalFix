import { Request, Response } from "express";
import { IUserManagementService } from "../../interfaces/services/admin/IUserManagementService";

export class UserManagementController {
  private userManagementService: IUserManagementService;

  constructor(userManagementService: IUserManagementService) {
    this.userManagementService = userManagementService;
  }

  getUsers = async (req: Request, res: Response): Promise<void> => {
    const result = await this.userManagementService.getUsers();
    res.status(result.success ? 200 : 400).json(result);
  };

  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const result = await this.userManagementService.updateUserStatus(
      userId,
      req.body
    );
    res.status(result.success ? 200 : 400).json(result);
  };

  editUser = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const result = await this.userManagementService.editUser(userId, req.body);
    res.status(result.success ? 200 : 400).json(result);
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const result = await this.userManagementService.deleteUser(userId);
    res.status(result.success ? 200 : 400).json(result);
  };

  getUserStats = async (req: Request, res: Response): Promise<void> => {
    const result = await this.userManagementService.getUserStats();
    res.status(result.success ? 200 : 400).json(result);
  };

  getUserById = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const result = await this.userManagementService.getUserById(userId);
    res.status(result.success ? 200 : 400).json(result);
  };
}
