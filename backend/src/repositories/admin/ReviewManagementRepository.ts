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
            select: "displayName",
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
        (review as any).orderId?.technicianId?.displayName ||
        "Unknown Technician",
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

    let reviews: any[] = [];
    let total = 0;

    if (filters.search) {
      const aggregationPipeline: any[] = [
        // Lookup order details
        {
          $lookup: {
            from: "orders",
            localField: "orderId",
            foreignField: "_id",
            as: "order",
          },
        },
        { $unwind: { path: "$order", preserveNullAndEmptyArrays: true } },
        // Lookup user details
        {
          $lookup: {
            from: "users",
            localField: "order.userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        // Lookup technician details
        {
          $lookup: {
            from: "technicians",
            localField: "order.technicianId",
            foreignField: "_id",
            as: "technician",
          },
        },
        { $unwind: { path: "$technician", preserveNullAndEmptyArrays: true } },
        // Add computed fields for search
        {
          $addFields: {
            customerName: "$user.fullName",
            customerEmail: "$user.email",
            customerPhone: "$user.phone",
            service: "$order.serviceName",
            technicianName: "$technician.displayName",
          },
        },
        // Apply search filter across all fields
        {
          $match: {
            $or: [
              { comment: { $regex: filters.search, $options: "i" } },
              { "user.fullName": { $regex: filters.search, $options: "i" } },
              { "user.email": { $regex: filters.search, $options: "i" } },
              { "user.phone": { $regex: filters.search, $options: "i" } },
              {
                "order.serviceName": { $regex: filters.search, $options: "i" },
              },
              {
                "technician.displayName": {
                  $regex: filters.search,
                  $options: "i",
                },
              },
            ],
          },
        },
        // Apply other filters
        ...(filters.rating ? [{ $match: { rating: filters.rating } }] : []),
        ...(filters.status ? [{ $match: { status: filters.status } }] : []),
        // Get total count
        {
          $facet: {
            metadata: [{ $count: "total" }],
            data: [
              { $sort: { createdAt: -1 } },
              { $skip: skip },
              { $limit: limit },
            ],
          },
        },
      ];

      const result = await Review.aggregate(aggregationPipeline);

      reviews = result[0]?.data || [];
      total = result[0]?.metadata[0]?.total || 0;
    } else {
      // No search term - use normal query with population
      if (filters.rating) {
        query.rating = filters.rating;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      reviews = await Review.find(query)
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
              select: "displayName",
            },
          ],
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      total = await Review.countDocuments(query);
    }

    // Transform data with explicit typing
    const reviewsWithDetails: ReviewWithDetails[] = reviews.map(
      (review: any) => {
        // Handle both aggregation result and populated result
        const orderData = review.orderId || review.order;
        const userData = orderData?.userId || review.user;
        const technicianData = orderData?.technicianId || review.technician;

        return {
          _id: review._id,
          orderId: orderData?._id || review.orderId,
          userId: userData?._id || review.userId,
          technicianId: technicianData?._id || review.technicianId,
          rating: review.rating,
          comment: review.comment,
          status: review.status,
          flagReason: review.flagReason,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          __v: review.__v,
          customerName: userData?.fullName || "Unknown",
          customerEmail: userData?.email || "Unknown",
          customerPhone: userData?.phone || "Unknown",
          service:
            orderData?.serviceName ||
            review.service ||
            review.order?.serviceName ||
            "Unknown Service",
          technicianName: technicianData?.displayName || "Unknown Technician",
        };
      }
    );

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
