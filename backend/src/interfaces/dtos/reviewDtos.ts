export interface CreateReviewRequestDto {
  orderId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequestDto {
  rating?: number;
  comment?: string;
}

// In your dtos/reviewDtos.ts file
export interface ReviewResponseDto {
  id: string;
  orderId: string;
  userId: string;
  technicianId: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  userReported: boolean;
  user: {
    fullName: string;
    email: string;
  };
  service?: {
    name: string;
  };
  technician?: {
    displayName: string;
    profilePictureUrl?: string;
  };
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

export interface ReportReviewRequestDto {
  reason: string;
  additionalInfo?: string;
}

export interface ReportReviewResponseDto {
  reportId: string;
  message: string;
}
