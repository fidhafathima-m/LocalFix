"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class UserManagementController {
    constructor(userManagementService, logger) {
        this.getUsers = async (req, res) => {
            const context = {
                operation: 'getUsers',
                timestamp: new Date().toISOString(),
            };
            try {
                const search = req.query.search;
                const status = req.query.status;
                this._logger.info('Fetching users with filters', {
                    ...context,
                    search,
                    status,
                });
                const result = await this._userManagementService.getUsers(search, status);
                this._logger.info('Users retrieved successfully', {
                    ...context,
                    count: result?.users?.length || 0,
                    hasSearch: !!search,
                    hasStatusFilter: !!status,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get users controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.updateUserStatus = async (req, res) => {
            const { userId } = req.params;
            const statusData = req.body;
            const context = {
                operation: 'updateUserStatus',
                targetUserId: userId,
                newStatus: statusData.status,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating user status', context);
                if (!statusData.status) {
                    this._logger.warn('User status update failed - status required', context);
                    const badRequestResponse = responseHelper_1.ResponseHelper.badRequest('Status is required');
                    res.status(badRequestResponse.statusCode).json(badRequestResponse);
                    return;
                }
                const result = await this._userManagementService.updateUserStatus(userId, statusData);
                this._logger.info('User status updated successfully', {
                    ...context,
                    userEmail: result?.user?.email,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Update user status controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.editUser = async (req, res) => {
            const { userId } = req.params;
            const userData = req.body;
            const context = {
                operation: 'editUser',
                targetUserId: userId,
                updateFields: Object.keys(userData),
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Editing user profile', context);
                if (Object.keys(userData).length === 0) {
                    this._logger.warn('User edit failed - no fields to update', context);
                    const badRequestResponse = responseHelper_1.ResponseHelper.badRequest('No fields to update');
                    res.status(badRequestResponse.statusCode).json(badRequestResponse);
                    return;
                }
                const result = await this._userManagementService.editUser(userId, userData);
                this._logger.info('User edited successfully', {
                    ...context,
                    userEmail: result?.user?.email,
                    updatedFieldCount: Object.keys(userData).length,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Edit user controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.deleteUser = async (req, res) => {
            const { userId } = req.params;
            const context = {
                operation: 'deleteUser',
                targetUserId: userId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Deleting user', context);
                const result = await this._userManagementService.deleteUser(userId);
                this._logger.info('User deleted successfully', {
                    ...context,
                    userEmail: result?.user?.email,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Delete user controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getUserStats = async (req, res) => {
            const context = {
                operation: 'getUserStats',
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching user statistics', context);
                const result = await this._userManagementService.getUserStats();
                this._logger.info('User statistics retrieved successfully', {
                    ...context,
                    stats: result,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get user stats controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getUserById = async (req, res) => {
            const { userId } = req.params;
            const context = {
                operation: 'getUserById',
                targetUserId: userId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching user by ID', context);
                const result = await this._userManagementService.getUserById(userId);
                this._logger.info('User retrieved successfully', {
                    ...context,
                    userEmail: result?.user?.email,
                    userRole: result?.user?.roles?.[0],
                    status: result.user?.status,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get user by ID controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this._userManagementService = userManagementService;
        this._logger = logger;
    }
}
exports.UserManagementController = UserManagementController;
