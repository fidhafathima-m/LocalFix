import { Response } from 'express';
import {
  IReviewService,
  ReportReviewRequest,
} from '../../interfaces/services/user/IReviewService';
import { ResponseHelper } from '../../utils/responseHelper';
import { GeneralMessages } from '../../constants';
import {
  CreateReviewRequestDto,
  UpdateReviewRequestDto,
} from '../../interfaces/dtos/reviewDtos';
import { AuthRequest } from '../../types/express';

import { IReviewRepository } from '../../interfaces/repository/user/IReviewRepository';
import { ILogger } from '@/interfaces/utils/ILogger';
import { toReviewDto } from '../../mappers/reviewMapper';

export class ReviewController {
  private _reviewService: IReviewService;
  private _reviewRepository: IReviewRepository;
  private _logger: ILogger;

  constructor(
    reviewService: IReviewService,
    reviewRepository: IReviewRepository,
    logger: ILogger
  ) {
    this._reviewService = reviewService;
    this._reviewRepository = reviewRepository;
    this._logger = logger;
  }

  createReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const reviewData: CreateReviewRequestDto = req.body;

    const context = {
      operation: 'createReview',
      userId,
      orderId: reviewData?.orderId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Creating new review', context);

      if (!userId) {
        this._logger.warn(
          'Create review failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this._reviewService.createReview(userId, reviewData);

      this._logger.info('Review created successfully', {
        ...context,
        reviewId: result.data?.id,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Create review controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { reviewId } = req.params;
    const reviewData: UpdateReviewRequestDto = req.body;

    const context = {
      operation: 'updateReview',
      userId,
      reviewId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Updating review', context);

      if (!userId) {
        this._logger.warn(
          'Update review failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this._reviewService.updateReview(
        userId,
        reviewId,
        reviewData
      );

      this._logger.info('Review updated successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Update review controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { reviewId } = req.params;

    const context = {
      operation: 'deleteReview',
      userId,
      reviewId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Deleting review', context);

      if (!userId) {
        this._logger.warn(
          'Delete review failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this._reviewService.deleteReview(userId, reviewId);

      this._logger.info('Review deleted successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Delete review controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getReviewById = async (req: AuthRequest, res: Response): Promise<void> => {
    const { reviewId } = req.params;

    const context = {
      operation: 'getReviewById',
      reviewId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching review by ID', context);

      const result = await this._reviewService.getReviewById(reviewId);

      this._logger.info('Review retrieved successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get review by ID controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getUserReviews = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    const context = {
      operation: 'getUserReviews',
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching user reviews', context);

      if (!userId) {
        this._logger.warn(
          'Get user reviews failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this._reviewService.getUserReviews(userId);

      this._logger.info('User reviews retrieved successfully', {
        ...context,
        reviewCount: result.data?.reviews?.length || 0,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get user reviews controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianReviews = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { technicianId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const context = {
      operation: 'getTechnicianReviews',
      technicianId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technician reviews', context);

      const result = await this._reviewService.getTechnicianReviews(
        technicianId,
        page,
        limit
      );

      this._logger.info('Technician reviews retrieved successfully', {
        ...context,
        reviewCount: result.data?.reviews?.length || 0,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get technician reviews controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getOrderReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const { orderId } = req.params;

    const context = {
      operation: 'getOrderReview',
      orderId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching review for order', context);

      const review = await this._reviewRepository.findByOrderId(orderId);

      if (!review) {
        this._logger.info('No review found for order', context);
        const response = ResponseHelper.success(
          'No review found for this order',
          null
        );
        res.status(response.statusCode).json(response);
        return;
      }

      this._logger.info('Order review retrieved successfully', context);

      const reviewDto = toReviewDto(review);
      const response = ResponseHelper.success(
        'Review retrieved successfully',
        reviewDto
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      this._logger.error('Get order review controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });
      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianReviewStats = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { technicianId } = req.params;

    const context = {
      operation: 'getTechnicianReviewStats',
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technician review stats', context);

      const result =
        await this._reviewService.getTechnicianReviewStats(technicianId);

      this._logger.info(
        'Technician review stats retrieved successfully',
        context
      );

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get technician review stats controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  canUserReviewOrder = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const { orderId } = req.params;

    const context = {
      operation: 'canUserReviewOrder',
      userId,
      orderId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Checking if user can review order', context);

      if (!userId) {
        this._logger.warn(
          'Check review permission failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const canReview = await this._reviewService.canUserReviewOrder(
        userId,
        orderId
      );

      const response = ResponseHelper.success(
        'Review permission checked successfully',
        {
          canReview,
        }
      );

      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      this._logger.error('Check review permission controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
  reportReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { reviewId } = req.params;
    const reportData: ReportReviewRequest = req.body;

    const context = {
      operation: 'reportReview',
      userId,
      reviewId,
      reason: reportData.reason,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Reporting review', context);

      if (!userId) {
        this._logger.warn(
          'Report review failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      // Validate required fields
      if (!reportData.reason || reportData.reason.trim().length === 0) {
        this._logger.warn('Report review failed - reason required', context);
        const errorResponse = ResponseHelper.badRequest('Reason is required');
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this._reviewService.reportReview(
        userId,
        reviewId,
        reportData
      );

      this._logger.info('Review reported successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Report review controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
