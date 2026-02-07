"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRepository = void 0;
const ReviewSchema_1 = __importDefault(require("../../models/ReviewSchema"));
const mongoose_1 = require("mongoose");
const OrderSchema_1 = __importDefault(require("../../models/OrderSchema"));
const mongoose_2 = __importStar(require("mongoose"));
const ReviewReportSchema = new mongoose_2.Schema({
    reviewId: {
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Review',
        required: true,
    },
    reason: {
        type: String,
        required: true,
        trim: true,
    },
    reportedBy: {
        type: mongoose_2.Schema.Types.ObjectId,
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
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true,
});
// Create index for faster queries
ReviewReportSchema.index({ reviewId: 1, reportedBy: 1 });
ReviewReportSchema.index({ status: 1 });
ReviewReportSchema.index({ createdAt: -1 });
const ReviewReport = mongoose_2.default.model('ReviewReport', ReviewReportSchema);
class ReviewRepository {
    async create(reviewData) {
        const review = new ReviewSchema_1.default(reviewData);
        return await review.save();
    }
    async update(reviewId, updateData) {
        return await ReviewSchema_1.default.findByIdAndUpdate(new mongoose_1.Types.ObjectId(reviewId), { $set: updateData }, { new: true }).exec();
    }
    async delete(reviewId) {
        const result = await ReviewSchema_1.default.findByIdAndDelete(new mongoose_1.Types.ObjectId(reviewId)).exec();
        return result !== null;
    }
    async findById(reviewId) {
        return await ReviewSchema_1.default.findById(new mongoose_1.Types.ObjectId(reviewId))
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
    async findByOrderId(orderId) {
        return await ReviewSchema_1.default.findOne({ orderId: new mongoose_1.Types.ObjectId(orderId) })
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
    async findByUserId(userId) {
        return await ReviewSchema_1.default.find({ userId: new mongoose_1.Types.ObjectId(userId) })
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
    async findByTechnicianId(technicianId, page = 1, limit = 10, currentUserId) {
        const skip = (page - 1) * limit;
        const [reviews, totalCount] = await Promise.all([
            ReviewSchema_1.default.find({ technicianId: new mongoose_1.Types.ObjectId(technicianId) })
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
            ReviewSchema_1.default.countDocuments({ technicianId: new mongoose_1.Types.ObjectId(technicianId) }),
        ]);
        let userReportedReviews = [];
        if (currentUserId) {
            const userReports = await ReviewReport.find({
                reportedBy: new mongoose_1.Types.ObjectId(currentUserId),
                reviewId: { $in: reviews.map(r => r._id) },
            }).select('reviewId');
            userReportedReviews = userReports.map(report => report.reviewId.toString());
        }
        const reviewsWithReportStatus = reviews.map(review => ({
            ...review.toObject(),
            userReported: userReportedReviews.includes(review._id.toString()),
        }));
        return { reviews: reviewsWithReportStatus, totalCount };
    }
    async getTechnicianStats(technicianId) {
        const result = await ReviewSchema_1.default.aggregate([
            { $match: { technicianId: new mongoose_1.Types.ObjectId(technicianId) } },
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
        const distribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };
        if (result.length > 0) {
            // Count each rating
            result[0].ratingDistribution.forEach((rating) => {
                if (rating >= 1 && rating <= 5) {
                    distribution[rating]++;
                }
            });
        }
        return {
            averageRating: result.length > 0 ? Math.round(result[0].averageRating * 10) / 10 : 0,
            totalReviews: result.length > 0 ? result[0].totalReviews : 0,
            ratingDistribution: distribution,
        };
    }
    async existsForOrder(orderId) {
        const count = await ReviewSchema_1.default.countDocuments({
            orderId: new mongoose_1.Types.ObjectId(orderId),
        });
        return count > 0;
    }
    async canUserReviewOrder(userId, orderId) {
        // Check if order exists, is completed, and belongs to user
        const order = await OrderSchema_1.default.findOne({
            _id: new mongoose_1.Types.ObjectId(orderId),
            userId: new mongoose_1.Types.ObjectId(userId),
            status: 'completed',
        });
        if (!order) {
            return false;
        }
        // Check if review already exists for this order
        const reviewExists = await this.existsForOrder(orderId);
        return !reviewExists;
    }
    async reportReview(reviewId, reportData) {
        // Check if user has already reported this review
        const existingReport = await ReviewReport.findOne({
            reviewId: new mongoose_1.Types.ObjectId(reviewId),
            reportedBy: new mongoose_1.Types.ObjectId(reportData.reportedBy),
        });
        if (existingReport) {
            throw new Error('You have already reported this review');
        }
        // Create new report
        const report = new ReviewReport({
            reviewId: new mongoose_1.Types.ObjectId(reviewId),
            reason: reportData.reason,
            reportedBy: new mongoose_1.Types.ObjectId(reportData.reportedBy),
            additionalInfo: reportData.additionalInfo,
            status: 'pending',
        });
        const savedReport = await report.save();
        return {
            reportId: savedReport._id.toString(),
        };
    }
}
exports.ReviewRepository = ReviewRepository;
