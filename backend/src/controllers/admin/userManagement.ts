import { Request, Response } from "express";
import { UserManagementService } from "../../services/UserManagementService";

export class UserManagementController {
  private userManagementService: UserManagementService;

  constructor() {
    this.userManagementService = new UserManagementService();
  }

  getUsers = async (req: Request, res: Response): Promise<void> => {
    const result = await this.userManagementService.getUsers();
    res.status(result.success ? 200 : 400).json(result);
  };

  updateUserStatus = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.params;
    const result = await this.userManagementService.updateUserStatus(userId, req.body);
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

export default new UserManagementController();