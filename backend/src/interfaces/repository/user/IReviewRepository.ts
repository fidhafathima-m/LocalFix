// interfaces/repository/user/IReviewRepository.ts
import { Types } from "mongoose";
import { IReview } from "../../../models/ReviewSchema";

export interface ReportReviewData {
  reason: string;
  reportedBy: string;
  additionalInfo?: string;
  reportedAt: Date;
}

export interface PopulatedUser {
  _id: Types.ObjectId;
  fullName: string;
  email?: string;
}

export interface ReviewWithUserReport {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId: Types.ObjectId | PopulatedUser; // Can be ObjectId or populated user
  technicianId: Types.ObjectId;
  rating: number;
  comment: string;
  status: "published" | "flagged" | "pending";
  flagReason?: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
  userReported: boolean;
}

export interface IReviewRepository {
  create(reviewData: Partial<IReview>): Promise<IReview>;
  update(reviewId: string, updateData: Partial<IReview>): Promise<IReview | null>;
  delete(reviewId: string): Promise<boolean>;
  findById(reviewId: string): Promise<IReview | null>;
  findByOrderId(orderId: string): Promise<IReview | null>;
  findByUserId(userId: string): Promise<IReview[]>;
  findByTechnicianId(
    technicianId: string,
    page?: number,
    limit?: number,
    currentUserId?: string
  ): Promise<{ reviews: ReviewWithUserReport[]; totalCount: number }>;
   getTechnicianStats(technicianId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  }>;
  existsForOrder(orderId: string): Promise<boolean>;
  canUserReviewOrder(userId: string, orderId: string): Promise<boolean>;
   reportReview(
    reviewId: string,
    reportData: ReportReviewData
  ): Promise<{ reportId: string }>;
}