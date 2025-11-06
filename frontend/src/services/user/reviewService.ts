import { USER_PROFILE_ROUTES } from "../../routes/userProfileRoutes";
import api from "../../utils/axiosConfig";

export interface CreateReviewRequest {
  orderId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface ReviewResponse {
  id: string;
  orderId: string;
  userId: string;
  technicianId: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResponse {
  reviews: ReviewResponse[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface ReviewStatsResponse {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode: number;
}

export const reviewService = {
  // Create a new review
  createReview: async (reviewData: CreateReviewRequest): Promise<ApiResponse<ReviewResponse>> => {
    try {
      const response = await api.post<ApiResponse<ReviewResponse>>(
        USER_PROFILE_ROUTES.REVIEWS,
        reviewData
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating review:", error);
      throw error;
    }
  },

  // Update a review
  updateReview: async (
    reviewId: string,
    reviewData: UpdateReviewRequest
  ): Promise<ApiResponse<ReviewResponse>> => {
    try {
      const response = await api.put<ApiResponse<ReviewResponse>>(
        USER_PROFILE_ROUTES.REVIEW_BY_ID(reviewId),
        reviewData
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating review:", error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId: string): Promise<ApiResponse<ReviewResponse>> => {
    try {
      const response = await api.delete<ApiResponse<ReviewResponse>>(
        USER_PROFILE_ROUTES.REVIEW_BY_ID(reviewId)
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error deleting review:", error);
      throw error;
    }
  },

  // Get user's reviews
  getUserReviews: async (): Promise<ApiResponse<ReviewListResponse>> => {
    try {
      const response = await api.get<ApiResponse<ReviewListResponse>>(USER_PROFILE_ROUTES.REVIEWS);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching user reviews:", error);
      throw error;
    }
  },

  // Get review by ID
  getReviewById: async (reviewId: string): Promise<ApiResponse<ReviewResponse>> => {
    try {
      const response = await api.get<ApiResponse<ReviewResponse>>(
        USER_PROFILE_ROUTES.REVIEW_BY_ID(reviewId)
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching review:", error);
      throw error;
    }
  },

  // Get review for specific order
  getOrderReview: async (orderId: string): Promise<ApiResponse<ReviewResponse>> => {
    try {
      const response = await api.get<ApiResponse<ReviewResponse>>(
        USER_PROFILE_ROUTES.REVIEW_ORDER(orderId)
      );
      return response.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Handle 404 as "no review found" - return a proper response
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'No review found for this order',
          statusCode: 404,
          data: undefined
        };
      }
      
      // For other errors, re-throw
      console.error("Error fetching order review:", error);
      throw error;
    }
  },

  // Get technician reviews
  getTechnicianReviews: async (
    technicianId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<ReviewListResponse>> => {
    try {
      const response = await api.get<ApiResponse<ReviewListResponse>>(
        USER_PROFILE_ROUTES.REVIEW_TECHNICIAN(technicianId),
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching technician reviews:", error);
      throw error;
    }
  },

  // Get technician review stats
  getTechnicianReviewStats: async (
    technicianId: string
  ): Promise<ApiResponse<ReviewStatsResponse>> => {
    try {
      const response = await api.get<ApiResponse<ReviewStatsResponse>>(
        USER_PROFILE_ROUTES.REVIEW_TECHNICIAN_STATS(technicianId)
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching technician review stats:", error);
      throw error;
    }
  },

  // Check if user can review an order
  canUserReviewOrder: async (orderId: string): Promise<ApiResponse<{ canReview: boolean }>> => {
    try {
      const response = await api.get<ApiResponse<{ canReview: boolean }>>(
        USER_PROFILE_ROUTES.REVIEW_CAN_REVIEW(orderId)
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error checking review permission:", error);
      throw error;
    }
  },
};