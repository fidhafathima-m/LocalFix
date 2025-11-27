import { IDashboardService } from '../../interfaces/services/admin/IDashboardService';
import { ResponseHelper } from '../../utils/responseHelper';
import { ILogger } from '@/interfaces/utils/ILogger';
import { AuthRequest } from '../../middleware/authMiddleware';
import { Response } from 'express';

export class DashboardController {
  private _dashboardService: IDashboardService;
  private _logger: ILogger;

  constructor(dashboardService: IDashboardService, logger: ILogger) {
    this._dashboardService = dashboardService;
    this._logger = logger;
  }

  getDashboardOverview = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const context = {
      operation: 'getDashboardOverview',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching dashboard overview', context);

      const overview = await this._dashboardService.getDashboardOverview();

      this._logger.info('Dashboard overview retrieved successfully', {
        ...context,
        data: overview,
      });

      const response = ResponseHelper.success('Dashboard overview retrieved', {
        overview,
      });
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch dashboard overview';

      this._logger.error('Get dashboard overview controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getRevenueTrend = async (req: AuthRequest, res: Response): Promise<void> => {
    const { period } = req.query;
    const context = {
      operation: 'getRevenueTrend',
      period: period || 'monthly',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching revenue trend', context);

      const revenueTrend = await this._dashboardService.getRevenueTrend(
        period as string
      );

      this._logger.info('Revenue trend retrieved successfully', {
        ...context,
        dataPoints: revenueTrend.length,
      });

      const response = ResponseHelper.success('Revenue trend retrieved', {
        revenueTrend,
      });
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch revenue trend';

      this._logger.error('Get revenue trend controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getTopTechnicians = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { limit } = req.query;
    const context = {
      operation: 'getTopTechnicians',
      limit: limit || 5,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching top technicians', context);

      const topTechnicians = await this._dashboardService.getTopTechnicians(
        parseInt(limit as string) || 5
      );

      this._logger.info('Top technicians retrieved successfully', {
        ...context,
        count: topTechnicians.length,
      });

      const response = ResponseHelper.success('Top technicians retrieved', {
        topTechnicians,
      });
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch top technicians';

      this._logger.error('Get top technicians controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getCustomerSatisfaction = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const context = {
      operation: 'getCustomerSatisfaction',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching customer satisfaction data', context);

      const customerSatisfaction =
        await this._dashboardService.getCustomerSatisfaction();

      this._logger.info('Customer satisfaction data retrieved successfully', {
        ...context,
        ratingsCount: customerSatisfaction.length,
      });

      const response = ResponseHelper.success(
        'Customer satisfaction data retrieved',
        {
          customerSatisfaction,
        }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch customer satisfaction data';

      this._logger.error('Get customer satisfaction controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getPaymentMethods = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const context = {
      operation: 'getPaymentMethods',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching payment methods data', context);

      const paymentMethods = await this._dashboardService.getPaymentMethods();

      this._logger.info('Payment methods data retrieved successfully', {
        ...context,
        methodsCount: paymentMethods.length,
      });

      const response = ResponseHelper.success(
        'Payment methods data retrieved',
        {
          paymentMethods,
        }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch payment methods data';

      this._logger.error('Get payment methods controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getGrowthMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
    const context = {
      operation: 'getGrowthMetrics',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching growth metrics', context);

      const growthMetrics = await this._dashboardService.getGrowthMetrics();

      this._logger.info('Growth metrics retrieved successfully', {
        ...context,
        metricsCount: growthMetrics.length,
      });

      const response = ResponseHelper.success('Growth metrics retrieved', {
        growthMetrics,
      });
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch growth metrics';

      this._logger.error('Get growth metrics controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getCompleteDashboard = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const context = {
      operation: 'getCompleteDashboard',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching complete dashboard data', context);

      const dashboardData = await this._dashboardService.getCompleteDashboard();

      this._logger.info('Complete dashboard data retrieved successfully', {
        ...context,
        data: dashboardData,
      });

      const response = ResponseHelper.success(
        'Dashboard data retrieved successfully',
        dashboardData
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch dashboard data';

      this._logger.error('Get complete dashboard controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };
}
