import { ILocationPoint, ILocationTracking } from "../interfaces/common/ILocationTracking";
import { ILocationTrackingRepository } from "../interfaces/repository/ILocationTrackingRepository";
import LocationTrackingSchema from "../models/LocationTrackingSchema";
import { Types } from "mongoose";

export class LocationTrackingRepository implements ILocationTrackingRepository {
  async startLocationSharing(
    technicianId: Types.ObjectId,
    orderId: string,
    initialLocation: ILocationPoint
  ): Promise<ILocationTracking> {
    try {
      const tracking = await LocationTrackingSchema.findOneAndUpdate(
        { technicianId, orderId },
        {
          technicianId,
          orderId,
          locations: [initialLocation],
          isActive: true,
          startedAt: new Date(),
          lastUpdated: new Date(),
        },
        { upsert: true, new: true }
      ).populate("technicianId", "displayName phone profilePictureUrl");

      return tracking;
    } catch (error) {
      throw new Error(
        `Failed to start location sharing: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async updateLocation(
    technicianId: Types.ObjectId,
    orderId: string,
    location: ILocationPoint
  ): Promise<ILocationTracking | null> {
    try {
      const tracking = await LocationTrackingSchema.findOneAndUpdate(
        { technicianId, orderId, isActive: true },
        {
          $push: {
            locations: location,
          },
          lastUpdated: new Date(),
        },
        { new: true }
      ).populate("technicianId", "displayName phone profilePictureUrl");

      return tracking;
    } catch (error) {
      throw new Error(
        `Failed to update location: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async stopLocationSharing(
    technicianId: Types.ObjectId,
    orderId: string
  ): Promise<ILocationTracking | null> {
    try {
      const tracking = await LocationTrackingSchema.findOneAndUpdate(
        { technicianId, orderId },
        {
          isActive: false,
          endedAt: new Date(),
          lastUpdated: new Date(),
        },
        { new: true }
      );

      return tracking;
    } catch (error) {
      throw new Error(
        `Failed to stop location sharing: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getActiveTracking(
    orderId: string
  ): Promise<ILocationTracking | null> {
    try {
      const tracking = await LocationTrackingSchema.findOne({
        orderId,
        isActive: true,
      }).populate(
        "technicianId",
        "displayName phone profilePictureUrl averageRating ratingCount"
      );

      return tracking;
    } catch (error) {
      throw new Error(
        `Failed to get active tracking: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getLocationHistory(
    orderId: string
  ): Promise<ILocationTracking | null> {
    try {
      const tracking = await LocationTrackingSchema.findOne({ orderId })
        .populate("technicianId", "displayName phone profilePictureUrl")
        .sort({ "locations.timestamp": -1 });

      return tracking;
    } catch (error) {
      throw new Error(
        `Failed to get location history: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getTechnicianActiveTrackings(
    technicianId: Types.ObjectId
  ): Promise<ILocationTracking[]> {
    try {
      const trackings = await LocationTrackingSchema.find({
        technicianId,
        isActive: true,
      });

      return trackings;
    } catch (error) {
      throw new Error(
        `Failed to get technician trackings: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
