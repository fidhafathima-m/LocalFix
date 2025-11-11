import { Types } from "mongoose";
import { ILocationPoint, ILocationTracking } from "../common/ILocationTracking";

export interface ILocationTrackingRepository {
  startLocationSharing(
    technicianId: Types.ObjectId,
    orderId: string,
    initialLocation: ILocationPoint
  ): Promise<ILocationTracking>;
  updateLocation(
    technicianId: Types.ObjectId,
    orderId: string,
    location: ILocationPoint
  ): Promise<ILocationTracking | null>;
  stopLocationSharing(
    technicianId: Types.ObjectId,
    orderId: string
  ): Promise<ILocationTracking | null>;
  getActiveTracking(orderId: string): Promise<ILocationTracking | null>;
  getLocationHistory(orderId: string): Promise<ILocationTracking | null>;
  getTechnicianActiveTrackings(
    technicianId: Types.ObjectId
  ): Promise<ILocationTracking[]>;
}
