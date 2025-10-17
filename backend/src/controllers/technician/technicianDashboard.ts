import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ITechnicianDashboardService } from "../../interfaces/services/technician/ITechnicianDashboardService";
import { ResponseHelper } from "../../utils/responseHelper";

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
        const unauthorizedResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result = await this.dashboardService.getDashboardOverview(
        technicianId
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get dashboard overview controller error:", error);
      const errorResponse = ResponseHelper.error("Internal server error");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianProfile = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const technicianId = req.user?.id;

      if (!technicianId) {
        const unauthorizedResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result = await this.dashboardService.getTechnicianProfile(
        technicianId
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get technician profile controller error:", error);
      const errorResponse = ResponseHelper.error("Internal server error");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}