import { Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ITechnicianDashboardService } from "../../interfaces/services/technician/ITechnicianDashboardService";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";
import {
  DashboardOverviewResponseDto,
  TechnicianProfileResponseDto,
} from "../../interfaces/dtos/technicianDashboardDtos";
import { LoggerService } from "../../services/LoggerService";

export class TechnicianDashboardController {
  private dashboardService: ITechnicianDashboardService;
  private logger: LoggerService

  constructor(dashboardService: ITechnicianDashboardService) {
    this.dashboardService = dashboardService;
    this.logger = new LoggerService()
  }

  getDashboardOverview = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    
    const technicianId = req.user?.id;

     const context = {
    operation: 'getDashboardOverview',
    technicianId,
    timestamp: new Date().toISOString()
  };
    try {
      
    this.logger.info("Fetchning dashboard overview", context)

      if (!technicianId) {
        this.logger.warn("Authemtication required", context)
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: DashboardOverviewResponseDto = await this.dashboardService.getDashboardOverview(technicianId);

      this.logger.info('Dashboard retrieved successfully', {
        ...context,
        overview: result?.overview,
      });
      
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get dashboard overview controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      this.logger.error('Get technician dashboard error', {
        ...context,
        error: error,
      });
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianProfile = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = req.user?.id;
    const context = {
      operation: "getTechnicianProfile",
      technicianId,
      timestamp: new Date().toISOString()
    }
    try {

      this.logger.info("Fetchning technician profile", context)

      if (!technicianId) {
        this.logger.warn("Authemtication required", context)
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: TechnicianProfileResponseDto = await this.dashboardService.getTechnicianProfile(technicianId);

      this.logger.info('Technician profile retrieved successfully', {
        ...context,
        profile: result?.profile,
      });
      
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get technician profile controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      this.logger.error('Get technician profile error', {
        ...context,
        error: error,
      });
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}