// interfaces/dtos/reviewDtos.ts
export interface CreateReviewRequestDto {
  orderId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequestDto {
  rating?: number;
  comment?: string;
}

export interface ReviewResponseDto {
  id: string;
  orderId: string;
  userId: string;
  technicianId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResponseDto {
  reviews: ReviewResponseDto[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface ReviewStatsResponseDto {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<1 | 2 | 3 | 4 | 5, number>;
}