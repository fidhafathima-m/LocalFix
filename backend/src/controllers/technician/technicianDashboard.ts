import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ITechnicianDashboardService } from "../../interfaces/services/technician/ITechnicianDashboardService";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";

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
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result = await this.dashboardService.getDashboardOverview(
        technicianId
      );
      
      // Check if result already has statusCode (is a response object)
      if (result && 'statusCode' in result) {
        res.status(Number(result.statusCode)).json(result);
      } else {
        // If it's a raw technician object, wrap it in a success response
        const successResponse = ResponseHelper.success(
          "Dashboard overview retrieved successfully",
          result
        );
        res.status(successResponse.statusCode).json(successResponse);
      }
    } catch (error) {
      console.error("Get dashboard overview controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
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
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result = await this.dashboardService.getTechnicianProfile(
        technicianId
      );
      
      // Check if result already has statusCode (is a response object)
      if (result && 'statusCode' in result) {
        res.status(Number(result.statusCode)).json(result);
      } else {
        // If it's a raw technician object, wrap it in a success response
        const successResponse = ResponseHelper.success(
          "Technician profile retrieved successfully",
          result
        );
        res.status(successResponse.statusCode).json(successResponse);
      }
    } catch (error) {
      console.error("Get technician profile controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}