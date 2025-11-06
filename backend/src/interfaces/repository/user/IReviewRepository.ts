// interfaces/repository/user/IReviewRepository.ts
import { IReview } from "../../../models/ReviewSchema";

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
    limit?: number
  ): Promise<{ reviews: IReview[]; totalCount: number }>;
   getTechnicianStats(technicianId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
  }>;
  existsForOrder(orderId: string): Promise<boolean>;
  canUserReviewOrder(userId: string, orderId: string): Promise<boolean>;
}