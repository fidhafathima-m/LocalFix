// services/ReviewService.ts
import { IReviewRepository } from "../interfaces/repository/user/IReviewRepository";
import { IReviewService, ReportReviewRequest } from "../interfaces/services/user/IReviewService";
import { ResponseHelper } from "../utils/responseHelper";
import { LoggerService } from "../services/LoggerService";
import {
  CreateReviewRequestDto,
  UpdateReviewRequestDto,
  ReviewResponseDto,
  ReviewListResponseDto,
  ReviewStatsResponseDto,
} from "../interfaces/dtos/reviewDtos";
import { ReviewMapper } from "../mappers/reviewMapper";
import { ApiResponse } from "../utils/responseHelper";

export class ReviewService implements IReviewService {
  private logger: LoggerService;

  constructor(private reviewRepository: IReviewRepository) {
    this.logger = new LoggerService();
  }

  async createReview(
    userId: string,
    reviewData: CreateReviewRequestDto
  ): Promise<ApiResponse<ReviewResponseDto>> {
    const context = {
      operation: "createReview",
      data: { userId, orderId: reviewData.orderId },
    };

    try {
      this.logger.info("Creating new review", context);

      // Validate rating
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        this.logger.warn("Invalid rating provided", {
          ...context,
          rating: reviewData.rating,
        });
        return ResponseHelper.badRequest("Rating must be between 1 and 5");
      }

      // Validate comment
      if (!reviewData.comment || reviewData.comment.trim().length === 0) {
        this.logger.warn("Empty comment provided", context);
        return ResponseHelper.badRequest("Comment is required");
      }

      // Check if user can review this order
      const canReview = await this.reviewRepository.canUserReviewOrder(
        userId,
        reviewData.orderId
      );

      if (!canReview) {
        this.logger.warn("User cannot review this order", context);
        return ResponseHelper.badRequest(
          "Cannot review this order. Order may not be completed, doesn't exist, or already has a review."
        );
      }

      // Get order details to extract technicianId
      const OrderModel = (await import("../models/OrderSchema")).default;
      const order = await OrderModel.findById(reviewData.orderId);

      if (!order) {
        this.logger.warn("Order not found for review", context);
        return ResponseHelper.notFound("Order not found");
      }

      const reviewModel = ReviewMapper.toCreateModel({
        ...reviewData,
        userId,
        technicianId: order.technicianId.toString(),
      });

      const newReview = await this.reviewRepository.create(reviewModel);

      this.logger.info("Review created successfully", {
        ...context,
        reviewId: newReview._id.toString(),
      });

      const reviewDto = ReviewMapper.toDto(newReview);
      return ResponseHelper.success("Review submitted successfully", reviewDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error creating review", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to submit review");
    }
  }

  async updateReview(
    userId: string,
    reviewId: string,
    reviewData: UpdateReviewRequestDto
  ): Promise<ApiResponse<ReviewResponseDto>> {
    const context = {
      operation: "updateReview",
      data: { userId, reviewId },
    };

    try {
      this.logger.info("Updating review", context);

      const existingReview = await this.reviewRepository.findById(reviewId);

      if (!existingReview) {
        this.logger.warn("Review not found for update", context);
        return ResponseHelper.notFound("Review not found");
      }

      // Check if user owns the review
      if (existingReview.userId.toString() !== userId) {
        this.logger.warn("User does not own this review", context);
        return ResponseHelper.forbidden("You can only update your own reviews");
      }

      // Validate rating if provided
      if (reviewData.rating && (reviewData.rating < 1 || reviewData.rating > 5)) {
        return ResponseHelper.badRequest("Rating must be between 1 and 5");
      }

      const updateModel = ReviewMapper.toUpdateModel(reviewData);
      const updatedReview = await this.reviewRepository.update(reviewId, updateModel);

      if (!updatedReview) {
        this.logger.error("Failed to update review in repository", context);
        return ResponseHelper.error("Failed to update review");
      }

      this.logger.info("Review updated successfully", context);

      const reviewDto = ReviewMapper.toDto(updatedReview);
      return ResponseHelper.success("Review updated successfully", reviewDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error updating review", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to update review");
    }
  }

  async deleteReview(
    userId: string,
    reviewId: string
  ): Promise<ApiResponse<ReviewResponseDto>> {
    const context = {
      operation: "deleteReview",
      data: { userId, reviewId },
    };

    try {
      this.logger.info("Deleting review", context);

      const existingReview = await this.reviewRepository.findById(reviewId);

      if (!existingReview) {
        this.logger.warn("Review not found for deletion", context);
        return ResponseHelper.notFound("Review not found");
      }

      // Check if user owns the review
      if (existingReview.userId.toString() !== userId) {
        this.logger.warn("User does not own this review", context);
        return ResponseHelper.forbidden("You can only delete your own reviews");
      }

      const deleted = await this.reviewRepository.delete(reviewId);

      if (!deleted) {
        this.logger.error("Failed to delete review from repository", context);
        return ResponseHelper.error("Failed to delete review");
      }

      this.logger.info("Review deleted successfully", context);

      const reviewDto = ReviewMapper.toDto(existingReview);
      return ResponseHelper.success("Review deleted successfully", reviewDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error deleting review", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to delete review");
    }
  }

  async getReviewById(reviewId: string): Promise<ApiResponse<ReviewResponseDto>> {
    const context = {
      operation: "getReviewById",
      data: { reviewId },
    };

    try {
      this.logger.info("Fetching review by ID", context);

      const review = await this.reviewRepository.findById(reviewId);

      if (!review) {
        this.logger.warn("Review not found", context);
        return ResponseHelper.notFound("Review not found");
      }

      this.logger.info("Review retrieved successfully", context);

      const reviewDto = ReviewMapper.toDto(review);
      return ResponseHelper.success("Review retrieved successfully", reviewDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching review by ID", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch review");
    }
  }

  async getUserReviews(userId: string): Promise<ApiResponse<ReviewListResponseDto>> {
    const context = {
      operation: "getUserReviews",
      data: { userId },
    };

    try {
      this.logger.info("Fetching user reviews", context);

      const reviews = await this.reviewRepository.findByUserId(userId);

      if (!reviews || reviews.length === 0) {
        this.logger.info("No reviews found for user", context);
        return ResponseHelper.success("No reviews found", {
          reviews: [],
          totalCount: 0,
          currentPage: 1,
          totalPages: 0,
        });
      }

      this.logger.info("User reviews retrieved successfully", {
        ...context,
        reviewCount: reviews.length,
      });

      const reviewDtos = ReviewMapper.toDtoList(reviews);
      return ResponseHelper.success("Reviews retrieved successfully", {
        reviews: reviewDtos,
        totalCount: reviewDtos.length,
        currentPage: 1,
        totalPages: 1,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching user reviews", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch reviews");
    }
  }

  async getTechnicianReviews(
    technicianId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<ApiResponse<ReviewListResponseDto>> {
    const context = {
      operation: "getTechnicianReviews",
      data: { technicianId, page, limit },
    };

    try {
      this.logger.info("Fetching technician reviews", context);

      const { reviews, totalCount } = await this.reviewRepository.findByTechnicianId(
        technicianId,
        page,
        limit
      );

      if (!reviews || reviews.length === 0) {
        this.logger.info("No reviews found for technician", context);
        return ResponseHelper.success("No reviews found", {
          reviews: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
        });
      }

      this.logger.info("Technician reviews retrieved successfully", {
        ...context,
        reviewCount: reviews.length,
        totalCount,
      });

      const reviewDtos = ReviewMapper.toDtoList(reviews);
      const totalPages = Math.ceil(totalCount / limit);

      return ResponseHelper.success("Reviews retrieved successfully", {
        reviews: reviewDtos,
        totalCount,
        currentPage: page,
        totalPages,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching technician reviews", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch reviews");
    }
  }

  async getOrderReview(orderId: string): Promise<ApiResponse<ReviewResponseDto> | null> {
    const context = {
      operation: "getOrderReview",
      data: { orderId },
    };

    try {
      this.logger.info("Fetching review for order", context);

      const review = await this.reviewRepository.findByOrderId(orderId);

      if (!review) {
        this.logger.info("No review found for order", context);
        return null;
      }

      this.logger.info("Order review retrieved successfully", context);

      const reviewDto = ReviewMapper.toDto(review);
      return ResponseHelper.success("Review retrieved successfully", reviewDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching order review", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch review");
    }
  }

  async getTechnicianReviewStats(
    technicianId: string
  ): Promise<ApiResponse<ReviewStatsResponseDto>> {
    const context = {
      operation: "getTechnicianReviewStats",
      data: { technicianId },
    };

    try {
      this.logger.info("Fetching technician review stats", context);

      const stats = await this.reviewRepository.getTechnicianStats(technicianId);

      this.logger.info("Technician review stats retrieved successfully", {
        ...context,
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
      });

      return ResponseHelper.success("Review stats retrieved successfully", stats);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching technician review stats", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch review stats");
    }
  }

  async canUserReviewOrder(userId: string, orderId: string): Promise<boolean> {
    return await this.reviewRepository.canUserReviewOrder(userId, orderId);
  }
   async reportReview(
  userId: string,
  reviewId: string,
  reportData: ReportReviewRequest
): Promise<ApiResponse<{ reportId: string }>> {
  const context = {
    operation: "reportReview",
    data: { userId, reviewId, reason: reportData.reason },
  };

  try {
    this.logger.info("Reporting review", context);

    // Check if review exists
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) {
      this.logger.warn("Review not found for reporting", context);
      return ResponseHelper.notFound("Review not found");
    }

    // Check if user is trying to report their own review
    if (review.userId.toString() === userId) {
      this.logger.warn("User cannot report their own review", context);
      return ResponseHelper.badRequest("You cannot report your own review");
    }

    // Validate reason
    if (!reportData.reason || reportData.reason.trim().length === 0) {
      this.logger.warn("Empty reason provided for report", context);
      return ResponseHelper.badRequest("Reason is required");
    }

    // Prepare report data
    const reportDataForRepo = {
      reason: reportData.reason,
      reportedBy: userId,
      additionalInfo: reportData.additionalInfo,
      reportedAt: new Date(),
    };

    // Save the report
    const result = await this.reviewRepository.reportReview(reviewId, reportDataForRepo);

    this.logger.info("Review reported successfully", {
      ...context,
      reportId: result.reportId,
    });

    return ResponseHelper.success("Review reported successfully. Our team will review it shortly.", {
      reportId: result.reportId,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    this.logger.error("Error reporting review", {
      ...context,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Check if it's an "already reported" error and return appropriate response
    if (errorMessage.includes("already reported")) {
      return ResponseHelper.badRequest("You have already reported this review");
    }
    
    return ResponseHelper.error("Failed to report review");
  }
}
}