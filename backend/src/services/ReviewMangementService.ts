import { IReviewRepository } from "@/interfaces/repository/admin/IReviewRepository";
import {
  GetReviewsFilter,
  IAdminReviewService,
  ReviewListResponse,
  ReviewResponseDto,
  ReviewStatsResponse,
} from "@/interfaces/services/admin/IReviewManagementService";
import { REVIEW_MESSAGES } from "../constants";
import { ILogger } from "@/interfaces/utils/ILogger";
import { toAdminReviewResponseDto } from "@/mappers/reviewManagementMapper";

export class ReviewManagementService implements IAdminReviewService {
  private _reviewRepository: IReviewRepository;
  private _logger: ILogger;

  constructor(reviewRepository: IReviewRepository, logger: ILogger) {
    this._reviewRepository = reviewRepository;
    this._logger = logger;
  }

  async getAllReviews(filters: GetReviewsFilter): Promise<ReviewListResponse> {
    const context = {
      operation: "getAllReviews",
      data: filters,
    };

    try {
      this._logger.info("Fetching all reviews with filters", context);

      const { reviews, total } =
        await this._reviewRepository.findAllWithDetails(filters);

      const totalPages = Math.ceil(total / (filters.limit || 10));

      this._logger.info("Reviews retrieved successfully", {
        ...context,
        totalReviews: total,
        returnedReviews: reviews.length,
      });

      return {
        reviews: reviews.map((review) => toAdminReviewResponseDto(review)),
        total,
        page: filters.page || 1,
        totalPages,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this._logger.error("Get all reviews operation failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async getReviewById(reviewId: string): Promise<ReviewResponseDto> {
    const context = {
      operation: "getReviewById",
      data: { reviewId },
    };

    try {
      this._logger.info("Fetching review by ID", context);

      const review = await this._reviewRepository.findByIdWithDetails(reviewId);

      if (!review) {
        this._logger.warn("Review not found by ID", context);
        throw new Error(REVIEW_MESSAGES.REVIEW_NOT_FOUND);
      }

      this._logger.info("Review retrieved successfully", {
        ...context,
        reviewId: review._id?.toString(),
      });

      return toAdminReviewResponseDto(review);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this._logger.error("Get review by ID operation failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async updateReviewStatus(
    reviewId: string,
    status: string
  ): Promise<ReviewResponseDto> {
    const context = {
      operation: "updateReviewStatus",
      data: { reviewId, status },
    };

    try {
      this._logger.info("Updating review status", context);

      const review = await this._reviewRepository.findById(reviewId);

      if (!review) {
        this._logger.warn("Review not found for status update", context);
        throw new Error(REVIEW_MESSAGES.REVIEW_NOT_FOUND);
      }

      const updatedReview = await this._reviewRepository.updateStatus(
        reviewId,
        status
      );

      if (!updatedReview) {
        this._logger.error("Review repository update returned null", context);
        throw new Error(REVIEW_MESSAGES.FAILED_UPDATE_REVIEW);
      }

      const reviewWithDetails =
        await this._reviewRepository.findByIdWithDetails(reviewId);

      this._logger.info("Review status updated successfully", {
        ...context,
        reviewId: updatedReview._id?.toString(),
      });

      return toAdminReviewResponseDto(reviewWithDetails!);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this._logger.error("Update review status operation failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async flagReview(
    reviewId: string,
    reason?: string
  ): Promise<ReviewResponseDto> {
    const context = {
      operation: "flagReview",
      data: { reviewId, reason },
    };

    try {
      this._logger.info("Flagging review", context);

      const review = await this._reviewRepository.findById(reviewId);

      if (!review) {
        this._logger.warn("Review not found for flagging", context);
        throw new Error(REVIEW_MESSAGES.REVIEW_NOT_FOUND);
      }

      const updatedReview = await this._reviewRepository.flagReview(
        reviewId,
        reason
      );

      if (!updatedReview) {
        this._logger.error("Review repository flag returned null", context);
        throw new Error(REVIEW_MESSAGES.FAILED_FLAG_REVIEW);
      }

      const reviewWithDetails =
        await this._reviewRepository.findByIdWithDetails(reviewId);

      this._logger.info("Review flagged successfully", {
        ...context,
        reviewId: updatedReview._id?.toString(),
      });

      return toAdminReviewResponseDto(reviewWithDetails!);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this._logger.error("Flag review operation failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async deleteReview(reviewId: string): Promise<void> {
    const context = {
      operation: "deleteReview",
      data: { reviewId },
    };

    try {
      this._logger.info("Deleting review", context);

      const review = await this._reviewRepository.findById(reviewId);

      if (!review) {
        this._logger.warn("Review not found for deletion", context);
        throw new Error(REVIEW_MESSAGES.REVIEW_NOT_FOUND);
      }

      const deleted = await this._reviewRepository.delete(reviewId);

      if (!deleted) {
        this._logger.error(
          "Review repository deletion returned false",
          context
        );
        throw new Error(REVIEW_MESSAGES.FAILED_DELETE_REVIEW);
      }

      this._logger.info("Review deleted successfully", context);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this._logger.error("Delete review operation failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async getReviewStats(): Promise<ReviewStatsResponse> {
    const context = {
      operation: "getReviewStats",
    };

    try {
      this._logger.info("Fetching review statistics", context);

      const stats = await this._reviewRepository.getReviewStats();

      this._logger.info("Review statistics retrieved successfully", {
        ...context,
        totalReviews: stats.totalReviews,
      });

      return stats;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this._logger.error("Get review stats operation failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
