import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ITechnicianApplicationService } from "../../interfaces/services/technician/ITechnicianApplicationService";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";

export class TechnicianApplicationController {
  private applicationService: ITechnicianApplicationService;

  constructor(applicationService: ITechnicianApplicationService) {
    this.applicationService = applicationService;
  }

  startApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.applicationService.startApplication(req.body);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Start application controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  saveStep = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const result = await this.applicationService.saveStep(req.body, req.files);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Save step controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const { applicationId } = req.params;
      const result = await this.applicationService.getApplication(applicationId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get application controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  submitApplication = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { applicationId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        const unauthorizedResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result = await this.applicationService.submitApplication(
        applicationId,
        userId
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Submit application controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getApplicationStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { applicationId } = req.params;
      const result = await this.applicationService.getApplicationStatus(
        applicationId
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get application status controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getUserApplications = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        const unauthorizedResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result = await this.applicationService.getUserApplications(userId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get user applications controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  resubmitApplication = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { applicationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        const unauthorizedResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result = await this.applicationService.resubmitApplication(
        applicationId,
        userId
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Resubmit application controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  startNewAfterRejection = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { email } = req.body;
      const userId = req.user?.id;

      if (!userId || !email) {
        const badRequestResponse = ResponseHelper.badRequest("User ID and email are required");
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result =
        await this.applicationService.startNewApplicationAfterRejection(
          userId,
          email
        );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Start new after rejection controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}