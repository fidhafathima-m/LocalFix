// services/UserLocationService.ts
import { IUserLocationService, ServiceResponse } from "@/interfaces/services/user/IUserLocationService";
import { LocationUpdateData, TechnicianWithDistance } from "../interfaces/user/IUserLocation";
import { IUserLocation } from "../models/UserLocationSchema";
import { IUserLocationRepository } from "@/interfaces/repository/user/IUserLocationRepository";

export class UserLocationService implements IUserLocationService {
  private userLocationRepository: IUserLocationRepository;

  constructor(userLocationRepository: IUserLocationRepository) {
    this.userLocationRepository = userLocationRepository;
  }

  async updateUserLocation(
    userId: string, 
    locationData: LocationUpdateData
  ): Promise<ServiceResponse<IUserLocation>> {
    try {
      const userLocation = await this.userLocationRepository.createOrUpdate(userId, locationData);
      
      return {
        success: true,
        data: userLocation
      };
    } catch (error: any) {
      console.error("Error updating user location:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getUserLocation(userId: string): Promise<ServiceResponse<IUserLocation>> {
    try {
      const userLocation = await this.userLocationRepository.findOneByUserId(userId);
      
      if (!userLocation) {
        return {
          success: false,
          error: "Location not found"
        };
      }

      return {
        success: true,
        data: userLocation
      };
    } catch (error: any) {
      console.error("Error getting user location:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteUserLocation(userId: string): Promise<ServiceResponse<null>> {
    try {
      await this.userLocationRepository.deleteByUserId(userId);
      
      return {
        success: true,
        message: "User location deleted successfully"
      };
    } catch (error: any) {
      console.error("Error deleting user location:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async findTechniciansNearby(
  userCoordinates: [number, number],
  radiusKm: number = 10,
  serviceName: string | null = null
  // Remove sortBy parameter
): Promise<ServiceResponse<TechnicianWithDistance[]>> {
  try {
    const radiusInMeters = radiusKm * 1000;
    const nearbyTechnicians = await this.userLocationRepository.findNearbyTechnicians(
      userCoordinates,
      radiusInMeters,
      serviceName || undefined
      // Remove sortBy parameter
    );

    return {
      success: true,
      data: nearbyTechnicians,
      count: nearbyTechnicians.length
    };
  } catch (error: any) {
    console.error("Error finding nearby technicians:", error);
    return {
      success: false,
      error: error.message
    };
  }
}
}