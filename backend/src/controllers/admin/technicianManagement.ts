import { Request, Response } from "express";
import { TechnicianManagementService } from "../../services/TechnicianManagementService";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ITechnicianManagementService } from "../../interfaces/services/admin/ITechnicianManagementService";
import { ResponseHelper } from "../../utils/responseHelper";

export class TechnicianManagementController {
  private technicianService: ITechnicianManagementService;

  constructor(technicianService: ITechnicianManagementService) {
    this.technicianService = technicianService;
  }

  getAllTechnicians = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.technicianService.getAllTechnicians(req.query);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get technicians controller error:", error);
      const errorResponse = ResponseHelper.error("Internal server error");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.technicianService.getTechnicianById(id);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get technician controller error:", error);
      const errorResponse = ResponseHelper.error("Internal server error");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateTechnicianStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.technicianService.updateTechnicianStatus(id, req.body);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Update technician status controller error:", error);
      const errorResponse = ResponseHelper.error("Internal server error");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.technicianService.getTechnicianStats();
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get technician stats controller error:", error);
      const errorResponse = ResponseHelper.error("Internal server error");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getPendingApplications = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const result = await this.technicianService.getPendingApplications(req.query);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get pending applications controller error:", error);
      const errorResponse = ResponseHelper.error("Internal server error");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  approveApplication = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.technicianService.approveApplication(id);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Approve application controller error:", error);
      const errorResponse = ResponseHelper.error("Internal server error");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  rejectApplication = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        const badRequestResponse = ResponseHelper.badRequest("Rejection reason is required");
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result = await this.technicianService.rejectApplication(id, {
        rejectionReason,
      });
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Reject application controller error:", error);
      const errorResponse = ResponseHelper.error("Internal server error");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getApplicationById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const result = await this.technicianService.getApplicationById(id);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get application controller error:", error);
      const errorResponse = ResponseHelper.error("Internal server error");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getApplicationStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.technicianService.getApplicationStats();
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get application stats controller error:", error);
      const errorResponse = ResponseHelper.error("Internal server error");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianByApplicationId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { applicationId } = req.params;
      const result = await this.technicianService.getTechnicianByApplicationId(applicationId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get technician by application controller error:", error);
      const errorResponse = ResponseHelper.error("Internal server error");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}