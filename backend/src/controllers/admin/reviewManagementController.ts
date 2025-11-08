// controllers/adminReviewController.ts
import { Request, Response } from "express";
import { ResponseHelper } from "../../utils/responseHelper";
import { REVIEW_MESSAGES } from "../../constants";
import { LoggerService } from "../../services/LoggerService";
import { IAdminReviewService } from "@/interfaces/services/admin/IReviewManagementService";

export class ReviewManagementController {
  private reviewService: IAdminReviewService;
  private logger: LoggerService;

  constructor(reviewService: IAdminReviewService) {
    this.reviewService = reviewService;
    this.logger = new LoggerService();
  }

  getAllReviews = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const rating = req.query.rating as string;
    const status = req.query.status as string;
    const service = req.query.service as string;

    const context = {
      operation: "getAllReviews",
      page,
      limit,
      search,
      rating,
      status,
      service,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching all reviews for admin", context);

      const result = await this.reviewService.getAllReviews({
        page,
        limit,
        search,
        rating: rating ? parseInt(rating) : undefined,
        status: status as any,
        service,
      });

      this.logger.info("Reviews retrieved successfully", {
        ...context,
        totalReviews: result.total,
      });

      const response = ResponseHelper.success(
        REVIEW_MESSAGES.REVIEWS_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage =
        error.message || REVIEW_MESSAGES.FAILED_FETCH_REVIEWS;
      this.logger.error("Get all reviews controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getReviewById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: "getReviewById",
      reviewId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching review by ID", context);

      const review = await this.reviewService.getReviewById(id);

      this.logger.info("Review retrieved successfully", {
        ...context,
        reviewId: review.id,
      });

      const response = ResponseHelper.success(
        REVIEW_MESSAGES.REVIEW_RETRIEVED,
        { review }
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage =
        error.message || REVIEW_MESSAGES.REVIEW_NOT_FOUND;
      this.logger.error("Get review by ID controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  updateReviewStatus = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { status } = req.body;

    const context = {
      operation: "updateReviewStatus",
      reviewId: id,
      status,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating review status", context);

      if (!status || !["published", "flagged", "pending"].includes(status)) {
        this.logger.warn("Invalid status provided", context);
        const response = ResponseHelper.badRequest("Invalid status");
        res.status(response.statusCode).json(response);
        return;
      }

      const review = await this.reviewService.updateReviewStatus(id, status);

      this.logger.info("Review status updated successfully", {
        ...context,
        reviewId: review.id,
      });

      const response = ResponseHelper.success(
        REVIEW_MESSAGES.REVIEW_UPDATED,
        { review }
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage =
        error.message || REVIEW_MESSAGES.FAILED_UPDATE_REVIEW;
      this.logger.error("Update review status controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  flagReview = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { reason } = req.body;

    const context = {
      operation: "flagReview",
      reviewId: id,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Flagging review", context);

      const review = await this.reviewService.flagReview(id, reason);

      this.logger.info("Review flagged successfully", {
        ...context,
        reviewId: review.id,
      });

      const response = ResponseHelper.success(
        REVIEW_MESSAGES.REVIEW_FLAGGED,
        { review }
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage =
        error.message || REVIEW_MESSAGES.FAILED_FLAG_REVIEW;
      this.logger.error("Flag review controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  deleteReview = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: "deleteReview",
      reviewId: id,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Deleting review", context);

      await this.reviewService.deleteReview(id);

      this.logger.info("Review deleted successfully", context);

      const response = ResponseHelper.success(
        REVIEW_MESSAGES.REVIEW_DELETED
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage =
        error.message || REVIEW_MESSAGES.FAILED_DELETE_REVIEW;
      this.logger.error("Delete review controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getReviewStats = async (req: Request, res: Response): Promise<void> => {
    const context = {
      operation: "getReviewStats",
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching review statistics", context);

      const stats = await this.reviewService.getReviewStats();

      this.logger.info("Review statistics retrieved successfully", context);

      const response = ResponseHelper.success(
        "Review statistics retrieved",
        stats
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to fetch review statistics";
      this.logger.error("Get review stats controller error", {
        ...context,
        error: errorMessage,
        stack: error.stack,
      });

      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };
}