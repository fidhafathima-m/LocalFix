// interfaces/repository/admin/IReviewRepository.ts
import { IReview } from "@/models/ReviewSchema";
import { Types } from "mongoose";

// Create a standalone interface for populated review data
export interface ReviewWithDetails {
  // Base review fields
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  technicianId: Types.ObjectId;
  rating: number;
  comment: string;
  status: "published" | "flagged" | "pending";
  flagReason?: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  
  // Additional populated fields
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

export interface ReviewStats {
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

export interface IReviewRepository {
  findAllWithDetails(filters: GetReviewsFilter): Promise<{ reviews: ReviewWithDetails[]; total: number }>;
  findByIdWithDetails(reviewId: string): Promise<ReviewWithDetails | null>;
  findById(reviewId: string): Promise<IReview | null>;
  updateStatus(reviewId: string, status: string): Promise<IReview | null>;
  flagReview(reviewId: string, reason?: string): Promise<IReview | null>;
  delete(reviewId: string): Promise<boolean>;
  getReviewStats(): Promise<ReviewStats>;
}