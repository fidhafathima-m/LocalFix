"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationTrackingRepository = void 0;
const LocationTrackingSchema_1 = __importDefault(require("../models/LocationTrackingSchema"));
class LocationTrackingRepository {
    async startLocationSharing(technicianId, orderId, initialLocation) {
        try {
            const tracking = await LocationTrackingSchema_1.default.findOneAndUpdate({ technicianId, orderId }, {
                technicianId,
                orderId,
                locations: [initialLocation],
                isActive: true,
                startedAt: new Date(),
                lastUpdated: new Date(),
            }, { upsert: true, new: true }).populate("technicianId", "displayName phone profilePictureUrl");
            return tracking;
        }
        catch (error) {
            throw new Error(`Failed to start location sharing: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async updateLocation(technicianId, orderId, location) {
        try {
            const tracking = await LocationTrackingSchema_1.default.findOneAndUpdate({ technicianId, orderId, isActive: true }, {
                $push: {
                    locations: location,
                },
                lastUpdated: new Date(),
            }, { new: true }).populate("technicianId", "displayName phone profilePictureUrl");
            return tracking;
        }
        catch (error) {
            throw new Error(`Failed to update location: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async stopLocationSharing(technicianId, orderId) {
        try {
            const tracking = await LocationTrackingSchema_1.default.findOneAndUpdate({ technicianId, orderId }, {
                isActive: false,
                endedAt: new Date(),
                lastUpdated: new Date(),
            }, { new: true });
            return tracking;
        }
        catch (error) {
            throw new Error(`Failed to stop location sharing: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getActiveTracking(orderId) {
        try {
            const tracking = await LocationTrackingSchema_1.default.findOne({
                orderId,
                isActive: true,
            }).populate("technicianId", "displayName phone profilePictureUrl averageRating ratingCount");
            return tracking;
        }
        catch (error) {
            throw new Error(`Failed to get active tracking: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getLocationHistory(orderId) {
        try {
            const tracking = await LocationTrackingSchema_1.default.findOne({ orderId })
                .populate("technicianId", "displayName phone profilePictureUrl")
                .sort({ "locations.timestamp": -1 });
            return tracking;
        }
        catch (error) {
            throw new Error(`Failed to get location history: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async getTechnicianActiveTrackings(technicianId) {
        try {
            const trackings = await LocationTrackingSchema_1.default.find({
                technicianId,
                isActive: true,
            });
            return trackings;
        }
        catch (error) {
            throw new Error(`Failed to get technician trackings: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
}
exports.LocationTrackingRepository = LocationTrackingRepository;
