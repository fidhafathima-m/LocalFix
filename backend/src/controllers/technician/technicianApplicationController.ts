import { Response } from 'express-serve-static-core';
import { AuthRequest } from '../../types/express';

import { ITechnicianApplicationService } from '../../interfaces/services/technician/ITechnicianApplicationService';
import { ResponseHelper } from '../../utils/responseHelper';
import { GeneralMessages } from '../../constants';
import {
  StartApplicationRequestDto,
  SaveStepRequestDto,
  SubmitApplicationRequestDto,
  StartNewAfterRejectionRequestDto,
  ApplicationResponseDto,
  ApplicationListResponseDto,
  UploadedFileDto,
  FilesCollectionDto,
  ExpressFile,
  ExpressFiles,
} from '../../interfaces/dtos/technicianApplicationDtos';
import { ILogger } from '@/interfaces/utils/ILogger';

export class TechnicianApplicationController {
  private _applicationService: ITechnicianApplicationService;
  private _logger: ILogger;

  constructor(
    applicationService: ITechnicianApplicationService,
    logger: ILogger
  ) {
    this._applicationService = applicationService;
    this._logger = logger;
  }

  startApplication = async (req: AuthRequest, res: Response): Promise<void> => {
    const requestData: StartApplicationRequestDto = req.body;
    const context = {
      operation: 'startApplication',
      userEmail: requestData.email,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Starting new technician application', context);

      const result: ApplicationResponseDto =
        await this._applicationService.startApplication(requestData);

      this._logger.info('Application started successfully', {
        ...context,
        applicationId: result.data?.application?._id,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Start application controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  saveStep = async (req: AuthRequest, res: Response): Promise<void> => {
    const requestData: SaveStepRequestDto = req.body;
    const userId = req.user?.id;
    const files: FilesCollectionDto = this.convertExpressFiles(
      req.files as ExpressFiles | undefined
    );

    const context = {
      operation: 'saveStep',
      userId,
      applicationId: requestData.applicationId,
      step: requestData.step,
      fileCount: this.countFiles(files),
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Saving application step', context);

      const result: ApplicationResponseDto =
        await this._applicationService.saveStep(requestData, files);

      this._logger.info('Application step saved successfully', {
        ...context,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Save step controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  private countFiles(files: FilesCollectionDto): number {
    if (!files) return 0;

    return Object.values(files).reduce((total, fileArray) => {
      return total + fileArray.length;
    }, 0);
  }

  private convertExpressFiles(
    files: ExpressFiles | undefined
  ): FilesCollectionDto {
    if (!files) return {};

    const convertedFiles: FilesCollectionDto = {};

    for (const [fieldname, fileOrArray] of Object.entries(files)) {
      if (Array.isArray(fileOrArray)) {
        convertedFiles[fieldname] = fileOrArray.map((file: ExpressFile) =>
          this.convertExpressFile(file)
        );
      } else {
        const file = fileOrArray as ExpressFile;
        convertedFiles[fieldname] = [this.convertExpressFile(file)];
      }
    }

    return convertedFiles;
  }

  private convertExpressFile(file: ExpressFile): UploadedFileDto {
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

  getApplication = async (req: AuthRequest, res: Response): Promise<void> => {
    const { applicationId } = req.params;
    const context = {
      operation: 'getApplication',
      applicationId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching application', context);

      const result: ApplicationResponseDto =
        await this._applicationService.getApplication(applicationId);

      this._logger.info('Application retrieved successfully', {
        ...context,
        status: result.data?.application?.status,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get application controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
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
      operation: 'submitApplication',
      userId,
      applicationId: requestData.applicationId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Submitting application', context);

      if (!userId) {
        this._logger.warn(
          'Submit application failed - authentication required',
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: ApplicationResponseDto =
        await this._applicationService.submitApplication(
          requestData.applicationId,
          userId
        );

      this._logger.info('Application submitted successfully', {
        ...context,
        newStatus: result.data?.application?.status,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Submit application controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getApplicationStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { applicationId } = req.params;
    const context = {
      operation: 'getApplicationStatus',
      applicationId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching application status', context);

      const result: ApplicationResponseDto =
        await this._applicationService.getApplicationStatus(applicationId);

      this._logger.info('Application status retrieved successfully', {
        ...context,
        status: result.data?.application?.status,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get application status controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getUserApplications = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const context = {
      operation: 'getUserApplications',
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching user applications', context);

      if (!userId) {
        this._logger.warn(
          'Get user applications failed - authentication required',
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: ApplicationListResponseDto =
        await this._applicationService.getUserApplications(userId);

      this._logger.info('User applications retrieved successfully', {
        ...context,
        applicationCount: result.data?.applications?.length,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get user applications controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
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
      operation: 'resubmitApplication',
      userId,
      applicationId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Resubmitting application', context);

      if (!userId) {
        this._logger.warn(
          'Resubmit application failed - authentication required',
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: ApplicationResponseDto =
        await this._applicationService.resubmitApplication(
          applicationId,
          userId
        );

      this._logger.info('Application resubmitted successfully', {
        ...context,
        newStatus: result.data?.application?.status,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Resubmit application controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
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
      operation: 'startNewAfterRejection',
      userId,
      userEmail: requestData.email,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Starting new application after rejection', context);

      if (!userId || !requestData.email) {
        this._logger.warn(
          'Start new after rejection failed - missing required fields',
          context
        );
        const badRequestResponse = ResponseHelper.badRequest(
          'User ID and email are required'
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const result: ApplicationResponseDto =
        await this._applicationService.startNewApplicationAfterRejection(
          userId,
          requestData.email
        );

      this._logger.info(
        'New application started after rejection successfully',
        {
          ...context,
          newApplicationId: result.data?.application?._id,
        }
      );

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Start new after rejection controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
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
      operation: 'getApplicationForEdit',
      userId,
      applicationId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching application for editing', context);

      if (!userId) {
        this._logger.warn(
          'Get application for edit failed - authentication required',
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: ApplicationResponseDto =
        await this._applicationService.getApplicationForEdit(
          applicationId,
          userId
        );

      this._logger.info('Application for edit retrieved successfully', {
        ...context,
        status: result.data?.application?.status,
        isEditable: result.data?.application?.status === 'draft',
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get application for edit controller error', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
