// interfaces/services/user/IReviewService.ts
import {
  CreateReviewRequestDto,
  UpdateReviewRequestDto,
  ReviewResponseDto,
  ReviewListResponseDto,
  ReviewStatsResponseDto,
} from "../../dtos/reviewDtos";
import { ApiResponse } from "../../../utils/responseHelper";

export interface IReviewService {
  createReview(
    userId: string,
    reviewData: CreateReviewRequestDto
  ): Promise<ApiResponse<ReviewResponseDto>>;

  updateReview(
    userId: string,
    reviewId: string,
    reviewData: UpdateReviewRequestDto
  ): Promise<ApiResponse<ReviewResponseDto>>;

  deleteReview(
    userId: string,
    reviewId: string
  ): Promise<ApiResponse<ReviewResponseDto>>;

  getReviewById(reviewId: string): Promise<ApiResponse<ReviewResponseDto>>;

  getUserReviews(userId: string): Promise<ApiResponse<ReviewListResponseDto>>;

  getTechnicianReviews(
    technicianId: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<ReviewListResponseDto>>;

  getOrderReview(orderId: string): Promise<ApiResponse<ReviewResponseDto> | null>;

  getTechnicianReviewStats(
    technicianId: string
  ): Promise<ApiResponse<ReviewStatsResponseDto>>;

  canUserReviewOrder(userId: string, orderId: string): Promise<boolean>;
}