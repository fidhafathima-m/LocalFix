"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationTrackingService = void 0;
const LocationTrackingRepository_1 = require("../repositories/LocationTrackingRepository");
const mongoose_1 = require("mongoose");
class LocationTrackingService {
    constructor() {
        this._locationRepository = new LocationTrackingRepository_1.LocationTrackingRepository();
    }
    async startLocationSharing(technicianId, orderId, location) {
        try {
            const locationPoint = {
                coordinates: [location.lng, location.lat],
                timestamp: new Date(),
                accuracy: location.accuracy,
            };
            const tracking = await this._locationRepository.startLocationSharing(new mongoose_1.Types.ObjectId(technicianId), orderId, locationPoint);
            return {
                success: true,
                data: tracking,
                message: 'Location sharing started successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
    async updateTechnicianLocation(technicianId, orderId, location) {
        try {
            const locationPoint = {
                coordinates: [location.lng, location.lat],
                timestamp: new Date(),
                accuracy: location.accuracy,
                speed: location.speed,
                heading: location.heading,
            };
            const tracking = await this._locationRepository.updateLocation(new mongoose_1.Types.ObjectId(technicianId), orderId, locationPoint);
            if (!tracking) {
                return {
                    success: false,
                    error: 'No active location sharing found',
                };
            }
            return {
                success: true,
                data: tracking,
                message: 'Location updated successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
    async stopLocationSharing(technicianId, orderId) {
        try {
            const tracking = await this._locationRepository.stopLocationSharing(new mongoose_1.Types.ObjectId(technicianId), orderId);
            return {
                success: true,
                data: tracking,
                message: 'Location sharing stopped successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
    async getLiveTrackingData(orderId) {
        try {
            const tracking = await this._locationRepository.getActiveTracking(orderId);
            if (!tracking) {
                return {
                    success: false,
                    error: 'No active tracking found for this booking',
                };
            }
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
    async getLocationHistory(orderId) {
        try {
            const tracking = await this._locationRepository.getLocationHistory(orderId);
            if (!tracking) {
                return {
                    success: false,
                    error: 'No location history found for this booking',
                };
            }
            return {
                success: true,
                data: tracking,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    }
}
exports.LocationTrackingService = LocationTrackingService;
