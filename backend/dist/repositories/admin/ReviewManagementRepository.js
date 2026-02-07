"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewManagementRepository = void 0;
const ReviewSchema_1 = __importDefault(require("../../models/ReviewSchema"));
const UserSchema_1 = __importDefault(require("../../models/UserSchema"));
const TechnicianSchema_1 = require("../../models/technician/TechnicianSchema");
class ReviewManagementRepository {
    async findByIdWithDetails(reviewId) {
        const review = await ReviewSchema_1.default.findById(reviewId)
            .populate({
            path: "orderId",
            select: "serviceName userId technicianId",
            populate: [
                {
                    path: "userId",
                    model: UserSchema_1.default,
                    select: "fullName email phone",
                },
                {
                    path: "technicianId",
                    model: TechnicianSchema_1.Technician,
                    select: "displayName",
                },
            ],
        })
            .lean();
        if (!review)
            return null;
        // Create a new object with explicit typing
        const populatedReview = {
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
            technicianName: review.orderId?.technicianId?.displayName ||
                "Unknown Technician",
        };
        return populatedReview;
    }
    async findAllWithDetails(filters) {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        // Build query
        const query = {};
        if (filters.rating) {
            query.rating = filters.rating;
        }
        if (filters.status) {
            query.status = filters.status;
        }
        let reviews = [];
        let total = 0;
        if (filters.search) {
            const aggregationPipeline = [
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
            const result = await ReviewSchema_1.default.aggregate(aggregationPipeline);
            reviews = result[0]?.data || [];
            total = result[0]?.metadata[0]?.total || 0;
        }
        else {
            // No search term - use normal query with population
            if (filters.rating) {
                query.rating = filters.rating;
            }
            if (filters.status) {
                query.status = filters.status;
            }
            reviews = await ReviewSchema_1.default.find(query)
                .populate({
                path: "orderId",
                select: "serviceName userId technicianId",
                populate: [
                    {
                        path: "userId",
                        model: UserSchema_1.default,
                        select: "fullName email phone",
                    },
                    {
                        path: "technicianId",
                        model: TechnicianSchema_1.Technician,
                        select: "displayName",
                    },
                ],
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
            total = await ReviewSchema_1.default.countDocuments(query);
        }
        // Transform data with explicit typing
        const reviewsWithDetails = reviews.map((review) => {
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
                service: orderData?.serviceName ||
                    review.service ||
                    review.order?.serviceName ||
                    "Unknown Service",
                technicianName: technicianData?.displayName || "Unknown Technician",
            };
        });
        return { reviews: reviewsWithDetails, total };
    }
    async findById(reviewId) {
        return await ReviewSchema_1.default.findById(reviewId);
    }
    async updateStatus(reviewId, status) {
        return await ReviewSchema_1.default.findByIdAndUpdate(reviewId, { status }, { new: true, runValidators: true });
    }
    async flagReview(reviewId, reason) {
        return await ReviewSchema_1.default.findByIdAndUpdate(reviewId, {
            status: "flagged",
            flagReason: reason,
        }, { new: true, runValidators: true });
    }
    async delete(reviewId) {
        const result = await ReviewSchema_1.default.findByIdAndDelete(reviewId);
        return result !== null;
    }
    async getReviewStats() {
        const totalReviews = await ReviewSchema_1.default.countDocuments();
        const flaggedReviews = await ReviewSchema_1.default.countDocuments({ status: "flagged" });
        const fiveStarReviews = await ReviewSchema_1.default.countDocuments({ rating: 5 });
        // Calculate average rating
        const ratingResult = await ReviewSchema_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: "$rating" },
                },
            },
        ]);
        const averageRating = ratingResult[0]?.averageRating || 0;
        // Calculate rating distribution
        const ratingDistribution = await ReviewSchema_1.default.aggregate([
            {
                $group: {
                    _id: "$rating",
                    count: { $sum: 1 },
                },
            },
        ]);
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratingDistribution.forEach((item) => {
            distribution[item._id] = item.count;
        });
        // Calculate service distribution
        const serviceDistributionResult = await ReviewSchema_1.default.aggregate([
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
        const serviceDistribution = {};
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
exports.ReviewManagementRepository = ReviewManagementRepository;
