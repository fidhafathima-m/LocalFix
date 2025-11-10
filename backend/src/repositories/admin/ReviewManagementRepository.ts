import { FilterQuery, Types } from "mongoose";
import {
  IReviewRepository,
  ReviewWithDetails,
  GetReviewsFilter,
  ReviewStats,
} from "../../interfaces/repository/admin/IReviewRepository";
import Review, { IReview } from "../../models/ReviewSchema";
import UserSchema from "../../models/UserSchema";
import { Technician } from "../../models/technician/TechnicianSchema";
import { Service } from "../../models/category/serviceSchema";

export class ReviewManagementRepository implements IReviewRepository {
  async findByIdWithDetails(
    reviewId: string
  ): Promise<ReviewWithDetails | null> {
    const review = await Review.findById(reviewId)
      .populate({
        path: "orderId",
        select: "serviceName userId technicianId",
        populate: [
          {
            path: "userId",
            model: UserSchema,
            select: "fullName email phone",
          },
          {
            path: "technicianId",
            model: Technician,
            select: "name",
          },
        ],
      })
      .lean();

    if (!review) return null;

    // Create a new object with explicit typing
    const populatedReview: ReviewWithDetails = {
      _id: review._id,
      orderId: review.orderId,
      userId: review.userId,
      technicianId: review.technicianId,
      rating: review.rating,
      comment: review.comment,
      status: review.status,
      flagReason: review.flagReason,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      __v: review.__v,
      customerName: (review as any).orderId?.userId?.fullName || "Unknown",
      customerEmail: (review as any).orderId?.userId?.email || "Unknown",
      customerPhone: (review as any).orderId?.userId?.phone || "Unknown",
      service: (review as any).orderId?.serviceName || "Unknown Service",
      technicianName:
        (review as any).orderId?.technicianId?.name || "Unknown Technician",
    };

    return populatedReview;
  }

  async findAllWithDetails(
    filters: GetReviewsFilter
  ): Promise<{ reviews: ReviewWithDetails[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query: FilterQuery<IReview> = {};

    if (filters.rating) {
      query.rating = filters.rating;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.$or = [{ comment: { $regex: filters.search, $options: "i" } }];
    }

    // Get reviews with population
    const reviews = await Review.find(query)
      .populate({
        path: "orderId",
        select: "serviceName userId technicianId",
        populate: [
          {
            path: "userId",
            model: UserSchema,
            select: "fullName email phone",
          },
          {
            path: "technicianId",
            model: Technician,
            select: "name",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Transform data with explicit typing
    const reviewsWithDetails: ReviewWithDetails[] = reviews.map(
      (review: any) => ({
        _id: review._id,
        orderId: review.orderId,
        userId: review.userId,
        technicianId: review.technicianId,
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        flagReason: review.flagReason,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        __v: review.__v,
        customerName: review.orderId?.userId?.fullName || "Unknown",
        customerEmail: review.orderId?.userId?.email || "Unknown",
        customerPhone: review.orderId?.userId?.phone || "Unknown",
        service: review.orderId?.serviceName || "Unknown Service",
        technicianName:
          review.orderId?.technicianId?.name || "Unknown Technician",
      })
    );

    const total = await Review.countDocuments(query);

    return { reviews: reviewsWithDetails, total };
  }

  async findById(reviewId: string): Promise<IReview | null> {
    return await Review.findById(reviewId);
  }

  async updateStatus(
    reviewId: string,
    status: string
  ): Promise<IReview | null> {
    return await Review.findByIdAndUpdate(
      reviewId,
      { status },
      { new: true, runValidators: true }
    );
  }

  async flagReview(reviewId: string, reason?: string): Promise<IReview | null> {
    return await Review.findByIdAndUpdate(
      reviewId,
      {
        status: "flagged",
        flagReason: reason,
      },
      { new: true, runValidators: true }
    );
  }

  async delete(reviewId: string): Promise<boolean> {
    const result = await Review.findByIdAndDelete(reviewId);
    return result !== null;
  }

  async getReviewStats(): Promise<ReviewStats> {
    const totalReviews = await Review.countDocuments();
    const flaggedReviews = await Review.countDocuments({ status: "flagged" });
    const fiveStarReviews = await Review.countDocuments({ rating: 5 });

    // Calculate average rating
    const ratingResult = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    const averageRating = ratingResult[0]?.averageRating || 0;

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((item) => {
      distribution[item._id as keyof typeof distribution] = item.count;
    });

    // Calculate service distribution
    const serviceDistributionResult = await Review.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "orderId",
          foreignField: "_id",
          as: "order",
        },
      },
      {
        $unwind: "$order",
      },
      {
        $lookup: {
          from: "services",
          localField: "order.serviceId",
          foreignField: "_id",
          as: "service",
        },
      },
      {
        $unwind: "$service",
      },
      {
        $group: {
          _id: "$service.name",
          count: { $sum: 1 },
        },
      },
    ]);

    const serviceDistribution: Record<string, number> = {};
    serviceDistributionResult.forEach((item) => {
      serviceDistribution[item._id] = item.count;
    });

    return {
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
      flaggedReviews,
      fiveStarReviews,
      ratingDistribution: distribution,
      serviceDistribution,
    };
  }
}
