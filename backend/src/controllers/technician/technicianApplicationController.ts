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
import { ILogger } from "@/interfaces/utils/ILogger";

export class TechnicianApplicationController {
  private applicationService: ITechnicianApplicationService;
  private logger: ILogger;

  constructor(
    applicationService: ITechnicianApplicationService,
    logger: ILogger
  ) {
    this.applicationService = applicationService;
    this.logger = logger;
  }

  startApplication = async (req: Request, res: Response): Promise<void> => {
    const requestData: StartApplicationRequestDto = req.body;
    const context = {
      operation: "startApplication",
      userEmail: requestData.email,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Starting new technician application", context);

      const result: ApplicationResponseDto =
        await this.applicationService.startApplication(requestData);

      this.logger.info("Application started successfully", {
        ...context,
        applicationId: result.data?.application?._id,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Start application controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  saveStep = async (req: AuthRequest, res: Response): Promise<void> => {
    const requestData: SaveStepRequestDto = req.body;
    const userId = req.user?.id;
    const files: FilesCollectionDto = this.convertExpressFiles(req.files);

    const context = {
      operation: "saveStep",
      userId,
      applicationId: requestData.applicationId,
      step: requestData.step,
      fileCount: this.countFiles(files),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Saving application step", context);

      const result: ApplicationResponseDto =
        await this.applicationService.saveStep(requestData, files);

      this.logger.info("Application step saved successfully", {
        ...context,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Save step controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  private countFiles(files: FilesCollectionDto): number {
    if (!files) return 0;

    let count = 0;
    for (const key in files) {
      if (Array.isArray(files[key])) {
        count += files[key].length;
      }
    }
    return count;
  }

  private convertExpressFiles(files: any): FilesCollectionDto {
    if (!files) return {};

    const convertedFiles: FilesCollectionDto = {};

    // If files is an array
    if (Array.isArray(files)) {
      convertedFiles.files = files.map((file) => this.convertExpressFile(file));
      return convertedFiles;
    }

    // If files is an object with field names as keys
    for (const [fieldname, fileArray] of Object.entries(files)) {
      if (Array.isArray(fileArray)) {
        convertedFiles[fieldname] = fileArray.map((file: any) =>
          this.convertExpressFile(file)
        );
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
    const { applicationId } = req.params;
    const context = {
      operation: "getApplication",
      applicationId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching application", context);

      const result: ApplicationResponseDto =
        await this.applicationService.getApplication(applicationId);

      this.logger.info("Application retrieved successfully", {
        ...context,
        status: result.data?.application?.status,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get application controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  submitApplication = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const requestData: SubmitApplicationRequestDto = req.body;
    const userId = req.user?.id;

    const context = {
      operation: "submitApplication",
      userId,
      applicationId: requestData.applicationId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Submitting application", context);

      if (!userId) {
        this.logger.warn(
          "Submit application failed - authentication required",
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: ApplicationResponseDto =
        await this.applicationService.submitApplication(
          requestData.applicationId,
          userId
        );

      this.logger.info("Application submitted successfully", {
        ...context,
        newStatus: result.data?.application?.status,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Submit application controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getApplicationStatus = async (req: Request, res: Response): Promise<void> => {
    const { applicationId } = req.params;
    const context = {
      operation: "getApplicationStatus",
      applicationId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching application status", context);

      const result: ApplicationResponseDto =
        await this.applicationService.getApplicationStatus(applicationId);

      this.logger.info("Application status retrieved successfully", {
        ...context,
        status: result.data?.application?.status,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get application status controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getUserApplications = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const context = {
      operation: "getUserApplications",
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching user applications", context);

      if (!userId) {
        this.logger.warn(
          "Get user applications failed - authentication required",
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: ApplicationListResponseDto =
        await this.applicationService.getUserApplications(userId);

      this.logger.info("User applications retrieved successfully", {
        ...context,
        applicationCount: result.data?.applications?.length,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get user applications controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  resubmitApplication = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { applicationId } = req.params;
    const userId = req.user?.id;

    const context = {
      operation: "resubmitApplication",
      userId,
      applicationId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Resubmitting application", context);

      if (!userId) {
        this.logger.warn(
          "Resubmit application failed - authentication required",
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: ApplicationResponseDto =
        await this.applicationService.resubmitApplication(
          applicationId,
          userId
        );

      this.logger.info("Application resubmitted successfully", {
        ...context,
        newStatus: result.data?.application?.status,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Resubmit application controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  startNewAfterRejection = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const requestData: StartNewAfterRejectionRequestDto = req.body;
    const userId = req.user?.id;

    const context = {
      operation: "startNewAfterRejection",
      userId,
      userEmail: requestData.email,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Starting new application after rejection", context);

      if (!userId || !requestData.email) {
        this.logger.warn(
          "Start new after rejection failed - missing required fields",
          context
        );
        const badRequestResponse = ResponseHelper.badRequest(
          "User ID and email are required"
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result: ApplicationResponseDto =
        await this.applicationService.startNewApplicationAfterRejection(
          userId,
          requestData.email
        );

      this.logger.info("New application started after rejection successfully", {
        ...context,
        newApplicationId: result.data?.application?._id,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Start new after rejection controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getApplicationForEdit = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { applicationId } = req.params;
    const userId = req.user?.id;

    const context = {
      operation: "getApplicationForEdit",
      userId,
      applicationId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching application for editing", context);

      if (!userId) {
        this.logger.warn(
          "Get application for edit failed - authentication required",
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: ApplicationResponseDto =
        await this.applicationService.getApplicationForEdit(
          applicationId,
          userId
        );

      this.logger.info("Application for edit retrieved successfully", {
        ...context,
        status: result.data?.application?.status,
        isEditable: result.data?.application?.status === "draft",
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get application for edit controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
