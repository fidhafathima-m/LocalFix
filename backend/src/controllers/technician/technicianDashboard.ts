// controllers/technician/TechnicianDashboardController.ts
import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { TechnicianDashboardService } from "../../services/TechnicianDashboardService";

export class TechnicianDashboardController {
  private dashboardService: TechnicianDashboardService;

  constructor() {
    this.dashboardService = new TechnicianDashboardService();
  }

  getDashboardOverview = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      
      if (!technicianId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const result = await this.dashboardService.getDashboardOverview(technicianId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  getTechnicianProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      
      if (!technicianId) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const result = await this.dashboardService.getTechnicianProfile(technicianId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}

// Export both the class and a default instance
export default new TechnicianDashboardController();