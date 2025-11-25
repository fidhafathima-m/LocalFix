import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ITechnicianManagementService } from '../../interfaces/services/admin/ITechnicianManagementService';
import { ResponseHelper } from '../../utils/responseHelper';
import { GeneralMessages } from '../../constants';
import {
  TechnicianListResponseDto,
  SingleTechnicianResponseDto,
  ApplicationListResponseDto,
  TechnicianStatsResponseDto,
  ApplicationStatsResponseDto,
  UpdateStatusRequestDto,
  RejectApplicationRequestDto,
  TechnicianFiltersDto,
  ApplicationFiltersDto,
} from '../../interfaces/dtos/technicianDtos';
import { ILogger } from '@/interfaces/utils/ILogger';

export class TechnicianManagementController {
  private _technicianService: ITechnicianManagementService;
  private _logger: ILogger;

  constructor(
    technicianService: ITechnicianManagementService,
    logger: ILogger
  ) {
    this._technicianService = technicianService;
    this._logger = logger;
  }

  // ========== PUBLIC ROUTES ==========

  getPublicTechnicians = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { service, page, limit, search, location, sortBy } = req.query;
    const context = {
      operation: 'getPublicTechnicians',
      serviceFilter: service,
      page,
      limit,
      search,
      location,
      sortBy,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching public technicians', context);

      const filters: TechnicianFiltersDto = {
        status: 'approved',
        ...(service && { service: service as string }),
        ...(page && { page: Number(page) }),
        ...(limit && { limit: Number(limit) }),
        ...(search && { search: search as string }),
        ...(location && { location: location as string }),
        ...(sortBy && { sortBy: sortBy as string }),
      };

      const result: TechnicianListResponseDto =
        await this._technicianService.getPublicTechnicians(filters);

      this._logger.info('Public technicians retrieved successfully', {
        ...context,
        count: result.data?.technicians?.length,
        total: result.data?.pagination?.total,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get public technicians controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechniciansByService = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { service } = req.params;
    const context = {
      operation: 'getTechniciansByService',
      service,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technicians by service', context);

      const filters: TechnicianFiltersDto = {
        status: 'approved',
        service: service,
      };

      const result: TechnicianListResponseDto =
        await this._technicianService.getPublicTechnicians(filters);

      this._logger.info('Technicians by service retrieved successfully', {
        ...context,
        count: result.data?.technicians?.length,
        total: result.data?.pagination?.total,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get technicians by service controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getPublicTechnicianById = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'getPublicTechnicianById',
      technicianId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching public technician by ID', context);

      const result: SingleTechnicianResponseDto =
        await this._technicianService.getPublicTechnicianById(id);

      this._logger.info('Public technician retrieved successfully', {
        ...context,
        technicianName: result.data?.technician?.displayName,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get public technician controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // ========== ADMIN ROUTES ==========

  getAllTechnicians = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { search, status, service, page, limit } = req.query;
    const context = {
      operation: 'getAllTechnicians',
      search,
      status,
      service,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching all technicians with filters', context);

      const filters: any = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        ...(search && { search: search as string }),
        ...(status && status !== 'All Status' && { status: status as string }),
        ...(service &&
          service !== 'All Services' && { service: service as string }),
      };

      const result: TechnicianListResponseDto =
        await this._technicianService.getAllTechnicians(filters);

      this._logger.info('Technicians retrieved successfully with filters', {
        ...context,
        count: result.data?.technicians?.length,
        total: result.data?.pagination?.total,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get technicians controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianById = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'getTechnicianById',
      technicianId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technician by ID (admin)', context);

      const result: SingleTechnicianResponseDto =
        await this._technicianService.getTechnicianById(id);

      this._logger.info('Technician retrieved successfully (admin)', {
        ...context,
        technicianName: result.data?.technician?.displayName,
        status: result.data?.technician?.status,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get technician controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateTechnicianStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const statusData: UpdateStatusRequestDto = req.body;
    const adminUserId = (req as AuthRequest).user?.id;

    const context = {
      operation: 'updateTechnicianStatus',
      technicianId: id,
      newStatus: statusData.status,
      adminUserId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Updating technician status', context);

      const result: SingleTechnicianResponseDto =
        await this._technicianService.updateTechnicianStatus(id, statusData);

      this._logger.info('Technician status updated successfully', {
        ...context,
        technicianName: result.data?.technician?.displayName,
        previousStatus: result.data?.technician?.status,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Update technician status controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianStats = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const context = {
      operation: 'getTechnicianStats',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technician statistics', context);

      const result: TechnicianStatsResponseDto =
        await this._technicianService.getTechnicianStats();

      this._logger.info('Technician statistics retrieved successfully', {
        ...context,
        stats: result.data,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get technician stats controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getPendingApplications = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { search, service, page, limit } = req.query;
    const context = {
      operation: 'getPendingApplications',
      search,
      service,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching pending applications with filters', context);

      const filters: any = {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        ...(search && { search: search as string }),
        ...(service &&
          service !== 'All Services' && { service: service as string }),
      };

      const result: ApplicationListResponseDto =
        await this._technicianService.getPendingApplications(filters);

      this._logger.info('Pending applications retrieved successfully', {
        ...context,
        count: result.data?.applications?.length,
        total: result.data?.pagination?.total,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get pending applications controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  approveApplication = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const adminUserId = (req as AuthRequest).user?.id;
    const context = {
      operation: 'approveApplication',
      applicationId: id,
      adminUserId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Approving technician application', context);

      const result: ApplicationListResponseDto =
        await this._technicianService.approveApplication(id);

      this._logger.info('Application approved successfully', {
        ...context,
        technicianId: result.data?.applications?.[0]?.technicianId,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Approve application controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  rejectApplication = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const rejectData: RejectApplicationRequestDto = req.body;
    const adminUserId = (req as AuthRequest).user?.id;

    const context = {
      operation: 'rejectApplication',
      applicationId: id,
      adminUserId,
      rejectionReason: rejectData.rejectionReason,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Rejecting technician application', context);

      if (!rejectData.rejectionReason) {
        this._logger.warn('Rejection failed - reason required', context);
        const badRequestResponse = ResponseHelper.badRequest(
          'Rejection reason is required'
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result: ApplicationListResponseDto =
        await this._technicianService.rejectApplication(id, rejectData);

      this._logger.info('Application rejected successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Reject application controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getApplicationById = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'getApplicationById',
      applicationId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching application by ID', context);

      const result: ApplicationListResponseDto =
        await this._technicianService.getApplicationById(id);

      this._logger.info('Application retrieved successfully', {
        ...context,
        technicianId: result.data?.applications?.[0]?.technicianId,
        status: result.data?.applications?.[0]?.status,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get application controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getApplicationStats = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const context = {
      operation: 'getApplicationStats',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching application statistics', context);

      const result: ApplicationStatsResponseDto =
        await this._technicianService.getApplicationStats();

      this._logger.info('Application statistics retrieved successfully', {
        ...context,
        stats: result.data,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get application stats controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianByApplicationId = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { applicationId } = req.params;
    const context = {
      operation: 'getTechnicianByApplicationId',
      applicationId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technician by application ID', context);

      const result: TechnicianListResponseDto =
        await this._technicianService.getTechnicianByApplicationId(
          applicationId
        );

      this._logger.info('Technician by application retrieved successfully', {
        ...context,
        technicianId: result.data?.technicians?.[0]?._id,
        technicianName: result.data?.technicians?.[0]?.displayName,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get technician by application controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
  getTechnicianSlotRules = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this._technicianService.getTechnicianSlotRules(id);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Get technician slot rules error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch slot rules',
      });
    }
  };

  getTechnicianAvailability = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      const result = await this._technicianService.getTechnicianAvailability(
        id,
        startDate as string,
        endDate as string
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error('Get technician availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch availability',
      });
    }
  };
  getTechnicianPublicAvailability = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { technicianId } = req.params;
    const { startDate, endDate } = req.query;

    const context = {
      operation: 'getTechnicianPublicAvailability',
      technicianId,
      startDate,
      endDate,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching public technician availability', context);

      const result =
        await this._technicianService.getTechnicianPublicAvailability(
          technicianId,
          startDate as string,
          endDate as string
        );

      this._logger.info(
        'Public technician availability retrieved successfully',
        {
          ...context,
          availabilityCount: result.data?.availability?.length,
        }
      );

      res.status(result.statusCode || 200).json(result);
    } catch (error: unknown) {
      this._logger.error(
        'Get technician public availability controller error',
        {
          ...context,
          error: error instanceof Error ? error.message : undefined,
          stack: error instanceof Error ? error.stack : undefined,
        }
      );

      const errorResponse = ResponseHelper.error(
        'Failed to fetch technician availability'
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
