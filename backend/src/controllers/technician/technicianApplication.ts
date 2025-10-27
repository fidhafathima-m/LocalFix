import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ITechnicianApplicationService } from "../../interfaces/services/technician/ITechnicianApplicationService";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";
import {
  StartApplicationRequestDto,
  SaveStepRequestDto,
  SubmitApplicationRequestDto,
  StartNewAfterRejectionRequestDto,
  ApplicationResponseDto,
  ApplicationListResponseDto,
  UploadedFileDto,
  FilesCollectionDto,
} from "../../interfaces/dtos/technicianApplicationDtos";

export class TechnicianApplicationController {
  private applicationService: ITechnicianApplicationService;

  constructor(applicationService: ITechnicianApplicationService) {
    this.applicationService = applicationService;
  }

  startApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const requestData: StartApplicationRequestDto = req.body;
      const result: ApplicationResponseDto = await this.applicationService.startApplication(requestData);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Start application controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  saveStep = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const requestData: SaveStepRequestDto = req.body;
      const files: FilesCollectionDto = this.convertExpressFiles(req.files);
      
      const result: ApplicationResponseDto = await this.applicationService.saveStep(
        requestData,
        files
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Save step controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  private convertExpressFiles(files: any): FilesCollectionDto {
    if (!files) return {};
    
    const convertedFiles: FilesCollectionDto = {};
    
    // If files is an array
    if (Array.isArray(files)) {
      convertedFiles.files = files.map(file => this.convertExpressFile(file));
      return convertedFiles;
    }
    
    // If files is an object with field names as keys
    for (const [fieldname, fileArray] of Object.entries(files)) {
      if (Array.isArray(fileArray)) {
        convertedFiles[fieldname] = fileArray.map((file: any) => this.convertExpressFile(file));
      } else {
        const file = fileArray as any;
        convertedFiles[fieldname] = [this.convertExpressFile(file)];
      }
    }
    
    return convertedFiles;
  }

  private convertExpressFile(file: any): UploadedFileDto {
    return {
      fieldname: file.fieldname,
      originalname: file.originalname,
      encoding: file.encoding,
      mimetype: file.mimetype,
      buffer: file.buffer,
      size: file.size,
      stream: file.stream,
      destination: file.destination,
      filename: file.filename,
      path: file.path,
    };
  }

  getApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const { applicationId } = req.params;
      const result: ApplicationResponseDto = await this.applicationService.getApplication(applicationId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get application controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  submitApplication = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const requestData: SubmitApplicationRequestDto = req.body;
      const userId = req.user?.id;

      if (!userId) {
        const unauthorizedResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: ApplicationResponseDto = await this.applicationService.submitApplication(
        requestData.applicationId,
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
      const result: ApplicationResponseDto = await this.applicationService.getApplicationStatus(applicationId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get application status controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getUserApplications = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        const unauthorizedResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: ApplicationListResponseDto = await this.applicationService.getUserApplications(userId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get user applications controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  resubmitApplication = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { applicationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        const unauthorizedResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: ApplicationResponseDto = await this.applicationService.resubmitApplication(
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

  startNewAfterRejection = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const requestData: StartNewAfterRejectionRequestDto = req.body;
      const userId = req.user?.id;

      if (!userId || !requestData.email) {
        const badRequestResponse = ResponseHelper.badRequest("User ID and email are required");
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result: ApplicationResponseDto = await this.applicationService.startNewApplicationAfterRejection(
        userId,
        requestData.email
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Start new after rejection controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
  getApplicationForEdit = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { applicationId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        const unauthorizedResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: ApplicationResponseDto = await this.applicationService.getApplicationForEdit(
        applicationId,
        userId
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get application for edit controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}