import { IReviewRepository } from '../interfaces/repository/user/IReviewRepository';
import {
  IReviewService,
  ReportReviewRequest,
} from '../interfaces/services/user/IReviewService';
import { ResponseHelper } from '../utils/responseHelper';
import {
  CreateReviewRequestDto,
  UpdateReviewRequestDto,
  ReviewResponseDto,
  ReviewListResponseDto,
  ReviewStatsResponseDto,
} from '../interfaces/dtos/reviewDtos';
import { ApiResponse } from '../utils/responseHelper';
import { INotificationService } from '../interfaces/services/INotificationService';
import { ILogger } from '@/interfaces/utils/ILogger';
import {
  toReviewCreateModel,
  toReviewDto,
  toReviewDtoList,
  toReviewUpdateModel,
} from '../mappers/reviewMapper';
import { SocketService } from './SocketService';

export class ReviewService implements IReviewService {
  private _logger: ILogger;
  private _reviewRepository: IReviewRepository;
  private _socketService: SocketService;

  constructor(
    reviewRepository: IReviewRepository,
    logger: ILogger,
    socketService: SocketService
  ) {
    this._logger = logger;
    this._reviewRepository = reviewRepository;
    this._socketService = socketService;
  }

  async createReview(
    userId: string,
    reviewData: CreateReviewRequestDto
  ): Promise<ApiResponse<ReviewResponseDto>> {
    const context = {
      operation: 'createReview',
      data: { userId, orderId: reviewData.orderId },
    };

    try {
      this._logger.info('Creating new review', context);

      // Validate rating
      if (reviewData.rating < 1 || reviewData.rating > 5) {
        this._logger.warn('Invalid rating provided', {
          ...context,
          rating: reviewData.rating,
        });
        return ResponseHelper.badRequest('Rating must be between 1 and 5');
      }

      // Validate comment
      if (!reviewData.comment || reviewData.comment.trim().length === 0) {
        this._logger.warn('Empty comment provided', context);
        return ResponseHelper.badRequest('Comment is required');
      }

      // Check if user can review this order
      const canReview = await this._reviewRepository.canUserReviewOrder(
        userId,
        reviewData.orderId
      );

      if (!canReview) {
        this._logger.warn('User cannot review this order', context);
        return ResponseHelper.badRequest(
          "Cannot review this order. Order may not be completed, doesn't exist, or already has a review."
        );
      }

      // Get order details to extract technicianId
      const OrderModel = (await import('../models/OrderSchema')).default;
      const order = await OrderModel.findById(reviewData.orderId);

      if (!order) {
        this._logger.warn('Order not found for review', context);
        return ResponseHelper.notFound('Order not found');
      }

      const reviewModel = toReviewCreateModel({
        ...reviewData,
        userId,
        technicianId: order.technicianId.toString(),
      });

      const newReview = await this._reviewRepository.create(reviewModel);

      this._logger.info('Review created successfully', {
        ...context,
        reviewId: newReview._id.toString(),
      });

      // NOTIFICATION: Notify technician about new review
      await this.notifyTechnicianAboutNewReview(newReview, order);

      // NOTIFICATION: Notify user that review was submitted successfully
      // await this.notifyUserAboutReviewSubmission(userId, order.serviceName);

      await this._socketService.sendLiveNotification(userId, {
        userId,
        userType: 'customer',
        type: 'review_created',
        title: 'Review Submitted! ✅',
        message: `Your review for ${order.serviceName} has been submitted successfully.`,
        priority: 'medium',
        data: {
          reviewId: newReview._id.toString(),
          serviceName: order.serviceName,
        },
      });

      const reviewDto = toReviewDto(newReview);
      return ResponseHelper.success('Review submitted successfully', reviewDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error creating review', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to submit review');
    }
  }

  async updateReview(
    userId: string,
    reviewId: string,
    reviewData: UpdateReviewRequestDto
  ): Promise<ApiResponse<ReviewResponseDto>> {
    const context = {
      operation: 'updateReview',
      data: { userId, reviewId },
    };

    try {
      this._logger.info('Updating review', context);

      const existingReview = await this._reviewRepository.findById(reviewId);

      if (!existingReview) {
        this._logger.warn('Review not found for update', context);
        return ResponseHelper.notFound('Review not found');
      }

      // FIX: Simple and safe user ID extraction
      let reviewUserId: string;

      // Check if userId is a populated object (has _id property)
      if (existingReview.userId && typeof existingReview.userId === 'object') {
        const userObj = existingReview.userId as any;
        // Check if it has _id property (populated user)
        if (userObj._id) {
          reviewUserId = userObj._id.toString();
        } else {
          // It's a plain object without _id, try to convert to string
          reviewUserId = String(existingReview.userId);
        }
      } else {
        // It's not an object, convert directly to string
        reviewUserId = String(existingReview.userId);
      }

      this._logger.debug('Ids: ', {
        reviewUserId: reviewUserId,
        userId: userId,
        areEqual: reviewUserId === userId,
      });

      // Check if user owns the review
      if (reviewUserId !== userId) {
        this._logger.warn('User does not own this review', {
          ...context,
          reviewUserId,
          userId,
        });
        return ResponseHelper.forbidden('You can only update your own reviews');
      }

      // Validate rating if provided
      if (
        reviewData.rating &&
        (reviewData.rating < 1 || reviewData.rating > 5)
      ) {
        return ResponseHelper.badRequest('Rating must be between 1 and 5');
      }

      const updateModel = toReviewUpdateModel(reviewData);
      const updatedReview = await this._reviewRepository.update(
        reviewId,
        updateModel
      );

      if (!updatedReview) {
        this._logger.error('Failed to update review in repository', context);
        return ResponseHelper.error('Failed to update review');
      }

      this._logger.info('Review updated successfully', context);

      // NOTIFICATION: Notify technician if rating changed
      if (reviewData.rating && reviewData.rating !== existingReview.rating) {
        await this.notifyTechnicianAboutReviewUpdate(updatedReview);
      }

      const reviewDto = toReviewDto(updatedReview);
      return ResponseHelper.success('Review updated successfully', reviewDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error updating review', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to update review');
    }
  }

  async deleteReview(
    userId: string,
    reviewId: string
  ): Promise<ApiResponse<ReviewResponseDto>> {
    const context = {
      operation: 'deleteReview',
      data: { userId, reviewId },
    };

    try {
      this._logger.info('Deleting review', context);

      const existingReview = await this._reviewRepository.findById(reviewId);

      if (!existingReview) {
        this._logger.warn('Review not found for deletion', context);
        return ResponseHelper.notFound('Review not found');
      }

      let reviewUserId: string;

      // Check if userId is a populated object (has _id property)
      if (existingReview.userId && typeof existingReview.userId === 'object') {
        const userObj = existingReview.userId as any;
        // Check if it has _id property (populated user)
        if (userObj._id) {
          reviewUserId = userObj._id.toString();
        } else {
          // It's a plain object without _id, try to convert to string
          reviewUserId = String(existingReview.userId);
        }
      } else {
        // It's not an object, convert directly to string
        reviewUserId = String(existingReview.userId);
      }

      // Check if user owns the review
      if (reviewUserId !== userId) {
        this._logger.warn('User does not own this review', context);
        return ResponseHelper.forbidden('You can only delete your own reviews');
      }

      const deleted = await this._reviewRepository.delete(reviewId);

      if (!deleted) {
        this._logger.error('Failed to delete review from repository', context);
        return ResponseHelper.error('Failed to delete review');
      }

      this._logger.info('Review deleted successfully', context);

      // NOTIFICATION: Notify technician about review deletion
      await this.notifyTechnicianAboutReviewDeletion(existingReview);

      const reviewDto = toReviewDto(existingReview);
      return ResponseHelper.success('Review deleted successfully', reviewDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error deleting review', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to delete review');
    }
  }

  async getReviewById(
    reviewId: string
  ): Promise<ApiResponse<ReviewResponseDto>> {
    const context = {
      operation: 'getReviewById',
      data: { reviewId },
    };

    try {
      this._logger.info('Fetching review by ID', context);

      const review = await this._reviewRepository.findById(reviewId);

      if (!review) {
        this._logger.warn('Review not found', context);
        return ResponseHelper.notFound('Review not found');
      }

      this._logger.info('Review retrieved successfully', context);

      const reviewDto = toReviewDto(review);
      return ResponseHelper.success('Review retrieved successfully', reviewDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching review by ID', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch review');
    }
  }

  async getUserReviews(
    userId: string
  ): Promise<ApiResponse<ReviewListResponseDto>> {
    const context = {
      operation: 'getUserReviews',
      data: { userId },
    };

    try {
      this._logger.info('Fetching user reviews', context);

      const reviews = await this._reviewRepository.findByUserId(userId);

      if (!reviews || reviews.length === 0) {
        this._logger.info('No reviews found for user', context);
        return ResponseHelper.success('No reviews found', {
          reviews: [],
          totalCount: 0,
          currentPage: 1,
          totalPages: 0,
        });
      }

      this._logger.info('User reviews retrieved successfully', {
        ...context,
        reviewCount: reviews.length,
      });

      const reviewDtos = toReviewDtoList(reviews);
      return ResponseHelper.success('Reviews retrieved successfully', {
        reviews: reviewDtos,
        totalCount: reviewDtos.length,
        currentPage: 1,
        totalPages: 1,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching user reviews', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch reviews');
    }
  }

  async getTechnicianReviews(
    technicianId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<ReviewListResponseDto>> {
    const context = {
      operation: 'getTechnicianReviews',
      data: { technicianId, page, limit },
    };

    try {
      this._logger.info('Fetching technician reviews', context);

      const { reviews, totalCount } =
        await this._reviewRepository.findByTechnicianId(
          technicianId,
          page,
          limit
        );

      if (!reviews || reviews.length === 0) {
        this._logger.info('No reviews found for technician', context);
        return ResponseHelper.success('No reviews found', {
          reviews: [],
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
        });
      }

      this._logger.info('Technician reviews retrieved successfully', {
        ...context,
        reviewCount: reviews.length,
        totalCount,
      });

      const reviewDtos = toReviewDtoList(reviews);
      const totalPages = Math.ceil(totalCount / limit);

      return ResponseHelper.success('Reviews retrieved successfully', {
        reviews: reviewDtos,
        totalCount,
        currentPage: page,
        totalPages,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching technician reviews', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch reviews');
    }
  }

  async getOrderReview(
    orderId: string
  ): Promise<ApiResponse<ReviewResponseDto> | null> {
    const context = {
      operation: 'getOrderReview',
      data: { orderId },
    };

    try {
      this._logger.info('Fetching review for order', context);

      const review = await this._reviewRepository.findByOrderId(orderId);

      if (!review) {
        this._logger.info('No review found for order', context);
        return null;
      }

      this._logger.info('Order review retrieved successfully', context);

      const reviewDto = toReviewDto(review);
      return ResponseHelper.success('Review retrieved successfully', reviewDto);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching order review', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch review');
    }
  }

  async getTechnicianReviewStats(
    technicianId: string
  ): Promise<ApiResponse<ReviewStatsResponseDto>> {
    const context = {
      operation: 'getTechnicianReviewStats',
      data: { technicianId },
    };

    try {
      this._logger.info('Fetching technician review stats', context);

      const stats =
        await this._reviewRepository.getTechnicianStats(technicianId);

      this._logger.info('Technician review stats retrieved successfully', {
        ...context,
        averageRating: stats.averageRating,
        totalReviews: stats.totalReviews,
      });

      return ResponseHelper.success(
        'Review stats retrieved successfully',
        stats
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching technician review stats', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch review stats');
    }
  }

  async canUserReviewOrder(userId: string, orderId: string): Promise<boolean> {
    return await this._reviewRepository.canUserReviewOrder(userId, orderId);
  }

  async reportReview(
    userId: string,
    reviewId: string,
    reportData: ReportReviewRequest
  ): Promise<ApiResponse<{ reportId: string }>> {
    const context = {
      operation: 'reportReview',
      data: { userId, reviewId, reason: reportData.reason },
    };

    try {
      this._logger.info('Reporting review', context);

      // Check if review exists
      const review = await this._reviewRepository.findById(reviewId);
      if (!review) {
        this._logger.warn('Review not found for reporting', context);
        return ResponseHelper.notFound('Review not found');
      }

      // Check if user is trying to report their own review
      if (review.userId.toString() === userId) {
        this._logger.warn('User cannot report their own review', context);
        return ResponseHelper.badRequest('You cannot report your own review');
      }

      // Validate reason
      if (!reportData.reason || reportData.reason.trim().length === 0) {
        this._logger.warn('Empty reason provided for report', context);
        return ResponseHelper.badRequest('Reason is required');
      }

      // Prepare report data
      const reportDataForRepo = {
        reason: reportData.reason,
        reportedBy: userId,
        additionalInfo: reportData.additionalInfo,
        reportedAt: new Date(),
      };

      // Save the report
      const result = await this._reviewRepository.reportReview(
        reviewId,
        reportDataForRepo
      );

      this._logger.info('Review reported successfully', {
        ...context,
        reportId: result.reportId,
      });

      // NOTIFICATION: Notify user that report was submitted
      await this.notifyUserAboutReportSubmission(userId);

      // NOTIFICATION: Notify review author if someone reported their review (optional)
      await this.notifyReviewAuthorAboutReport(review, reportData.reason);

      return ResponseHelper.success(
        'Review reported successfully. Our team will review it shortly.',
        {
          reportId: result.reportId,
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error reporting review', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Check if it's an "already reported" error and return appropriate response
      if (errorMessage.includes('already reported')) {
        return ResponseHelper.badRequest(
          'You have already reported this review'
        );
      }

      return ResponseHelper.error('Failed to report review');
    }
  }

  // ==================== NOTIFICATION METHODS ====================

  private async notifyTechnicianAboutNewReview(
    review: any,
    order: any
  ): Promise<void> {
    try {
      const context = {
        operation: 'notifyTechnicianAboutNewReview',
        reviewId: review._id.toString(),
        technicianId: review.technicianId.toString(),
        rating: review.rating,
      };

      this._logger.info(
        'Sending new review notification to technician',
        context
      );

      // Get user details for personalized notification
      const UserModel = (await import('../models/UserSchema')).default;
      const user = await UserModel.findById(review.userId);

      const customerName = user?.fullName || 'A customer';

      await this._socketService.notifyReviewReceived(
        review.technicianId.toString(),
        review.rating,
        customerName
      );

      this._logger.info(
        'New review notification sent to technician successfully',
        context
      );
    } catch (error) {
      // Don't fail the review creation if notification fails
      this._logger.error(
        'Failed to send new review notification to technician',
        {
          reviewId: review._id.toString(),
          technicianId: review.technicianId.toString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }

  private async notifyUserAboutReviewSubmission(
    userId: string,
    serviceName: string
  ): Promise<void> {
    try {
      const context = {
        operation: 'notifyUserAboutReviewSubmission',
        userId,
        serviceName,
      };

      this._logger.info(
        'Sending review submission confirmation to user',
        context
      );
      await this._socketService.sendLiveNotification(userId, {
        userId,
        userType: 'customer',
        type: 'system',
        title: 'Review Submitted Successfully',
        message: `Thank you for reviewing your ${serviceName} service. Your feedback helps us improve our services.`,
        priority: 'low',
        data: {
          serviceType: serviceName,
          action: 'review_submitted',
        },
      });

      this._logger.info(
        'Review submission confirmation sent to user successfully',
        context
      );
    } catch (error) {
      this._logger.error(
        'Failed to send review submission confirmation to user',
        {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }

  private async notifyTechnicianAboutReviewUpdate(review: any): Promise<void> {
    try {
      const context = {
        operation: 'notifyTechnicianAboutReviewUpdate',
        reviewId: review._id.toString(),
        technicianId: review.technicianId.toString(),
        newRating: review.rating,
      };

      this._logger.info(
        'Sending review update notification to technician',
        context
      );
      await this._socketService.sendLiveNotification(
        review.technciianId.toString(),
        {
          userId: review.technicianId.toString(),
          userType: 'technician',
          type: 'rating_received',
          title: 'Review Updated',
          message: `A customer updated their review and gave you a ${review.rating}-star rating.`,
          priority: 'medium',
          data: {
            reviewId: review._id.toString(),
            rating: review.rating,
            action: 'review_updated',
          },
        }
      );

      this._logger.info(
        'Review update notification sent to technician successfully',
        context
      );
    } catch (error) {
      this._logger.error(
        'Failed to send review update notification to technician',
        {
          reviewId: review._id.toString(),
          technicianId: review.technicianId.toString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }

  private async notifyTechnicianAboutReviewDeletion(
    review: any
  ): Promise<void> {
    try {
      const context = {
        operation: 'notifyTechnicianAboutReviewDeletion',
        reviewId: review._id.toString(),
        technicianId: review.technicianId.toString(),
      };

      this._logger.info(
        'Sending review deletion notification to technician',
        context
      );

      await this._socketService.sendLiveNotification(
        review.technicianId.toString(),
        {
          userId: review.technicianId.toString(),
          userType: 'technician',
          type: 'system',
          title: 'Review Deleted',
          message: 'A customer has deleted their review for your service.',
          priority: 'low',
          data: {
            reviewId: review._id.toString(),
            action: 'review_deleted',
          },
        }
      );

      this._logger.info(
        'Review deletion notification sent to technician successfully',
        context
      );
    } catch (error) {
      this._logger.error(
        'Failed to send review deletion notification to technician',
        {
          reviewId: review._id.toString(),
          technicianId: review.technicianId.toString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }

  private async notifyUserAboutReportSubmission(userId: string): Promise<void> {
    try {
      const context = {
        operation: 'notifyUserAboutReportSubmission',
        userId,
      };

      this._logger.info(
        'Sending report submission confirmation to user',
        context
      );

      await this._socketService.sendLiveNotification(userId, {
        userId,
        userType: 'customer',
        type: 'system',
        title: 'Report Submitted',
        message:
          'Thank you for reporting this review. Our team will investigate and take appropriate action.',
        priority: 'medium',
        data: {
          action: 'report_submitted',
        },
      });

      this._logger.info(
        'Report submission confirmation sent to user successfully',
        context
      );
    } catch (error) {
      this._logger.error(
        'Failed to send report submission confirmation to user',
        {
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }

  private async notifyReviewAuthorAboutReport(
    review: any,
    reason: string
  ): Promise<void> {
    try {
      const context = {
        operation: 'notifyReviewAuthorAboutReport',
        reviewId: review._id.toString(),
        authorId: review.userId.toString(),
      };

      this._logger.info(
        'Sending report notification to review author',
        context
      );
      await this._socketService.sendLiveNotification(review.userId.toString(), {
        userId: review.userId.toString(),
        userType: 'customer',
        type: 'system',
        title: 'Your Review Was Reported',
        message: `Your review has been reported for: ${reason}. Our team will review it shortly.`,
        priority: 'medium',
        data: {
          reviewId: review._id.toString(),
          reason,
          action: 'review_reported',
        },
      });

      this._logger.info(
        'Report notification sent to review author successfully',
        context
      );
    } catch (error) {
      this._logger.error(
        'Failed to send report notification to review author',
        {
          reviewId: review._id.toString(),
          authorId: review.userId.toString(),
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }

  async notifyTechnicianAboutMilestone(
    technicianId: string,
    milestone: string
  ): Promise<void> {
    try {
      const context = {
        operation: 'notifyTechnicianAboutMilestone',
        technicianId,
        milestone,
      };

      this._logger.info(
        'Sending milestone notification to technician',
        context
      );

      await this._socketService.sendLiveNotification(technicianId, {
        userId: technicianId,
        userType: 'technician',
        type: 'system',
        title: 'Milestone Achieved!',
        message: `Congratulations! You've reached a new milestone: ${milestone}`,
        priority: 'medium',
        data: {
          milestone,
          action: 'milestone_achieved',
        },
      });

      this._logger.info(
        'Milestone notification sent to technician successfully',
        context
      );
    } catch (error) {
      this._logger.error(
        'Failed to send milestone notification to technician',
        {
          technicianId,
          milestone,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );
    }
  }
}
