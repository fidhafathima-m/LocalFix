import { ResponseHelper } from '../../utils/responseHelper';
import { REVIEW_MESSAGES } from '../../constants';
import { IAdminReviewService } from '@/interfaces/services/admin/IReviewManagementService';
import { ILogger } from '@/interfaces/utils/ILogger';
import { AuthRequest } from '../../middleware/authMiddleware';
import { Response } from 'express';

export class ReviewManagementController {
  private _reviewService: IAdminReviewService;
  private _logger: ILogger;

  constructor(reviewService: IAdminReviewService, logger: ILogger) {
    this._reviewService = reviewService;
    this._logger = logger;
  }

  getAllReviews = async (req: AuthRequest, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const rating = req.query.rating as string;
    const status = req.query.status as string;
    const service = req.query.service as string;

    const context = {
      operation: 'getAllReviews',
      page,
      limit,
      search,
      rating,
      status,
      service,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching all reviews for admin', context);

      const result = await this._reviewService.getAllReviews({
        page,
        limit,
        search,
        rating: rating ? parseInt(rating) : undefined,
        status: status as 'published' | 'flagged' | 'pending',
        service,
      });

      this._logger.info('Reviews retrieved successfully', {
        ...context,
        totalReviews: result.total,
      });

      const response = ResponseHelper.success(
        REVIEW_MESSAGES.REVIEWS_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : REVIEW_MESSAGES.FAILED_FETCH_REVIEWS;
      this._logger.error('Get all reviews controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getReviewById = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'getReviewById',
      reviewId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching review by ID', context);

      const review = await this._reviewService.getReviewById(id);

      this._logger.info('Review retrieved successfully', {
        ...context,
        reviewId: review.id,
      });

      const response = ResponseHelper.success(
        REVIEW_MESSAGES.REVIEW_RETRIEVED,
        { review }
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : REVIEW_MESSAGES.REVIEW_NOT_FOUND;
      this._logger.error('Get review by ID controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  updateReviewStatus = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;

    const context = {
      operation: 'updateReviewStatus',
      reviewId: id,
      status,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Updating review status', context);

      if (!status || !['published', 'flagged', 'pending'].includes(status)) {
        this._logger.warn('Invalid status provided', context);
        const response = ResponseHelper.badRequest('Invalid status');
        res.status(response.statusCode).json(response);
        return;
      }

      const review = await this._reviewService.updateReviewStatus(id, status);

      this._logger.info('Review status updated successfully', {
        ...context,
        reviewId: review.id,
      });

      const response = ResponseHelper.success(REVIEW_MESSAGES.REVIEW_UPDATED, {
        review,
      });
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : REVIEW_MESSAGES.FAILED_UPDATE_REVIEW;
      this._logger.error('Update review status controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  flagReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const { reason } = req.body;

    const context = {
      operation: 'flagReview',
      reviewId: id,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Flagging review', context);

      const review = await this._reviewService.flagReview(id, reason);

      this._logger.info('Review flagged successfully', {
        ...context,
        reviewId: review.id,
      });

      const response = ResponseHelper.success(REVIEW_MESSAGES.REVIEW_FLAGGED, {
        review,
      });
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : REVIEW_MESSAGES.FAILED_FLAG_REVIEW;
      this._logger.error('Flag review controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'deleteReview',
      reviewId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Deleting review', context);

      await this._reviewService.deleteReview(id);

      this._logger.info('Review deleted successfully', context);

      const response = ResponseHelper.success(REVIEW_MESSAGES.REVIEW_DELETED);
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : REVIEW_MESSAGES.FAILED_DELETE_REVIEW;
      this._logger.error('Delete review controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getReviewStats = async (req: AuthRequest, res: Response): Promise<void> => {
    const context = {
      operation: 'getReviewStats',
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching review statistics', context);

      const stats = await this._reviewService.getReviewStats();

      this._logger.info('Review statistics retrieved successfully', context);

      const response = ResponseHelper.success(
        'Review statistics retrieved',
        stats
      );
      res.status(response.statusCode).json(response);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch review statistics';
      this._logger.error('Get review stats controller error', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };
}
