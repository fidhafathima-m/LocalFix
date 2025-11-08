// interfaces/services/admin/IAdminReviewService.ts
export interface ReviewStatsResponse {
  totalReviews: number;
  averageRating: number;
  flaggedReviews: number;
  fiveStarReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  serviceDistribution: Record<string, number>;
}

export interface ReviewListResponse {
  reviews: ReviewResponseDto[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ReviewResponseDto {
  id: string;
  orderId: string;
  userId: string;
  technicianId: string;
  rating: number;
  comment: string;
  status: "published" | "flagged" | "pending";
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  technicianName: string;
}

export interface GetReviewsFilter {
  page?: number;
  limit?: number;
  search?: string;
  rating?: number;
  status?: "published" | "flagged" | "pending";
  service?: string;
}

export interface IAdminReviewService {
  getAllReviews(filters: GetReviewsFilter): Promise<ReviewListResponse>;
  getReviewById(reviewId: string): Promise<ReviewResponseDto>;
  updateReviewStatus(reviewId: string, status: string): Promise<ReviewResponseDto>;
  flagReview(reviewId: string, reason?: string): Promise<ReviewResponseDto>;
  deleteReview(reviewId: string): Promise<void>;
  getReviewStats(): Promise<ReviewStatsResponse>;
}