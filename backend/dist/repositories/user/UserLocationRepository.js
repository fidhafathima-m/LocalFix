"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLocationRepository = void 0;
const UserLocationSchema_1 = __importDefault(require("../../models/UserLocationSchema"));
const TechnicianSchema_1 = require("../../models/technician/TechnicianSchema");
class UserLocationRepository {
    async findOneByUserId(userId) {
        return await UserLocationSchema_1.default.findOne({ userId });
    }
    async createOrUpdate(userId, locationData) {
        return await UserLocationSchema_1.default.findOneAndUpdate({ userId }, {
            location: {
                type: 'Point',
                coordinates: locationData.coordinates,
            },
            address: locationData.address,
            lastUpdated: new Date(),
        }, {
            upsert: true,
            new: true,
            runValidators: true,
        });
    }
    async deleteByUserId(userId) {
        await UserLocationSchema_1.default.findOneAndDelete({ userId });
    }
    async findNearbyTechnicians(userCoordinates, radiusInMeters, serviceName) {
        const [userLongitude, userLatitude] = userCoordinates;
        try {
            const query = {
                status: 'approved',
                'currentLocation.coordinates': {
                    $exists: true,
                    $ne: null,
                },
            };
            if (serviceName) {
                query.services = serviceName;
            }
            const technicians = await TechnicianSchema_1.Technician.find(query)
                .select('_id userId displayName services experienceYears averageRating ratingCount profilePictureUrl workAreas personalInfo currentLocation')
                .limit(50)
                .lean();
            // Filter out invalid coordinates
            const validTechnicians = technicians.filter(tech => {
                const coords = tech.currentLocation?.coordinates;
                return (coords &&
                    Array.isArray(coords) &&
                    coords.length === 2 &&
                    coords[0] !== 0 &&
                    coords[1] !== 0 &&
                    coords[0] !== null &&
                    coords[1] !== null);
            });
            // Calculate distances using JavaScript
            const techniciansWithDistance = validTechnicians.map(tech => {
                const [techLng, techLat] = tech.currentLocation?.coordinates ?? [0, 0];
                const distance = this.calculateHaversineDistance(userLatitude, userLongitude, techLat, techLng);
                return {
                    ...tech,
                    distance,
                    isNearby: distance <= radiusInMeters,
                    hasLocation: true,
                };
            });
            // Sort: nearby first, then by distance, then by rating
            const sorted = techniciansWithDistance.sort((a, b) => {
                // Nearby technicians first
                if (a.isNearby && !b.isNearby)
                    return -1;
                if (!a.isNearby && b.isNearby)
                    return 1;
                // Then by distance
                if (a.distance !== b.distance) {
                    return a.distance - b.distance;
                }
                // Then by rating
                return (b.averageRating || 0) - (a.averageRating || 0);
            });
            const nearbyCount = sorted.filter(t => t.isNearby).length;
            return sorted;
        }
        catch (error) {
            console.error('Error in findNearbyTechnicians:', error);
            return [];
        }
    }
    calculateHaversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth radius in meters
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
                Math.cos((lat2 * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
exports.UserLocationRepository = UserLocationRepository;
