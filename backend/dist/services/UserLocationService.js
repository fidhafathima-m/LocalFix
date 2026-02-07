"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLocationService = void 0;
class UserLocationService {
    constructor(userLocationRepository, logger) {
        this._userLocationRepository = userLocationRepository;
        this._logger = logger;
    }
    async updateUserLocation(userId, locationData) {
        const context = {
            operation: 'updateUserLocation',
            userId,
            locationData,
            timestamp: new Date().toString(),
        };
        try {
            this._logger.info('Updating user location', context);
            const userLocation = await this._userLocationRepository.createOrUpdate(userId, locationData);
            this._logger.info('Created or updated user location', {
                ...context,
                data: userLocation,
            });
            return {
                success: true,
                data: userLocation,
            };
        }
        catch (error) {
            console.error('Error updating user location:', error);
            this._logger.error('Failed to update user location', {
                ...context,
                error: error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getUserLocation(userId) {
        const context = {
            operation: 'getUserLocation',
            userId,
            timestamp: new Date().toString(),
        };
        try {
            this._logger.info('Updating user location', context);
            const userLocation = await this._userLocationRepository.findOneByUserId(userId);
            if (!userLocation) {
                this._logger.warn('Location not found', {
                    ...context,
                    userLocation,
                });
                return {
                    success: false,
                    error: 'Location not found',
                };
            }
            this._logger.info('User location found', {
                ...context,
                data: userLocation,
            });
            return {
                success: true,
                data: userLocation,
            };
        }
        catch (error) {
            console.error('Error getting user location:', error);
            this._logger.error('Failed to get user location', {
                ...context,
                error: error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async deleteUserLocation(userId) {
        const context = {
            operation: 'deleteUserLocation',
            userId,
            timestamp: new Date().toString(),
        };
        try {
            this._logger.info('deleting user location', context);
            await this._userLocationRepository.deleteByUserId(userId);
            this._logger.info('User location deleted', context);
            return {
                success: true,
                message: 'User location deleted successfully',
            };
        }
        catch (error) {
            console.error('Error deleting user location:', error);
            this._logger.error('Failed to delete user location', {
                ...context,
                error: error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async findTechniciansNearby(userCoordinates, radiusKm = 10, serviceName = null) {
        const context = {
            operation: 'findTechniciansNearby',
            userCoordinates,
            radiusKm,
            serviceName,
            timestamp: new Date().toString(),
        };
        try {
            this._logger.info('Finding technicaians nearby', context);
            const radiusInMeters = radiusKm * 1000;
            const nearbyTechnicians = await this._userLocationRepository.findNearbyTechnicians(userCoordinates, radiusInMeters, serviceName || undefined);
            this._logger.info('Nearby techncins found', {
                ...context,
                data: nearbyTechnicians,
                count: nearbyTechnicians.length,
            });
            return {
                success: true,
                data: nearbyTechnicians,
                count: nearbyTechnicians.length,
            };
        }
        catch (error) {
            console.error('Error finding nearby technicians:', error);
            this._logger.error('Failed to find nearby technicins', {
                ...context,
                error: error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return {
                success: false,
                error: error.message,
            };
        }
    }
}
exports.UserLocationService = UserLocationService;
