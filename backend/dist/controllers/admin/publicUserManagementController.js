"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicUserManagementController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
class PublicUserManagementController {
    constructor(userService, logger) {
        this.getUserProfile = async (req, res) => {
            const userId = req.user?.id;
            const context = {
                operation: 'getUserProfile',
                userId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching authenticated user profile', context);
                if (!userId) {
                    this._logger.warn('User not authenticated for profile fetch', context);
                    const response = responseHelper_1.ResponseHelper.unauthorized('User not authenticated');
                    return res.status(response.statusCode || 401).json(response);
                }
                const result = await this._userService.getPublicUserById(userId);
                if (!result.success) {
                    this._logger.warn('Failed to fetch user profile', {
                        ...context,
                        error: result.message,
                        statusCode: result.statusCode,
                    });
                    return res.status(result.statusCode || 404).json(result);
                }
                this._logger.info('User profile retrieved successfully', {
                    ...context,
                    userEmail: result.user?.email,
                    hasProfilePicture: !!result.user?.profilePicture,
                });
                return res.status(200).json(result);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user profile';
                this._logger.error('Get user profile error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to fetch user profile');
                return res.status(500).json(response);
            }
        };
        this.getPublicUserById = async (req, res) => {
            const { userId } = req.params;
            const context = {
                operation: 'getPublicUserById',
                AuthRequestedUserId: userId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching public user by ID', context);
                if (!userId) {
                    this._logger.warn('User ID parameter missing', context);
                    const response = responseHelper_1.ResponseHelper.badRequest('User ID is required');
                    return res.status(response.statusCode || 400).json(response);
                }
                const result = await this._userService.getPublicUserById(userId);
                if (!result.success) {
                    this._logger.warn('Failed to fetch public user', {
                        ...context,
                        error: result.message,
                        statusCode: result.statusCode,
                    });
                    return res.status(result.statusCode || 404).json(result);
                }
                this._logger.info('Public user retrieved successfully', {
                    ...context,
                    userEmail: result.user?.email,
                    userRole: result.user?.roles,
                    isPublicProfile: true,
                });
                return res.status(200).json(result);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user';
                this._logger.error('Get public user error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to fetch user');
                return res.status(500).json(response);
            }
        };
        this._userService = userService;
        this._logger = logger;
    }
}
exports.PublicUserManagementController = PublicUserManagementController;
