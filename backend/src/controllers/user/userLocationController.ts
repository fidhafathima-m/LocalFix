import { Request, Response } from "express";
import { IUserLocationService } from "@/interfaces/services/user/IUserLocationService";
import { ILogger } from "@/interfaces/utils/ILogger";

interface AuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

export class UserLocationController {
  private userLocationService: IUserLocationService;
  private logger: ILogger;

  constructor(
    userLocationService: IUserLocationService,
    logger: ILogger
  ) {
    this.userLocationService = userLocationService;
    this.logger = logger;
  }

  // Update user location
  async updateUserLocation(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const { coordinates, address } = req.body;

    const context = {
      operation: "updateUserLocation",
      userId,
      coordinates,
      hasAddress: !!address,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating user location", context);

      if (!userId) {
        this.logger.warn(
          "Update location failed - user not authenticated",
          context
        );
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
        this.logger.warn("Update location failed - invalid coordinates", {
          ...context,
          coordinatesProvided: coordinates,
        });
        res.status(400).json({
          success: false,
          message: "Valid coordinates are required [longitude, latitude]",
        });
        return;
      }

      this.logger.debug("Calling service to update user location", {
        ...context,
        longitude: coordinates[0],
        latitude: coordinates[1],
      });

      const result = await this.userLocationService.updateUserLocation(userId, {
        coordinates: coordinates as [number, number],
        address,
      });

      if (!result.success) {
        this.logger.warn("Update location service returned failure", {
          ...context,
          error: result.message,
        });
        res.status(400).json(result);
        return;
      }

      this.logger.info("User location updated successfully", {
        ...context,
        locationId: result.data?._id,
      });

      res.status(200).json({
        success: true,
        message: "Location updated successfully",
        data: result.data,
      });
    } catch (error: any) {
      this.logger.error("Update location error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get user location
  async getUserLocation(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const context = {
      operation: "getUserLocation",
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching user location - START", {
        ...context,
        headers: req.headers,
        method: req.method,
        url: req.url,
      });

      if (!userId) {
        this.logger.warn("Get location failed - user not authenticated", {
          ...context,
          user: req.user,
        });
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      this.logger.info("Calling service to get user location", {
        ...context,
        userId,
      });

      const result = await this.userLocationService.getUserLocation(userId);

      if (!result.success) {
        this.logger.warn("Get location service returned failure", {
          ...context,
          error: result.message,
          serviceResult: result,
        });

        res.status(200).json({
          success: false,
          message: result.message || "Location not found",
          data: null,
        });
        return;
      }

      this.logger.info("User location retrieved successfully", {
        ...context,
        hasLocation: !!result.data,
        locationData: result.data,
      });

      res.status(200).json({
        success: true,
        data: result.data,
      });
    } catch (error: any) {
      this.logger.error("Get location error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Delete user location
  async deleteUserLocation(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user?.id;
    const context = {
      operation: "deleteUserLocation",
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Deleting user location", context);

      if (!userId) {
        this.logger.warn(
          "Delete location failed - user not authenticated",
          context
        );
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await this.userLocationService.deleteUserLocation(userId);

      if (!result.success) {
        this.logger.warn("Delete location service returned failure", {
          ...context,
          error: result.message,
        });
        res.status(400).json(result);
        return;
      }

      this.logger.info("User location deleted successfully", context);

      res.status(200).json({
        success: true,
        message: "Location deleted successfully",
      });
    } catch (error: any) {
      this.logger.error("Delete location error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Find nearby technicians
  async getNearbyTechnicians(req: Request, res: Response): Promise<void> {
    const { lat, lng, radius = "10", serviceName } = req.query;

    const context = {
      operation: "getNearbyTechnicians",
      latitude: lat,
      longitude: lng,
      radius,
      serviceName,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Finding nearby technicians", context);

      if (!lat || !lng) {
        this.logger.warn(
          "Nearby technicians failed - missing coordinates",
          context
        );
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

      this.logger.debug("Searching for technicians with parameters", {
        ...context,
        parsedCoordinates: userCoordinates,
        parsedRadius: radiusKm,
      });

      const result = await this.userLocationService.findTechniciansNearby(
        userCoordinates,
        radiusKm,
        serviceName as string | null
      );

      if (!result.success) {
        this.logger.warn("Nearby technicians service returned failure", {
          ...context,
          error: result.message,
        });
        res.status(400).json(result);
        return;
      }

      this.logger.info("Nearby technicians found successfully", {
        ...context,
        technicianCount: result.count,
      });

      res.status(200).json({
        success: true,
        data: result.data,
        count: result.count,
      });
    } catch (error: any) {
      this.logger.error("Nearby technicians error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
