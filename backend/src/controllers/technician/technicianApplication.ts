import { Request, Response } from "express";
import { TechnicianApplicationService } from "../../services/TechnicianApplicationService";
import { AuthRequest } from "../../middleware/authMiddleware";

export class TechnicianApplicationController {
  private applicationService: TechnicianApplicationService;

  constructor() {
    this.applicationService = new TechnicianApplicationService();
  }

  startApplication = async (req: Request, res: Response): Promise<void> => {
    const result = await this.applicationService.startApplication(req.body);
    res.status(result.success ? 200 : 400).json(result);
  };

  saveStep = async (req: AuthRequest, res: Response): Promise<void> => {
    const result = await this.applicationService.saveStep(req.body, req.files);
    res.status(result.success ? 200 : 400).json(result);
  };

  getApplication = async (req: Request, res: Response): Promise<void> => {
    const { applicationId } = req.params;
    const result = await this.applicationService.getApplication(applicationId);
    res.status(result.success ? 200 : 400).json(result);
  };

  submitApplication = async (req: AuthRequest, res: Response): Promise<void> => {
    const { applicationId } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const result = await this.applicationService.submitApplication(applicationId, userId);
    res.status(result.success ? 200 : 400).json(result);
  };

  getApplicationStatus = async (req: Request, res: Response): Promise<void> => {
    const { applicationId } = req.params;
    const result = await this.applicationService.getApplicationStatus(applicationId);
    res.status(result.success ? 200 : 400).json(result);
  };

  getUserApplications = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const result = await this.applicationService.getUserApplications(userId);
    res.status(result.success ? 200 : 400).json(result);
  };
}

export default new TechnicianApplicationController();