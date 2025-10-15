import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ITechnicianDashboardService } from "../../interfaces/services/technician/ITechnicianDashboardService";

export class TechnicianDashboardController {
  private dashboardService: ITechnicianDashboardService;

  constructor(dashboardService: ITechnicianDashboardService) {
    this.dashboardService = dashboardService;
  }

  getDashboardOverview = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const technicianId = req.user?.id;

      if (!technicianId) {
        res
          .status(401)
          .json({ success: false, message: "Authentication required" });
        return;
      }

      const result = await this.dashboardService.getDashboardOverview(
        technicianId
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  getTechnicianProfile = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const technicianId = req.user?.id;

      if (!technicianId) {
        res
          .status(401)
          .json({ success: false, message: "Authentication required" });
        return;
      }

      const result = await this.dashboardService.getTechnicianProfile(
        technicianId
      );
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}

