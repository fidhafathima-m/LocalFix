// src/controllers/technician/TechnicianProfileController.ts
import { Response } from "express";
import { ITechnicianProfileService } from "../../interfaces/services/technician/ITechnicianProfileService";
import { AuthRequest } from "../../middleware/authMiddleware";

export class TechnicianProfileController {
  private profileService: ITechnicianProfileService;

  constructor(profileService: ITechnicianProfileService) {
    this.profileService = profileService;
    console.log('🎯 TechnicianProfileController INITIALIZED with new code');
  }

  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    console.log('🚀🚀🚀 PROFILE CONTROLLER CALLED - Service method should be reached next');
    console.log('🔍 Request user:', req.user);
    console.log('🔍 Request URL:', req.url);
    console.log('🔍 Request method:', req.method);
    try {
      const technicianId = req.user?.id; 

      if (!technicianId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await this.profileService.getTechnicianProfile(technicianId);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Get profile controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  updatePersonalInfo = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const updateData = req.body;

      if (!technicianId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await this.profileService.updatePersonalInformation(
        technicianId,
        updateData
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Update personal info controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  updateIdentityVerification = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const updateData = req.body;

      if (!technicianId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await this.profileService.updateIdentityVerification(
        technicianId,
        updateData
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Update identity verification controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  updateSkillsServices = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const updateData = req.body;

      if (!technicianId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await this.profileService.updateSkillsServices(
        technicianId,
        updateData
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Update skills services controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  updateAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const updateData = req.body;

      if (!technicianId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await this.profileService.updateAvailabilityPreferences(
        technicianId,
        updateData
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Update availability controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  updateBankPayment = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const updateData = req.body;

      if (!technicianId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await this.profileService.updateBankPaymentDetails(
        technicianId,
        updateData
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Update bank payment controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const updateData = req.body;

      if (!technicianId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await this.profileService.updatePassword(
        technicianId,
        updateData
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Update password controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;
      const documentData = req.body;

      if (!technicianId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const result = await this.profileService.uploadDocument(
        technicianId,
        documentData
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Upload document controller error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Additional methods for frontend integration
  getStaticData = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // Return static data for dropdowns and selections
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
          { value: "washing-machine", label: "Washing Machine Repair", basePrice: 399 },
          { value: "refrigerator", label: "Refrigerator Repair", basePrice: 599 },
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
          { value: "needs_reupload", label: "Needs Re-upload", color: "orange" },
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

      res.status(200).json({
        success: true,
        message: "Static data retrieved successfully",
        data: staticData,
      });
    } catch (error) {
      console.error("Get static data error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch static data",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Method to handle profile deactivation
  deactivateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;

      if (!technicianId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // This would typically call a service method to deactivate the profile
      const result = await this.profileService.updateAvailabilityPreferences(
        technicianId,
        { isAvailable: false }
      );

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: "Profile deactivated successfully",
      });
    } catch (error) {
      console.error("Deactivate profile error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to deactivate profile",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Method to handle account deletion
  deleteAccount = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const technicianId = req.user?.id;

      if (!technicianId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      // This would typically call a service method to soft delete the account
      // For now, we'll just return a success message
      res.status(200).json({
        success: true,
        message: "Account deletion request received. This action will be processed within 24 hours.",
      });
    } catch (error) {
      console.error("Delete account error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process account deletion",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
}