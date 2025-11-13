import { Response } from "express";
import {
  IReviewService,
  ReportReviewRequest,
} from "../../interfaces/services/user/IReviewService";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";
import {
  CreateReviewRequestDto,
  UpdateReviewRequestDto,
} from "../../interfaces/dtos/reviewDtos";
import { AuthRequest } from "@/middleware/authMiddleware";
import { ReviewMapper } from "../../mappers/reviewMapper";
import { IReviewRepository } from "../../interfaces/repository/user/IReviewRepository";
import { ILogger } from "@/interfaces/utils/ILogger";

export class ReviewController {
  private reviewService: IReviewService;
  private reviewRepository: IReviewRepository;
  private logger: ILogger;

  constructor(
    reviewService: IReviewService,
    reviewRepository: IReviewRepository,
    logger: ILogger
  ) {
    this.reviewService = reviewService;
    this.reviewRepository = reviewRepository;
    this.logger = logger;
  }

  createReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const reviewData: CreateReviewRequestDto = req.body;

    const context = {
      operation: "createReview",
      userId,
      orderId: reviewData?.orderId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Creating new review", context);

      if (!userId) {
        this.logger.warn(
          "Create review failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this.reviewService.createReview(userId, reviewData);

      this.logger.info("Review created successfully", {
        ...context,
        reviewId: result.data?.id,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Create review controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { reviewId } = req.params;
    const reviewData: UpdateReviewRequestDto = req.body;

    const context = {
      operation: "updateReview",
      userId,
      reviewId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating review", context);

      if (!userId) {
        this.logger.warn(
          "Update review failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this.reviewService.updateReview(
        userId,
        reviewId,
        reviewData
      );

      this.logger.info("Review updated successfully", context);

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Update review controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { reviewId } = req.params;

    const context = {
      operation: "deleteReview",
      userId,
      reviewId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Deleting review", context);

      if (!userId) {
        this.logger.warn(
          "Delete review failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this.reviewService.deleteReview(userId, reviewId);

      this.logger.info("Review deleted successfully", context);

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Delete review controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getReviewById = async (req: AuthRequest, res: Response): Promise<void> => {
    const { reviewId } = req.params;

    const context = {
      operation: "getReviewById",
      reviewId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching review by ID", context);

      const result = await this.reviewService.getReviewById(reviewId);

      this.logger.info("Review retrieved successfully", context);

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get review by ID controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getUserReviews = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;

    const context = {
      operation: "getUserReviews",
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching user reviews", context);

      if (!userId) {
        this.logger.warn(
          "Get user reviews failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this.reviewService.getUserReviews(userId);

      this.logger.info("User reviews retrieved successfully", {
        ...context,
        reviewCount: result.data?.reviews?.length || 0,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get user reviews controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
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
      operation: "getTechnicianReviews",
      technicianId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching technician reviews", context);

      const result = await this.reviewService.getTechnicianReviews(
        technicianId,
        page,
        limit
      );

      this.logger.info("Technician reviews retrieved successfully", {
        ...context,
        reviewCount: result.data?.reviews?.length || 0,
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get technician reviews controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getOrderReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const { orderId } = req.params;

    const context = {
      operation: "getOrderReview",
      orderId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching review for order", context);

      const review = await this.reviewRepository.findByOrderId(orderId);

      if (!review) {
        this.logger.info("No review found for order", context);
        const response = ResponseHelper.success(
          "No review found for this order",
          null
        );
        res.status(response.statusCode).json(response);
        return;
      }

      this.logger.info("Order review retrieved successfully", context);

      const reviewDto = ReviewMapper.toDto(review);
      const response = ResponseHelper.success(
        "Review retrieved successfully",
        reviewDto
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      this.logger.error("Get order review controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianReviewStats = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const { technicianId } = req.params;

    const context = {
      operation: "getTechnicianReviewStats",
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching technician review stats", context);

      const result = await this.reviewService.getTechnicianReviewStats(
        technicianId
      );

      this.logger.info(
        "Technician review stats retrieved successfully",
        context
      );

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Get technician review stats controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
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
      operation: "canUserReviewOrder",
      userId,
      orderId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Checking if user can review order", context);

      if (!userId) {
        this.logger.warn(
          "Check review permission failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const canReview = await this.reviewService.canUserReviewOrder(
        userId,
        orderId
      );

      const response = ResponseHelper.success(
        "Review permission checked successfully",
        {
          canReview,
        }
      );

      res.status(response.statusCode).json(response);
    } catch (error: any) {
      this.logger.error("Check review permission controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
  reportReview = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { reviewId } = req.params;
    const reportData: ReportReviewRequest = req.body;

    const context = {
      operation: "reportReview",
      userId,
      reviewId,
      reason: reportData.reason,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Reporting review", context);

      if (!userId) {
        this.logger.warn(
          "Report review failed - authentication required",
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          "Authentication required"
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      // Validate required fields
      if (!reportData.reason || reportData.reason.trim().length === 0) {
        this.logger.warn("Report review failed - reason required", context);
        const errorResponse = ResponseHelper.badRequest("Reason is required");
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result = await this.reviewService.reportReview(
        userId,
        reviewId,
        reportData
      );

      this.logger.info("Review reported successfully", context);

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error("Report review controller error", {
        ...context,
        error: error.message,
        stack: error.stack,
      });

      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
