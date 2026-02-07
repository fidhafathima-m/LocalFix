"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianManagementSubscriptionRepository = void 0;
const mongoose_1 = require("mongoose");
const TechnicianSubscriptionSchema_1 = __importDefault(require("../../models/technician/TechnicianSubscriptionSchema"));
const SubscriptionSchema_1 = __importDefault(require("../../models/SubscriptionSchema"));
const TechnicianSchema_1 = require("../../models/technician/TechnicianSchema");
class TechnicianManagementSubscriptionRepository {
    async findSubscriptions(filters) {
        try {
            const query = {};
            // Build filter query
            if (filters.status) {
                query.status = filters.status;
            }
            if (filters.technicianId) {
                query.technicianId = new mongoose_1.Types.ObjectId(filters.technicianId);
            }
            if (filters.subscriptionPlanId) {
                query.subscriptionPlanId = new mongoose_1.Types.ObjectId(filters.subscriptionPlanId);
            }
            const skip = (filters.page - 1) * filters.limit;
            const [subscriptions, total] = await Promise.all([
                TechnicianSubscriptionSchema_1.default.find(query)
                    .populate('technicianId', 'displayName email phone')
                    .populate('subscriptionPlanId', 'name description price durationMonths')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(filters.limit)
                    .exec(),
                TechnicianSubscriptionSchema_1.default.countDocuments(query),
            ]);
            return { subscriptions, total };
        }
        catch (error) {
            console.error('Error finding subscriptions:', error);
            throw new Error('Failed to retrieve subscriptions');
        }
    }
    async findSubscriptionById(id) {
        try {
            const subscription = await TechnicianSubscriptionSchema_1.default.findById(id)
                .populate('technicianId', 'displayName email phone profilePictureUrl')
                .populate('subscriptionPlanId', 'name description price durationMonths features')
                .exec();
            return subscription;
        }
        catch (error) {
            console.error('Error finding subscription by ID:', error);
            throw new Error('Failed to retrieve subscription');
        }
    }
    async findCurrentSubscription(userId) {
        try {
            const currentDate = new Date();
            // Convert to ObjectId if it's a string
            const userIdObj = typeof userId === 'string' ? new mongoose_1.Types.ObjectId(userId) : userId;
            // First, find the technician document to get the userId
            const technician = await TechnicianSchema_1.Technician.findOne({ _id: userIdObj });
            if (!technician) {
                return null;
            }
            if (!technician.userId) {
                return null;
            }
            const subscription = await TechnicianSubscriptionSchema_1.default.findOne({
                technicianId: technician.userId,
                status: 'active',
                startDate: { $lte: currentDate },
                endDate: { $gte: currentDate },
            })
                .populate('subscriptionPlanId', 'name description price durationMonths features')
                .sort({ createdAt: -1 })
                .exec();
            return subscription;
        }
        catch (error) {
            console.error('[REPO DEBUG] Error finding current subscription:', error);
            throw new Error('Failed to retrieve current subscription');
        }
    }
    async findSubscriptionsByTechnician(userId, page, limit) {
        try {
            const skip = (page - 1) * limit;
            // Convert to ObjectId if it's a string
            const userIdObj = typeof userId === 'string' ? new mongoose_1.Types.ObjectId(userId) : userId;
            // First, find the technician document to get the userId
            const technician = await TechnicianSchema_1.Technician.findOne({ _id: userIdObj });
            if (!technician) {
                return { subscriptions: [], total: 0 };
            }
            if (!technician.userId) {
                return { subscriptions: [], total: 0 };
            }
            const [subscriptions, total] = await Promise.all([
                TechnicianSubscriptionSchema_1.default.find({
                    technicianId: technician.userId,
                })
                    .populate('subscriptionPlanId', 'name description price durationMonths')
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .exec(),
                TechnicianSubscriptionSchema_1.default.countDocuments({
                    technicianId: technician.userId,
                }),
            ]);
            return { subscriptions, total };
        }
        catch (error) {
            console.error('[REPO DEBUG] Error finding subscriptions by technician:', error);
            throw new Error('Failed to retrieve technician subscriptions');
        }
    }
    async createSubscription(data) {
        try {
            const subscription = new TechnicianSubscriptionSchema_1.default({
                _id: new mongoose_1.Types.ObjectId(),
                technicianId: data.technicianId,
                subscriptionPlanId: data.subscriptionPlanId,
                amount: data.amount,
                durationMonths: data.durationMonths,
                commissionRate: data.commissionRate,
                startDate: data.startDate,
                endDate: data.endDate,
                paymentMethod: data.paymentMethod,
                transactionId: data.transactionId,
                status: data.status,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            const savedSubscription = await subscription.save();
            // Populate the saved subscription
            const populatedSubscription = await TechnicianSubscriptionSchema_1.default.findById(savedSubscription._id)
                .populate('technicianId', 'displayName email phone')
                .populate('subscriptionPlanId', 'name description price durationMonths features')
                .exec();
            return populatedSubscription;
        }
        catch (error) {
            console.error('Error creating subscription:', error);
            throw new Error('Failed to create subscription');
        }
    }
    async updateSubscriptionStatus(id, status, reason) {
        try {
            const updateData = {
                status,
                updatedAt: new Date(),
            };
            if (reason) {
                updateData.cancellationReason = reason;
            }
            if (status === 'cancelled') {
                updateData.cancelledAt = new Date();
            }
            const subscription = await TechnicianSubscriptionSchema_1.default.findByIdAndUpdate(id, updateData, { new: true })
                .populate('technicianId', 'displayName email phone')
                .populate('subscriptionPlanId', 'name description price durationMonths features')
                .exec();
            return subscription;
        }
        catch (error) {
            console.error('Error updating subscription status:', error);
            throw new Error('Failed to update subscription status');
        }
    }
    async findSubscriptionPlanById(id) {
        try {
            const subscriptionPlan = await SubscriptionSchema_1.default.findById(id).exec();
            return subscriptionPlan;
        }
        catch (error) {
            console.error('Error finding subscription plan by ID:', error);
            throw new Error('Failed to retrieve subscription plan');
        }
    }
    async getSubscriptionStats() {
        try {
            const currentDate = new Date();
            const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
            const [totalSubscriptions, activeSubscriptions, expiredSubscriptions, cancelledSubscriptions, totalRevenue, monthlyRevenue,] = await Promise.all([
                // Total subscriptions
                TechnicianSubscriptionSchema_1.default.countDocuments(),
                // Active subscriptions
                TechnicianSubscriptionSchema_1.default.countDocuments({
                    status: 'active',
                    startDate: { $lte: currentDate },
                    endDate: { $gte: currentDate },
                }),
                // Expired subscriptions
                TechnicianSubscriptionSchema_1.default.countDocuments({
                    status: 'expired',
                }),
                // Cancelled subscriptions
                TechnicianSubscriptionSchema_1.default.countDocuments({
                    status: 'cancelled',
                }),
                // Total revenue
                TechnicianSubscriptionSchema_1.default.aggregate([
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' },
                        },
                    },
                ]),
                // Monthly revenue
                TechnicianSubscriptionSchema_1.default.aggregate([
                    {
                        $match: {
                            createdAt: {
                                $gte: startOfMonth,
                                $lte: endOfMonth,
                            },
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' },
                        },
                    },
                ]),
            ]);
            return {
                totalSubscriptions,
                activeSubscriptions,
                expiredSubscriptions,
                cancelledSubscriptions,
                totalRevenue: totalRevenue[0]?.total || 0,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
            };
        }
        catch (error) {
            console.error('Error getting subscription stats:', error);
            throw new Error('Failed to retrieve subscription statistics');
        }
    }
    async updateExpiredSubscriptions() {
        try {
            const currentDate = new Date();
            await TechnicianSubscriptionSchema_1.default.updateMany({
                status: 'active',
                endDate: { $lt: currentDate },
            }, {
                $set: {
                    status: 'expired',
                    updatedAt: currentDate,
                },
            });
        }
        catch (error) {
            console.error('Error updating expired subscriptions:', error);
            throw new Error('Failed to update expired subscriptions');
        }
    }
}
exports.TechnicianManagementSubscriptionRepository = TechnicianManagementSubscriptionRepository;
