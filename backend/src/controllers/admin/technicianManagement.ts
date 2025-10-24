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

export class TechnicianManagementController {
  private technicianService: ITechnicianManagementService;

  constructor(technicianService: ITechnicianManagementService) {
    this.technicianService = technicianService;
  }

  getAllTechnicians = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: TechnicianFiltersDto = req.query;
      const result: TechnicianListResponseDto = await this.technicianService.getAllTechnicians(filters);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get technicians controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result: SingleTechnicianResponseDto = await this.technicianService.getTechnicianById(id);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get technician controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateTechnicianStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const statusData: UpdateStatusRequestDto = req.body;
      const result: SingleTechnicianResponseDto = await this.technicianService.updateTechnicianStatus(
        id,
        statusData
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Update technician status controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const result: TechnicianStatsResponseDto = await this.technicianService.getTechnicianStats();
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get technician stats controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getPendingApplications = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const filters: ApplicationFiltersDto = req.query;
      const result: ApplicationListResponseDto = await this.technicianService.getPendingApplications(
        filters
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get pending applications controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  approveApplication = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result: ApplicationListResponseDto = await this.technicianService.approveApplication(id);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Approve application controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  rejectApplication = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const rejectData: RejectApplicationRequestDto = req.body;

      if (!rejectData.rejectionReason) {
        const badRequestResponse = ResponseHelper.badRequest(
          "Rejection reason is required"
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result: ApplicationListResponseDto = await this.technicianService.rejectApplication(id, rejectData);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Reject application controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getApplicationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result: ApplicationListResponseDto = await this.technicianService.getApplicationById(id);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get application controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getApplicationStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const result: ApplicationStatsResponseDto = await this.technicianService.getApplicationStats();
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get application stats controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianByApplicationId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { applicationId } = req.params;
      const result: TechnicianListResponseDto = await this.technicianService.getTechnicianByApplicationId(
        applicationId
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get technician by application controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}