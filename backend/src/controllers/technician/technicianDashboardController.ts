import { AuthRequest } from '../../middleware/authMiddleware';
import { Response } from 'express';

import { ITechnicianDashboardService } from '../../interfaces/services/technician/ITechnicianDashboardService';
import { ResponseHelper } from '../../utils/responseHelper';
import { GeneralMessages } from '../../constants';
import {
  DashboardOverviewResponseDto,
  TechnicianProfileResponseDto,
} from '../../interfaces/dtos/technicianDashboardDtos';
import { ILogger } from '../../interfaces/utils/ILogger';

export class TechnicianDashboardController {
  private _dashboardService: ITechnicianDashboardService;
  private _logger: ILogger;

  constructor(dashboardService: ITechnicianDashboardService, logger: ILogger) {
    this._dashboardService = dashboardService;
    this._logger = logger;
  }

  getDashboardOverview = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = req.user?.id;

    const context = {
      operation: 'getDashboardOverview',
      technicianId,
      timestamp: new Date().toISOString(),
    };
    try {
      this._logger.info('Fetchning dashboard overview', context);

      if (!technicianId) {
        this._logger.warn('Authemtication required', context);
        const unauthorizedResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: DashboardOverviewResponseDto =
        await this._dashboardService.getDashboardOverview(technicianId);

      this._logger.info('Dashboard retrieved successfully', {
        ...context,
        overview: result?.overview,
      });

      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error('Get dashboard overview controller error:', error);
      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      this._logger.error('Get technician dashboard error', {
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
      operation: 'getTechnicianProfile',
      technicianId,
      timestamp: new Date().toISOString(),
    };
    try {
      this._logger.info('Fetchning technician profile', context);

      if (!technicianId) {
        this._logger.warn('Authemtication required', context);
        const unauthorizedResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: TechnicianProfileResponseDto =
        await this._dashboardService.getTechnicianProfile(technicianId);

      this._logger.info('Technician profile retrieved successfully', {
        ...context,
        profile: result?.profile,
      });

      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error('Get technician profile controller error:', error);
      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      this._logger.error('Get technician profile error', {
        ...context,
        error: error,
      });
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
