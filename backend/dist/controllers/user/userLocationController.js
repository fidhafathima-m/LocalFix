"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserLocationController = void 0;
class UserLocationController {
    constructor(userLocationService, logger) {
        // Update user location
        this.updateUserLocation = async (req, res) => {
            const userId = req.user?.id;
            const { coordinates, address } = req.body;
            const context = {
                operation: 'updateUserLocation',
                userId,
                coordinates,
                hasAddress: !!address,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating user location', context);
                if (!userId) {
                    this._logger.warn('Update location failed - user not authenticated', context);
                    res.status(401).json({
                        success: false,
                        message: 'User not authenticated',
                    });
                    return;
                }
                if (!coordinates ||
                    !Array.isArray(coordinates) ||
                    coordinates.length !== 2) {
                    this._logger.warn('Update location failed - invalid coordinates', {
                        ...context,
                        coordinatesProvided: coordinates,
                    });
                    res.status(400).json({
                        success: false,
                        message: 'Valid coordinates are required [longitude, latitude]',
                    });
                    return;
                }
                this._logger.debug('Calling service to update user location', {
                    ...context,
                    longitude: coordinates[0],
                    latitude: coordinates[1],
                });
                const result = await this._userLocationService.updateUserLocation(userId, {
                    coordinates: coordinates,
                    address,
                });
                if (!result.success) {
                    this._logger.warn('Update location service returned failure', {
                        ...context,
                        error: result.message,
                    });
                    res.status(400).json(result);
                    return;
                }
                this._logger.info('User location updated successfully', {
                    ...context,
                    locationId: result.data?._id,
                });
                res.status(200).json({
                    success: true,
                    message: 'Location updated successfully',
                    data: result.data,
                });
            }
            catch (error) {
                this._logger.error('Update location error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        // Get user location
        this.getUserLocation = async (req, res) => {
            const userId = req.user?.id;
            const context = {
                operation: 'getUserLocation',
                userId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching user location - START', {
                    ...context,
                    headers: req.headers,
                    method: req.method,
                    url: req.url,
                });
                if (!userId) {
                    this._logger.warn('Get location failed - user not authenticated', {
                        ...context,
                        user: req.user,
                    });
                    res.status(401).json({
                        success: false,
                        message: 'User not authenticated',
                    });
                    return;
                }
                this._logger.info('Calling service to get user location', {
                    ...context,
                    userId,
                });
                const result = await this._userLocationService.getUserLocation(userId);
                if (!result.success) {
                    this._logger.warn('Get location service returned failure', {
                        ...context,
                        error: result.message,
                        serviceResult: result,
                    });
                    res.status(200).json({
                        success: false,
                        message: result.message || 'Location not found',
                        data: null,
                    });
                    return;
                }
                this._logger.info('User location retrieved successfully', {
                    ...context,
                    hasLocation: !!result.data,
                    locationData: result.data,
                });
                res.status(200).json({
                    success: true,
                    data: result.data,
                });
            }
            catch (error) {
                this._logger.error('Get location error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        // Delete user location
        this.deleteUserLocation = async (req, res) => {
            const userId = req.user?.id;
            const context = {
                operation: 'deleteUserLocation',
                userId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Deleting user location', context);
                if (!userId) {
                    this._logger.warn('Delete location failed - user not authenticated', context);
                    res.status(401).json({
                        success: false,
                        message: 'User not authenticated',
                    });
                    return;
                }
                const result = await this._userLocationService.deleteUserLocation(userId);
                if (!result.success) {
                    this._logger.warn('Delete location service returned failure', {
                        ...context,
                        error: result.message,
                    });
                    res.status(400).json(result);
                    return;
                }
                this._logger.info('User location deleted successfully', context);
                res.status(200).json({
                    success: true,
                    message: 'Location deleted successfully',
                });
            }
            catch (error) {
                this._logger.error('Delete location error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        // Find nearby technicians
        this.getNearbyTechnicians = async (req, res) => {
            const { lat, lng, radius = '10', serviceName } = req.query;
            const context = {
                operation: 'getNearbyTechnicians',
                latitude: lat,
                longitude: lng,
                radius,
                serviceName,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Finding nearby technicians', context);
                if (!lat || !lng) {
                    this._logger.warn('Nearby technicians failed - missing coordinates', context);
                    res.status(400).json({
                        success: false,
                        message: 'Latitude and longitude are required',
                    });
                    return;
                }
                const userCoordinates = [
                    parseFloat(lng),
                    parseFloat(lat),
                ];
                const radiusKm = parseInt(radius);
                this._logger.debug('Searching for technicians with parameters', {
                    ...context,
                    parsedCoordinates: userCoordinates,
                    parsedRadius: radiusKm,
                });
                const result = await this._userLocationService.findTechniciansNearby(userCoordinates, radiusKm, serviceName);
                if (!result.success) {
                    this._logger.warn('Nearby technicians service returned failure', {
                        ...context,
                        error: result.message,
                    });
                    res.status(400).json(result);
                    return;
                }
                this._logger.info('Nearby technicians found successfully', {
                    ...context,
                    technicianCount: result.count,
                });
                res.status(200).json({
                    success: true,
                    data: result.data,
                    count: result.count,
                });
            }
            catch (error) {
                this._logger.error('Nearby technicians error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                });
            }
        };
        this._userLocationService = userLocationService;
        this._logger = logger;
    }
}
exports.UserLocationController = UserLocationController;
