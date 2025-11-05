import { ServiceListResponseDto } from "@/interfaces/dtos/serviceDtos";
import {
  LocationUpdateData,
  TechnicianWithDistance,
} from "@/interfaces/user/IUserLocation";
import { IUserLocation } from "@/models/UserLocationSchema";

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}

export interface IUserLocationService {
  updateUserLocation(
    userId: string,
    locationData: LocationUpdateData
  ): Promise<ServiceResponse<IUserLocation>>;
  getUserLocation(userId: string): Promise<ServiceResponse<IUserLocation>>;
  deleteUserLocation(userId: string): Promise<ServiceResponse<null>>;
  findTechniciansNearby(
    userCoordinates: [number, number],
    radiusKm: number,
    serviceName: string | null
  ): Promise<ServiceResponse<TechnicianWithDistance[]>>;
}
