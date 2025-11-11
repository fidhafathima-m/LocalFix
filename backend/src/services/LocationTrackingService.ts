import { ILocationPoint } from "../interfaces/common/ILocationTracking";
import { ILocationTrackingRepository } from "../interfaces/repository/ILocationTrackingRepository";
import { ILocationTrackingService } from "../interfaces/services/ILocationTrackingService";
import { LocationTrackingRepository } from "../repositories/LocationTrackingRepository";
import { Types } from "mongoose";

export class LocationTrackingService implements ILocationTrackingService {
  private locationRepository: ILocationTrackingRepository;

  constructor() {
    this.locationRepository = new LocationTrackingRepository();
  }

  async startLocationSharing(
    technicianId: string,
    orderId: string,
    location: { lat: number; lng: number; accuracy?: number }
  ): Promise<any> {
    try {
      const locationPoint: ILocationPoint = {
        coordinates: [location.lng, location.lat],
        timestamp: new Date(),
        accuracy: location.accuracy,
      };

      const tracking = await this.locationRepository.startLocationSharing(
        new Types.ObjectId(technicianId),
        orderId,
        locationPoint
      );

      return {
        success: true,
        data: tracking,
        message: "Location sharing started successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async updateTechnicianLocation(
    technicianId: string,
    orderId: string,
    location: {
      lat: number;
      lng: number;
      accuracy?: number;
      speed?: number;
      heading?: number;
    }
  ): Promise<any> {
    try {
      const locationPoint: ILocationPoint = {
        coordinates: [location.lng, location.lat],
        timestamp: new Date(),
        accuracy: location.accuracy,
        speed: location.speed,
        heading: location.heading,
      };

      const tracking = await this.locationRepository.updateLocation(
        new Types.ObjectId(technicianId),
        orderId,
        locationPoint
      );

      if (!tracking) {
        return {
          success: false,
          error: "No active location sharing found",
        };
      }

      return {
        success: true,
        data: tracking,
        message: "Location updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async stopLocationSharing(
    technicianId: string,
    orderId: string
  ): Promise<any> {
    try {
      const tracking = await this.locationRepository.stopLocationSharing(
        new Types.ObjectId(technicianId),
        orderId
      );

      return {
        success: true,
        data: tracking,
        message: "Location sharing stopped successfully",
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async getLiveTrackingData(orderId: string): Promise<any> {
    try {
      const tracking = await this.locationRepository.getActiveTracking(
        orderId
      );

      if (!tracking) {
        return {
          success: false,
          error: "No active tracking found for this booking",
        };
      }

      // Get the latest location
      const latestLocation = tracking.locations[tracking.locations.length - 1];

      const liveData = {
        technicianId: tracking.technicianId,
        locations: tracking.locations,
        isActive: tracking.isActive,
        lastUpdated: tracking.lastUpdated,
        currentLocation: {
          lat: latestLocation.coordinates[1],
          lng: latestLocation.coordinates[0],
          accuracy: latestLocation.accuracy,
          timestamp: latestLocation.timestamp,
        },
      };

      return {
        success: true,
        data: liveData,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  async getLocationHistory(orderId: string): Promise<any> {
    try {
      const tracking = await this.locationRepository.getLocationHistory(
        orderId
      );

      if (!tracking) {
        return {
          success: false,
          error: "No location history found for this booking",
        };
      }

      return {
        success: true,
        data: tracking,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
