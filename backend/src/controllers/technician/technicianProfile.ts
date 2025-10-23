import { Response } from "express";
import { ITechnicianProfileService } from "../../interfaces/services/technician/ITechnicianProfileService";
import { AuthRequest } from "../../middleware/authMiddleware";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";

export class TechnicianProfileController {
  private profileService: ITechnicianProfileService;

  constructor(profileService: ITechnicianProfileService) {
    this.profileService = profileService;
  }

  // Helper method to handle service responses
  private handleServiceResponse(result: any, res: Response, successMessage?: string): void {
    // Check if result already has statusCode (is a response object)
    if (result && 'statusCode' in result) {
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

      const result = await this.profileService.getTechnicianProfile(technicianId);
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

      const result = await this.profileService.updatePersonalInformation(
        technicianId,
        updateData
      );
      this.handleServiceResponse(result, res, "Personal information updated successfully");
    } catch (error) {
      console.error("Update personal info controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

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

      const result = await this.profileService.updateIdentityVerification(
        technicianId,
        updateData
      );
      this.handleServiceResponse(result, res, "Identity verification updated successfully");
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

      const result = await this.profileService.updateSkillsServices(
        technicianId,
        updateData
      );
      this.handleServiceResponse(result, res, "Skills and services updated successfully");
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

      const result = await this.profileService.updateAvailabilityPreferences(
        technicianId,
        updateData
      );
      this.handleServiceResponse(result, res, "Availability updated successfully");
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

      const result = await this.profileService.updateBankPaymentDetails(
        technicianId,
        updateData
      );
      this.handleServiceResponse(result, res, "Bank and payment details updated successfully");
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

      const result = await this.profileService.updatePassword(
        technicianId,
        updateData
      );
      this.handleServiceResponse(result, res, "Password updated successfully");
    } catch (error) {
      console.error("Update password controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const documentData = req.body;

      if (!technicianId) {
        const unauthorizedResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(unauthorizedResponse.statusCode).json(unauthorizedResponse);
        return;
      }

      const result = await this.profileService.uploadDocument(
        technicianId,
        documentData
      );
      this.handleServiceResponse(result, res, "Document uploaded successfully");
    } catch (error) {
      console.error("Upload document controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getStaticData = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const staticData = {
        languages: [
          { value: "english", label: "English" },
          { value: "spanish", label: "Spanish" },
          { value: "french", label: "French" },
          { value: "german", label: "German" },
          { value: "hindi", label: "Hindi" },
        ],
        genders: [
          { value: "male", label: "Male" },
          { value: "female", label: "Female" },
          { value: "other", label: "Other" },
          { value: "prefer-not-to-say", label: "Prefer not to say" },
        ],
        idTypes: [
          { value: "passport", label: "Passport" },
          { value: "driver_license", label: "Driver's License" },
          { value: "national_id", label: "National ID" },
          { value: "aadhaar", label: "Aadhaar Card" },
        ],
        services: [
          { value: "ac-repair", label: "AC Repair", basePrice: 499 },
          {
            value: "washing-machine",
            label: "Washing Machine Repair",
            basePrice: 399,
          },
          {
            value: "refrigerator",
            label: "Refrigerator Repair",
            basePrice: 599,
          },
          { value: "fan-repair", label: "Fan Repair", basePrice: 299 },
          { value: "tv-repair", label: "TV Repair", basePrice: 699 },
        ],
        serviceAreas: [
          { value: "sector-1", label: "Sector 1" },
          { value: "sector-2", label: "Sector 2" },
          { value: "sector-3", label: "Sector 3" },
          { value: "sector-4", label: "Sector 4" },
        ],
        documentTypes: [
          { value: "id_proof", label: "ID Proof" },
          { value: "address_proof", label: "Address Proof" },
          { value: "police_verification", label: "Police Verification" },
          { value: "certificate", label: "Professional Certificate" },
        ],
        verificationStatuses: [
          { value: "pending", label: "Pending", color: "yellow" },
          { value: "approved", label: "Approved", color: "green" },
          { value: "rejected", label: "Rejected", color: "red" },
          {
            value: "needs_reupload",
            label: "Needs Re-upload",
            color: "orange",
          },
        ],
        withdrawalPreferences: [
          { value: "auto", label: "Automatic weekly withdrawal" },
          { value: "manual", label: "Manual withdrawal request" },
        ],
        daysOfWeek: [
          { value: "monday", label: "Monday" },
          { value: "tuesday", label: "Tuesday" },
          { value: "wednesday", label: "Wednesday" },
          { value: "thursday", label: "Thursday" },
          { value: "friday", label: "Friday" },
          { value: "saturday", label: "Saturday" },
          { value: "sunday", label: "Sunday" },
        ],
      };

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

      const result = await this.profileService.updateAvailabilityPreferences(
        technicianId,
        { isAvailable: false }
      );
      this.handleServiceResponse(result, res, "Profile deactivated successfully");
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