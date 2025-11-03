import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ITechnicianManagementService } from "../../interfaces/services/admin/ITechnicianManagementService";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";
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
} from "../../interfaces/dtos/technicianDtos";
import { LoggerService } from "../../services/LoggerService";

export class TechnicianManagementController {
  private technicianService: ITechnicianManagementService;
  private logger: LoggerService;

  constructor(technicianService: ITechnicianManagementService) {
    this.technicianService = technicianService;
    this.logger = new LoggerService();
  }

  // ========== PUBLIC ROUTES ==========

  getPublicTechnicians = async (req: Request, res: Response): Promise<void> => {
    const { service } = req.query;
    const context = {
      operation: 'getPublicTechnicians',
      serviceFilter: service,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching public technicians', context);

      const filters: TechnicianFiltersDto = {
        status: "approved",
        ...(service && { service: service as string }),
      };

      this.logger.debug('Calling service to get public technicians', {
        ...context,
        filters
      });

      const result: TechnicianListResponseDto =
        await this.technicianService.getPublicTechnicians(filters);
      
      this.logger.info('Public technicians retrieved successfully', {
        ...context,
        count: result.data?.technicians?.length,
        total: result.data?.pagination?.total
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Get public technicians controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechniciansByService = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { service } = req.params;
    const context = {
      operation: 'getTechniciansByService',
      service,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching technicians by service', context);

      const filters: TechnicianFiltersDto = {
        status: "approved",
        service: service,
      };

      this.logger.debug('Calling service to get technicians by service', context);

      const result: TechnicianListResponseDto =
        await this.technicianService.getPublicTechnicians(filters);
      
      this.logger.info('Technicians by service retrieved successfully', {
        ...context,
        count: result.data?.technicians?.length,
        total: result.data?.pagination?.total
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Get technicians by service controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getPublicTechnicianById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'getPublicTechnicianById',
      technicianId: id,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching public technician by ID', context);

      const result: SingleTechnicianResponseDto =
        await this.technicianService.getPublicTechnicianById(id);
      
      this.logger.info('Public technician retrieved successfully', {
        ...context,
        technicianName: result.data?.technician?.displayName
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Get public technician controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // ========== ADMIN ROUTES ==========

  getAllTechnicians = async (req: Request, res: Response): Promise<void> => {
    const filters: TechnicianFiltersDto = req.query;
    const context = {
      operation: 'getAllTechnicians',
      filters,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching all technicians (admin)', context);

      const result: TechnicianListResponseDto =
        await this.technicianService.getAllTechnicians(filters);
      
      this.logger.info('All technicians retrieved successfully (admin)', {
        ...context,
        count: result.data?.technicians?.length,
        total: result.data?.pagination?.total
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Get technicians controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'getTechnicianById',
      technicianId: id,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching technician by ID (admin)', context);

      const result: SingleTechnicianResponseDto =
        await this.technicianService.getTechnicianById(id);
      
      this.logger.info('Technician retrieved successfully (admin)', {
        ...context,
        technicianName: result.data?.technician?.displayName,
        status: result.data?.technician?.status
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Get technician controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
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
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Updating technician status', context);

      const result: SingleTechnicianResponseDto =
        await this.technicianService.updateTechnicianStatus(id, statusData);
      
      this.logger.info('Technician status updated successfully', {
        ...context,
        technicianName: result.data?.technician?.displayName,
        previousStatus: result.data?.technician?.status
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Update technician status controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianStats = async (req: Request, res: Response): Promise<void> => {
    const context = {
      operation: 'getTechnicianStats',
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching technician statistics', context);

      const result: TechnicianStatsResponseDto =
        await this.technicianService.getTechnicianStats();
      
      this.logger.info('Technician statistics retrieved successfully', {
        ...context,
        stats: result.data
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Get technician stats controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getPendingApplications = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const filters: ApplicationFiltersDto = req.query;
    const context = {
      operation: 'getPendingApplications',
      filters,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching pending applications', context);

      const result: ApplicationListResponseDto =
        await this.technicianService.getPendingApplications(filters);
      
      this.logger.info('Pending applications retrieved successfully', {
        ...context,
        count: result.data?.applications?.length,
        total: result.data?.pagination?.total
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Get pending applications controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
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
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Approving technician application', context);

      const result: ApplicationListResponseDto =
        await this.technicianService.approveApplication(id);
      
      this.logger.info('Application approved successfully', {
        ...context,
        technicianId: result.data?.applications?.[0]?.technicianId
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Approve application controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
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
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Rejecting technician application', context);

      if (!rejectData.rejectionReason) {
        this.logger.warn('Rejection failed - reason required', context);
        const badRequestResponse = ResponseHelper.badRequest(
          "Rejection reason is required"
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      this.logger.debug('Calling service to reject application', context);

      const result: ApplicationListResponseDto =
        await this.technicianService.rejectApplication(id, rejectData);
      
      this.logger.info('Application rejected successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Reject application controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getApplicationById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'getApplicationById',
      applicationId: id,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching application by ID', context);

      const result: ApplicationListResponseDto =
        await this.technicianService.getApplicationById(id);
      
      this.logger.info('Application retrieved successfully', {
        ...context,
        technicianId: result.data?.applications?.[0]?.technicianId,
        status: result.data?.applications?.[0]?.status
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Get application controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getApplicationStats = async (req: Request, res: Response): Promise<void> => {
    const context = {
      operation: 'getApplicationStats',
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching application statistics', context);

      const result: ApplicationStatsResponseDto =
        await this.technicianService.getApplicationStats();
      
      this.logger.info('Application statistics retrieved successfully', {
        ...context,
        stats: result.data
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Get application stats controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianByApplicationId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { applicationId } = req.params;
    const context = {
      operation: 'getTechnicianByApplicationId',
      applicationId,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching technician by application ID', context);

      const result: TechnicianListResponseDto =
        await this.technicianService.getTechnicianByApplicationId(
          applicationId
        );
      
      this.logger.info('Technician by application retrieved successfully', {
        ...context,
        technicianId: result.data?.technicians?.[0]?._id,
        technicianName: result.data?.technicians?.[0]?.displayName
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Get technician by application controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}