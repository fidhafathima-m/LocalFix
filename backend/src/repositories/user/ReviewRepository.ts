import {
  IReviewRepository,
  ReportReviewData,
  ReviewWithUserReport,
} from '../../interfaces/repository/user/IReviewRepository';
import Review, { IReview } from '../../models/ReviewSchema';
import { Types } from 'mongoose';
import Order from '../../models/OrderSchema';

import mongoose, { Schema, Document } from 'mongoose';

export interface IReviewReport extends Document {
  _id: Types.ObjectId;
  reviewId: Types.ObjectId;
  reason: string;
  reportedBy: Types.ObjectId;
  additionalInfo?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  adminNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewReportSchema = new Schema<IReviewReport>(
  {
    reviewId: {
      type: Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    additionalInfo: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Create index for faster queries
ReviewReportSchema.index({ reviewId: 1, reportedBy: 1 });
ReviewReportSchema.index({ status: 1 });
ReviewReportSchema.index({ createdAt: -1 });

const ReviewReport = mongoose.model<IReviewReport>(
  'ReviewReport',
  ReviewReportSchema
);

export class ReviewRepository implements IReviewRepository {
  async create(reviewData: Partial<IReview>): Promise<IReview> {
    const review = new Review(reviewData);
    return await review.save();
  }

  async update(
    reviewId: string,
    updateData: Partial<IReview>
  ): Promise<IReview | null> {
    return await Review.findByIdAndUpdate(
      new Types.ObjectId(reviewId),
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async delete(reviewId: string): Promise<boolean> {
    const result = await Review.findByIdAndDelete(
      new Types.ObjectId(reviewId)
    ).exec();
    return result !== null;
  }

  async findById(reviewId: string): Promise<IReview | null> {
    return await Review.findById(new Types.ObjectId(reviewId))
      .populate('userId', 'fullName email')
      .populate({
        path: 'orderId',
        select: 'serviceName',
      })
      .populate({
        path: 'technicianId',
        select: 'displayName profilePictureUrl',
      })
      .exec();
  }

  async findByOrderId(orderId: string): Promise<IReview | null> {
    return await Review.findOne({ orderId: new Types.ObjectId(orderId) })
      .populate('userId', 'fullName email')
      .populate({
        path: 'orderId',
        select: 'serviceName',
      })
      .populate({
        path: 'technicianId',
        select: 'displayName profilePictureUrl',
      })
      .exec();
  }

  async findByUserId(userId: string): Promise<IReview[]> {
    return await Review.find({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'fullName email')
      .populate({
        path: 'orderId',
        select: 'serviceName',
      })
      .populate({
        path: 'technicianId',
        select: 'displayName profilePictureUrl',
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByTechnicianId(
    technicianId: string,
    page: number = 1,
    limit: number = 10,
    currentUserId?: string
  ): Promise<{ reviews: ReviewWithUserReport[]; totalCount: number }> {
    const skip = (page - 1) * limit;

    const [reviews, totalCount] = await Promise.all([
      Review.find({ technicianId: new Types.ObjectId(technicianId) })
        .populate('userId', 'fullName email')
        .populate({
          path: 'orderId',
          select: 'serviceName',
        })
        .populate({
          path: 'technicianId',
          select: 'displayName profilePictureUrl',
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Review.countDocuments({ technicianId: new Types.ObjectId(technicianId) }),
    ]);

    let userReportedReviews: string[] = [];
    if (currentUserId) {
      const userReports = await ReviewReport.find({
        reportedBy: new Types.ObjectId(currentUserId),
        reviewId: { $in: reviews.map(r => r._id) },
      }).select('reviewId');

      userReportedReviews = userReports.map(report =>
        report.reviewId.toString()
      );
    }

    const reviewsWithReportStatus = reviews.map(review => ({
      ...review.toObject(),
      userReported: userReportedReviews.includes(review._id.toString()),
    }));

    return { reviews: reviewsWithReportStatus, totalCount };
  }

  async getTechnicianStats(technicianId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  }> {
    const result = await Review.aggregate([
      { $match: { technicianId: new Types.ObjectId(technicianId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    // Initialize with all zeros
    const distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    } = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    if (result.length > 0) {
      // Count each rating
      result[0].ratingDistribution.forEach((rating: number) => {
        if (rating >= 1 && rating <= 5) {
          distribution[rating as keyof typeof distribution]++;
        }
      });
    }

    return {
      averageRating:
        result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0,
      totalReviews: result.length > 0 ? result[0].totalReviews : 0,
      ratingDistribution: distribution,
    };
  }

  async existsForOrder(orderId: string): Promise<boolean> {
    const count = await Review.countDocuments({
      orderId: new Types.ObjectId(orderId),
    });
    return count > 0;
  }

  async canUserReviewOrder(userId: string, orderId: string): Promise<boolean> {
    // Check if order exists, is completed, and belongs to user
    const order = await Order.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(userId),
      status: 'completed',
    });

    if (!order) {
      return false;
    }

    // Check if review already exists for this order
    const reviewExists = await this.existsForOrder(orderId);
    return !reviewExists;
  }

  async reportReview(
    reviewId: string,
    reportData: ReportReviewData
  ): Promise<{ reportId: string }> {
    // Check if user has already reported this review
    const existingReport = await ReviewReport.findOne({
      reviewId: new Types.ObjectId(reviewId),
      reportedBy: new Types.ObjectId(reportData.reportedBy),
    });

    if (existingReport) {
      throw new Error('You have already reported this review');
    }

    // Create new report
    const report = new ReviewReport({
      reviewId: new Types.ObjectId(reviewId),
      reason: reportData.reason,
      reportedBy: new Types.ObjectId(reportData.reportedBy),
      additionalInfo: reportData.additionalInfo,
      status: 'pending',
    });

    const savedReport = await report.save();

    return {
      reportId: savedReport._id.toString(),
    };
  }
}
