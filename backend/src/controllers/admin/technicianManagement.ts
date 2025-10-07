import { Request, Response } from "express";
import { TechnicianManagementService } from "../../services/TechnicianManagementService";
import { AuthRequest } from "../../middleware/authMiddleware";

export class TechnicianManagementController {
  private technicianService: TechnicianManagementService;

  constructor() {
    this.technicianService = new TechnicianManagementService();
  }

  getAllTechnicians = async (req: Request, res: Response): Promise<void> => {
    const result = await this.technicianService.getAllTechnicians(req.query);
    res.status(result.success ? 200 : 400).json(result);
  };

  getTechnicianById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.technicianService.getTechnicianById(id);
    res.status(result.success ? 200 : 400).json(result);
  };

  updateTechnicianStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.technicianService.updateTechnicianStatus(id, req.body);
    res.status(result.success ? 200 : 400).json(result);
  };

  getTechnicianStats = async (req: Request, res: Response): Promise<void> => {
    const result = await this.technicianService.getTechnicianStats();
    res.status(result.success ? 200 : 400).json(result);
  };

  getPendingApplications = async (req: Request, res: Response): Promise<void> => {
    const result = await this.technicianService.getPendingApplications(req.query);
    res.status(result.success ? 200 : 400).json(result);
  };

  approveApplication = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.technicianService.approveApplication(id);
    res.status(result.success ? 200 : 400).json(result);
  };

  rejectApplication = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.technicianService.rejectApplication(id, req.body);
    res.status(result.success ? 200 : 400).json(result);
  };

  getApplicationById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const result = await this.technicianService.getApplicationById(id);
    res.status(result.success ? 200 : 400).json(result);
  };

  getApplicationStats = async (req: Request, res: Response): Promise<void> => {
    const result = await this.technicianService.getApplicationStats();
    res.status(result.success ? 200 : 400).json(result);
  };

  getTechnicianByApplicationId = async (req: Request, res: Response): Promise<void> => {
    const { applicationId } = req.params;
    const result = await this.technicianService.getTechnicianByApplicationId(applicationId);
    res.status(result.success ? 200 : 400).json(result);
  };
}

export default new TechnicianManagementController();