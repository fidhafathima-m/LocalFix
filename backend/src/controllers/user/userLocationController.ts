import { Request, Response } from "express";
import { UserLocationService } from "../../services/UserLocationService";
import { IUserLocationService } from "@/interfaces/services/user/IUserLocationService";

interface AuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

export class UserLocationController {
  private userLocationService: IUserLocationService;

  constructor(userLocationService: IUserLocationService) {
    this.userLocationService = userLocationService;
  }
  // Update user location
  async updateUserLocation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { coordinates, address } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      if (
        !coordinates ||
        !Array.isArray(coordinates) ||
        coordinates.length !== 2
      ) {
        res.status(400).json({
          success: false,
          message: "Valid coordinates are required [longitude, latitude]",
        });
        return;
      }

      const result = await this.userLocationService.updateUserLocation(userId, {
        coordinates: coordinates as [number, number],
        address,
      });

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: "Location updated successfully",
        data: result.data,
      });
    } catch (error: any) {
      console.error("Update location error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user location
  async getUserLocation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await this.userLocationService.getUserLocation(userId);

      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error: any) {
      console.error("Get location error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete user location
  async deleteUserLocation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await this.userLocationService.deleteUserLocation(userId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json({
        success: true,
        message: "Location deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete location error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Find nearby technicians
  // Find nearby technicians - REMOVE sortBy parameter
async getNearbyTechnicians(req: Request, res: Response): Promise<void> {
  try {
    const { lat, lng, radius = "10", serviceName } = req.query; // Remove sortBy

    if (!lat || !lng) {
      res.status(400).json({
        success: false,
        message: "Latitude and longitude are required",
      });
      return;
    }

    const userCoordinates: [number, number] = [
      parseFloat(lng as string),
      parseFloat(lat as string),
    ];
    const radiusKm = parseInt(radius as string);

    const result = await this.userLocationService.findTechniciansNearby(
      userCoordinates,
      radiusKm,
      serviceName as string | null
      // Remove sortBy parameter
    );

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json({
      success: true,
      data: result.data,
      count: result.count,
    });
  } catch (error: any) {
    console.error("Nearby technicians error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
}
