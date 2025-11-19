import { Response } from 'express';
import { UserManagementService } from '../../services/UserManagementService';
import { ResponseHelper } from '../../utils/responseHelper';
import { ILogger } from '@/interfaces/utils/ILogger';
import { AuthRequest } from '../../middleware/authMiddleware';

export class PublicUserManagementController {
  private _userService: UserManagementService;
  private _logger: ILogger;

  constructor(userService: UserManagementService, logger: ILogger) {
    this._userService = userService;
    this._logger = logger;
  }

  getUserProfile = async (req: AuthRequest, res: Response) => {
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
        const response = ResponseHelper.unauthorized('User not authenticated');
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch user profile';
      this._logger.error('Get user profile error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error('Failed to fetch user profile');
      return res.status(500).json(response);
    }
  };

  getPublicUserById = async (req: AuthRequest, res: Response) => {
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
        const response = ResponseHelper.badRequest('User ID is required');
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
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch user';
      this._logger.error('Get public user error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error('Failed to fetch user');
      return res.status(500).json(response);
    }
  };
}
