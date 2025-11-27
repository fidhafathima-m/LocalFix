import { LocationUpdateData } from '../../user/IUserLocation';
import { IUserLocation } from '../../../models/UserLocationSchema';

export interface IUserLocationRepository {
  findOneByUserId(userId: string): Promise<IUserLocation | null>;
  createOrUpdate(
    userId: string,
    locationData: LocationUpdateData
  ): Promise<IUserLocation>;
  deleteByUserId(userId: string): Promise<void>;
  findNearbyTechnicians(
    userCoordinates: [number, number],
    radiusInMeters: number,
    serviceName?: string
  ): Promise<any[]>;
}
