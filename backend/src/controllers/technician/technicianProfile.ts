import { Response } from "express";
import { ITechnicianProfileService } from "../../interfaces/services/technician/ITechnicianProfileService";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";
import { TechnicianProfileResponseDto } from "@/interfaces/dtos/technicianProfileDtos";
import { TechnicianProfileMapper } from "../../mappers/technicianProfileMappers";
import { LoggerService } from "../../services/LoggerService";

export class TechnicianProfileController {
  private profileService: ITechnicianProfileService;
  private logger: LoggerService;

  constructor(profileService: ITechnicianProfileService) {
    this.profileService = profileService;
    this.logger = new LoggerService();
  }

  // Helper method to handle service responses
  private handleServiceResponse(
    result: any,
    res: Response,
    successMessage?: string
  ): void {
    // Check if result already has statusCode (is a response object)
    if (result && "statusCode" in result) {
      res.status(result.statusCode).json(result);
    } else {
      // If it's a raw data object, wrap it in a success response
      const successResponse = ResponseHelper.success(
        successMessage || "Operation completed successfully",
        result
      );
      res.status(successResponse.statusCode).json(successResponse);
    }
  }

  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    const technicianId = req.user?.id;
    const context = {
      operation: "getProfile",
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching technician profile", context);

      if (!technicianId) {
        this.logger.warn(
          "Get profile failed - authentication required",
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: TechnicianProfileResponseDto =
        await this.profileService.getTechnicianProfile(technicianId);

      this.logger.info("Profile retrieved successfully", {
        ...context,
        profileStatus: result?.profile?.status,
      });

      this.handleServiceResponse(result, res, "Profile retrieved successfully");
    } catch (error: any) {
      this.logger.error("Get profile controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updatePersonalInfo = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = req.user?.id;
    const updateData = req.body;

    const context = {
      operation: "updatePersonalInfo",
      technicianId,
      updateFields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating personal information", context);

      if (!technicianId) {
        this.logger.warn(
          "Update personal info failed - authentication required",
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: TechnicianProfileResponseDto =
        await this.profileService.updatePersonalInformation(
          technicianId,
          updateData
        );

      this.logger.info("Personal information updated successfully", {
        ...context,
        updatedFieldCount: Object.keys(updateData).length,
      });

      this.handleServiceResponse(
        result,
        res,
        "Personal information updated successfully"
      );
    } catch (error: any) {
      this.logger.error("Update personal info controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  uploadPhoto = [
    async (req: AuthRequest, res: Response): Promise<void> => {
      const technicianId = req.user?.id;
      const file = req.file;

      const context = {
        operation: "uploadPhoto",
        technicianId,
        fileName: file?.originalname,
        fileSize: file?.size,
        timestamp: new Date().toISOString(),
      };

      try {
        this.logger.info("Uploading profile photo", context);

        if (!technicianId) {
          this.logger.warn(
            "Upload photo failed - authentication required",
            context
          );
          const unauthorizedResponse = ResponseHelper.unauthorized(
            "Authentication required"
          );
          res
            .status(unauthorizedResponse.statusCode)
            .json(unauthorizedResponse);
          return;
        }

        if (!file) {
          this.logger.warn("Upload photo failed - no file uploaded", context);
          const badRequestResponse =
            ResponseHelper.badRequest("No file uploaded");
          res.status(badRequestResponse.statusCode).json(badRequestResponse);
          return;
        }

        const result = await this.profileService.uploadPhoto(
          technicianId,
          file
        );

        this.logger.info("Profile photo uploaded successfully", {
          ...context,
          uploadSuccess: result.success,
        });

        res.status(result.statusCode).json(result);
      } catch (error: any) {
        this.logger.error("Upload photo controller error", {
          ...context,
          error: error.message,
          stack: error.stack,
        });

        const errorResponse = ResponseHelper.error("Failed to upload photo");
        res.status(errorResponse.statusCode).json(errorResponse);
      }
    },
  ];

  updateIdentityVerification = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = req.user?.id;
    const updateData = req.body;

    const context = {
      operation: "updateIdentityVerification",
      technicianId,
      updateFields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating identity verification", context);

      if (!technicianId) {
        this.logger.warn(
          "Update identity verification failed - authentication required",
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: TechnicianProfileResponseDto =
        await this.profileService.updateIdentityVerification(
          technicianId,
          updateData
        );

      this.logger.info("Identity verification updated successfully", {
        ...context,
        verification: result?.profile?.identityVerification,
      });

      this.handleServiceResponse(
        result,
        res,
        "Identity verification updated successfully"
      );
    } catch (error: any) {
      this.logger.error("Update identity verification controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateSkillsServices = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = req.user?.id;
    const updateData = req.body;

    const context = {
      operation: "updateSkillsServices",
      technicianId,
      updateFields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating skills and services", context);

      if (!technicianId) {
        this.logger.warn(
          "Update skills services failed - authentication required",
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: TechnicianProfileResponseDto =
        await this.profileService.updateSkillsServices(
          technicianId,
          updateData
        );

      this.logger.info("Skills and services updated successfully", {
        ...context,
        servicesCount: result?.profile?.services?.length,
      });

      this.handleServiceResponse(
        result,
        res,
        "Skills and services updated successfully"
      );
    } catch (error: any) {
      this.logger.error("Update skills services controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateAvailability = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = req.user?.id;
    const updateData = req.body;

    const context = {
      operation: "updateAvailability",
      technicianId,
      updateFields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating availability preferences", context);

      if (!technicianId) {
        this.logger.warn(
          "Update availability failed - authentication required",
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: TechnicianProfileResponseDto =
        await this.profileService.updateAvailabilityPreferences(
          technicianId,
          updateData
        );

      this.logger.info("Availability updated successfully", {
        ...context,
        isAvailable: result?.profile?.availabilityPreferences?.isAvailable,
      });

      this.handleServiceResponse(
        result,
        res,
        "Availability updated successfully"
      );
    } catch (error: any) {
      this.logger.error("Update availability controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateBankPayment = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = req.user?.id;
    const updateData = req.body;

    const context = {
      operation: "updateBankPayment",
      technicianId,
      updateFields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating bank and payment details", context);

      if (!technicianId) {
        this.logger.warn(
          "Update bank payment failed - authentication required",
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: TechnicianProfileResponseDto =
        await this.profileService.updateBankPaymentDetails(
          technicianId,
          updateData
        );

      this.logger.info(
        "Bank and payment details updated successfully",
        context
      );

      this.handleServiceResponse(
        result,
        res,
        "Bank and payment details updated successfully"
      );
    } catch (error: any) {
      this.logger.error("Update bank payment controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    const technicianId = req.user?.id;
    const updateData = req.body;

    const context = {
      operation: "updatePassword",
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating password", context);

      if (!technicianId) {
        this.logger.warn(
          "Update password failed - authentication required",
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: TechnicianProfileResponseDto =
        await this.profileService.updatePassword(technicianId, updateData);

      this.logger.info("Password updated successfully", context);

      this.handleServiceResponse(result, res, "Password updated successfully");
    } catch (error: any) {
      this.logger.error("Update password controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  uploadDocument = [
    async (req: AuthRequest, res: Response): Promise<void> => {
      const technicianId = req.user?.id;
      const documentType = req.body.type;
      const file = req.file;

      const context = {
        operation: "uploadDocument",
        technicianId,
        documentType,
        fileName: file?.originalname,
        fileSize: file?.size,
        timestamp: new Date().toISOString(),
      };

      try {
        this.logger.info("Uploading document", context);

        if (!technicianId) {
          this.logger.warn(
            "Upload document failed - authentication required",
            context
          );
          const unauthorizedResponse = ResponseHelper.unauthorized(
            "Authentication required"
          );
          res
            .status(unauthorizedResponse.statusCode)
            .json(unauthorizedResponse);
          return;
        }

        if (!file) {
          this.logger.warn(
            "Upload document failed - no file uploaded",
            context
          );
          const badRequestResponse =
            ResponseHelper.badRequest("No file uploaded");
          res.status(badRequestResponse.statusCode).json(badRequestResponse);
          return;
        }

        if (!documentType) {
          this.logger.warn(
            "Upload document failed - document type required",
            context
          );
          const badRequestResponse = ResponseHelper.badRequest(
            "Document type is required"
          );
          res.status(badRequestResponse.statusCode).json(badRequestResponse);
          return;
        }

        const result = await this.profileService.uploadDocument(
          technicianId,
          file,
          documentType
        );

        this.logger.info("Document uploaded successfully", {
          ...context,
          uploadSuccess: result.success,
        });

        res.status(result.statusCode).json(result);
      } catch (error: any) {
        this.logger.error("Upload document controller error", {
          ...context,
          error: error.message,
          stack: error.stack,
        });

        const errorResponse = ResponseHelper.error("Failed to upload document");
        res.status(errorResponse.statusCode).json(errorResponse);
      }
    },
  ];

  getStaticData = async (req: AuthRequest, res: Response): Promise<void> => {
    const context = {
      operation: "getStaticData",
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching static data", context);

      const staticData = TechnicianProfileMapper.toStaticDataDto();

      this.logger.info("Static data retrieved successfully", context);

      const successResponse = ResponseHelper.success(
        "Static data retrieved successfully",
        staticData
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: any) {
      this.logger.error("Get static data error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error("Failed to fetch static data");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  deactivateProfile = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = req.user?.id;
    const context = {
      operation: "deactivateProfile",
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Deactivating profile", context);

      if (!technicianId) {
        this.logger.warn(
          "Deactivate profile failed - authentication required",
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: TechnicianProfileResponseDto =
        await this.profileService.updateAvailabilityPreferences(technicianId, {
          availability: {
            isAvailable: false,
          },
        });

      this.logger.info("Profile deactivated successfully", context);

      this.handleServiceResponse(
        result,
        res,
        "Profile deactivated successfully"
      );
    } catch (error: any) {
      this.logger.error("Deactivate profile error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(
        "Failed to deactivate profile"
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    const technicianId = req.user?.id;
    const context = {
      operation: "deleteAccount",
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Processing account deletion request", context);

      if (!technicianId) {
        this.logger.warn(
          "Delete account failed - authentication required",
          context
        );
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      this.logger.info("Account deletion request received", context);

      const successResponse = ResponseHelper.success(
        "Account deletion request received. This action will be processed within 24 hours."
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: any) {
      this.logger.error("Delete account error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(
        "Failed to process account deletion"
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getSlotRules = async (req: AuthRequest, res: Response): Promise<void> => {
    const technicianId = req.user?.id;
    const context = {
      operation: "getSlotRules",
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching slot rules", context);

      if (!technicianId) {
        this.logger.warn(
          "Get slot rules failed - authentication required",
          context
        );
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const result = await this.profileService.getSlotRules(technicianId);

      this.logger.info("Slot rules retrieved successfully", {
        ...context,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get slot rules controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };

  getTechnicianAvailability = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const technicianId = req.user?.id;
    const context = {
      operation: "getTechnicianAvailability",
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching technician availability", context);

      if (!technicianId) {
        this.logger.warn(
          "Get technician availability failed - authentication required",
          context
        );
        res.status(401).json({ success: false, message: "Unauthorized" });
        return;
      }

      const result = await this.profileService.getTechnicianAvailability(
        technicianId
      );

      this.logger.info("Technician availability retrieved successfully", {
        ...context,
        isAvailable: result.profile?.availabilityPreferences?.isAvailable,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get technician availability controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
}
