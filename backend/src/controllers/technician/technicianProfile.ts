import { Response } from "express";
import { ITechnicianProfileService } from "../../interfaces/services/technician/ITechnicianProfileService";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";
import { TechnicianProfileResponseDto } from "@/interfaces/dtos/technicianProfileDtos";
import { TechnicianProfileMapper } from "../../mappers/technicianProfileMappers";

export class TechnicianProfileController {
  private profileService: ITechnicianProfileService;

  constructor(profileService: ITechnicianProfileService) {
    this.profileService = profileService;
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
    try {
      const technicianId = req.user?.id;

      if (!technicianId) {
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: TechnicianProfileResponseDto =
        await this.profileService.getTechnicianProfile(technicianId);

      this.handleServiceResponse(result, res, "Profile retrieved successfully");
    } catch (error) {
      console.error("Get profile controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updatePersonalInfo = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const updateData = req.body;

      if (!technicianId) {
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
      this.handleServiceResponse(
        result,
        res,
        "Personal information updated successfully"
      );
    } catch (error) {
      console.error("Update personal info controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  uploadPhoto = [
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const technicianId = req.user?.id;

        if (!technicianId) {
          const unauthorizedResponse = ResponseHelper.unauthorized(
            "Authentication required"
          );
          res
            .status(unauthorizedResponse.statusCode)
            .json(unauthorizedResponse);
          return;
        }

        if (!req.file) {
          const badRequestResponse =
            ResponseHelper.badRequest("No file uploaded");
          res.status(badRequestResponse.statusCode).json(badRequestResponse);
          return;
        }

        const result = await this.profileService.uploadPhoto(
          technicianId,
          req.file
        );

        res.status(result.statusCode).json(result);
      } catch (error) {
        console.error("Upload photo controller error:", error);
        const errorResponse = ResponseHelper.error("Failed to upload photo");
        res.status(errorResponse.statusCode).json(errorResponse);
      }
    },
  ];

  updateIdentityVerification = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const updateData = req.body;

      if (!technicianId) {
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
      this.handleServiceResponse(
        result,
        res,
        "Identity verification updated successfully"
      );
    } catch (error) {
      console.error("Update identity verification controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateSkillsServices = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const updateData = req.body;

      if (!technicianId) {
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
      this.handleServiceResponse(
        result,
        res,
        "Skills and services updated successfully"
      );
    } catch (error) {
      console.error("Update skills services controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateAvailability = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const updateData = req.body;

      if (!technicianId) {
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
      this.handleServiceResponse(
        result,
        res,
        "Availability updated successfully"
      );
    } catch (error) {
      console.error("Update availability controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateBankPayment = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const updateData = req.body;

      if (!technicianId) {
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
      this.handleServiceResponse(
        result,
        res,
        "Bank and payment details updated successfully"
      );
    } catch (error) {
      console.error("Update bank payment controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const updateData = req.body;

      if (!technicianId) {
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: TechnicianProfileResponseDto =
        await this.profileService.updatePassword(technicianId, updateData);
      this.handleServiceResponse(result, res, "Password updated successfully");
    } catch (error) {
      console.error("Update password controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  uploadDocument = [
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const technicianId = req.user?.id;
        const documentType = req.body.type;

        if (!technicianId) {
          const unauthorizedResponse = ResponseHelper.unauthorized(
            "Authentication required"
          );
          res
            .status(unauthorizedResponse.statusCode)
            .json(unauthorizedResponse);
          return;
        }

        if (!req.file) {
          const badRequestResponse =
            ResponseHelper.badRequest("No file uploaded");
          res.status(badRequestResponse.statusCode).json(badRequestResponse);
          return;
        }

        if (!documentType) {
          const badRequestResponse = ResponseHelper.badRequest(
            "Document type is required"
          );
          res.status(badRequestResponse.statusCode).json(badRequestResponse);
          return;
        }

        // Use the updated method that handles Multer files
        const result = await this.profileService.uploadDocument(
          technicianId,
          req.file,
          documentType
        );

        res.status(result.statusCode).json(result);
      } catch (error) {
        console.error("Upload document controller error:", error);
        const errorResponse = ResponseHelper.error("Failed to upload document");
        res.status(errorResponse.statusCode).json(errorResponse);
      }
    },
  ];

  getStaticData = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const staticData = TechnicianProfileMapper.toStaticDataDto();

      const successResponse = ResponseHelper.success(
        "Static data retrieved successfully",
        staticData
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error) {
      console.error("Get static data error:", error);
      const errorResponse = ResponseHelper.error("Failed to fetch static data");
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  deactivateProfile = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const technicianId = req.user?.id;

      if (!technicianId) {
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result: TechnicianProfileResponseDto =
        await this.profileService.updateAvailabilityPreferences(technicianId, {
          isAvailable: false,
        });
      this.handleServiceResponse(
        result,
        res,
        "Profile deactivated successfully"
      );
    } catch (error) {
      console.error("Deactivate profile error:", error);
      const errorResponse = ResponseHelper.error(
        "Failed to deactivate profile"
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;

      if (!technicianId) {
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const successResponse = ResponseHelper.success(
        "Account deletion request received. This action will be processed within 24 hours."
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error) {
      console.error("Delete account error:", error);
      const errorResponse = ResponseHelper.error(
        "Failed to process account deletion"
      );
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
