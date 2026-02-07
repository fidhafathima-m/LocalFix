"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardRepository = void 0;
const OrderSchema_1 = __importDefault(require("../../models/OrderSchema"));
const UserSchema_1 = __importDefault(require("../../models/UserSchema"));
const TechnicianSchema_1 = require("../../models/technician/TechnicianSchema");
const ReviewSchema_1 = __importDefault(require("../../models/ReviewSchema"));
class DashboardRepository {
    async getTotalRevenue() {
        const result = await OrderSchema_1.default.aggregate([
            {
                $match: {
                    status: 'completed',
                    'payment.status': 'paid',
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' },
                },
            },
        ]);
        return result[0]?.total || 0;
    }
    async getTotalBookings() {
        return await OrderSchema_1.default.countDocuments({
            status: { $in: ['completed', 'confirmed', 'in_progress'] },
        });
    }
    async getTotalUsers() {
        return await UserSchema_1.default.countDocuments({
            roles: 'user',
            status: 'Active',
            isDeleted: false,
        });
    }
    async getTotalTechnicians() {
        // Only count approved and active technicians
        return await TechnicianSchema_1.Technician.countDocuments({
            status: 'approved',
        });
    }
    async getRevenueGrowth() {
        const currentMonth = new Date();
        const previousMonth = new Date();
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        const [currentRevenue, previousRevenue] = await Promise.all([
            this.getMonthlyRevenue(currentMonth),
            this.getMonthlyRevenue(previousMonth),
        ]);
        if (previousRevenue === 0)
            return 100;
        return ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    }
    async getBookingsGrowth() {
        const currentMonth = new Date();
        const previousMonth = new Date();
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        const [currentBookings, previousBookings] = await Promise.all([
            OrderSchema_1.default.countDocuments({
                createdAt: {
                    $gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
                    $lt: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
                },
            }),
            OrderSchema_1.default.countDocuments({
                createdAt: {
                    $gte: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1),
                    $lt: new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1),
                },
            }),
        ]);
        if (previousBookings === 0)
            return 100;
        return ((currentBookings - previousBookings) / previousBookings) * 100;
    }
    async getUsersGrowth() {
        const currentMonth = new Date();
        const previousMonth = new Date();
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        const [currentUsers, previousUsers] = await Promise.all([
            UserSchema_1.default.countDocuments({
                createdAt: {
                    $gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
                    $lt: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
                },
                roles: 'user',
            }),
            UserSchema_1.default.countDocuments({
                createdAt: {
                    $gte: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1),
                    $lt: new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1),
                },
                roles: 'user',
            }),
        ]);
        if (previousUsers === 0)
            return 100;
        return ((currentUsers - previousUsers) / previousUsers) * 100;
    }
    async getTechniciansGrowth() {
        const currentMonth = new Date();
        const previousMonth = new Date();
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        const [currentTechs, previousTechs] = await Promise.all([
            TechnicianSchema_1.Technician.countDocuments({
                createdAt: {
                    $gte: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1),
                    $lt: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
                },
                status: 'approved', // Only approved technicians
            }),
            TechnicianSchema_1.Technician.countDocuments({
                createdAt: {
                    $gte: new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1),
                    $lt: new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1),
                },
                status: 'approved', // Only approved technicians
            }),
        ]);
        if (previousTechs === 0)
            return 100;
        return ((currentTechs - previousTechs) / previousTechs) * 100;
    }
    async getAverageOrderValueGrowth() {
        const currentMonth = new Date();
        const previousMonth = new Date();
        previousMonth.setMonth(previousMonth.getMonth() - 1);
        const [currentAOV, previousAOV] = await Promise.all([
            this.getAverageOrderValue(currentMonth),
            this.getAverageOrderValue(previousMonth),
        ]);
        if (previousAOV === 0)
            return 100;
        return ((currentAOV - previousAOV) / previousAOV) * 100;
    }
    async getRevenueTrend(period = 'monthly') {
        const months = 6;
        const result = [];
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthName = date.toLocaleString('default', { month: 'short' });
            const revenue = await this.getMonthlyRevenue(date);
            const profit = revenue * 0.4; // Assuming 40% profit margin
            result.push({
                period: monthName,
                revenue,
                profit,
            });
        }
        return result;
    }
    async getTopTechnicians(limit = 5) {
        return await OrderSchema_1.default.aggregate([
            {
                $match: {
                    status: 'completed',
                    'payment.status': 'paid',
                },
            },
            {
                $group: {
                    _id: '$technicianId',
                    jobs: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' },
                },
            },
            {
                $lookup: {
                    from: 'technicians',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'technician',
                },
            },
            {
                $unwind: {
                    path: '$technician',
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: {
                    'technician.status': 'approved', // Only include approved technicians
                },
            },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'technicianId',
                    as: 'reviews',
                },
            },
            {
                $project: {
                    technicianId: '$_id',
                    name: {
                        $ifNull: [
                            '$technician.displayName',
                            { $concat: ['Technician ', { $toString: '$_id' }] },
                        ],
                    },
                    rating: {
                        $cond: {
                            if: { $gt: [{ $size: '$reviews' }, 0] },
                            then: { $avg: '$reviews.rating' },
                            else: { $ifNull: ['$technician.averageRating', 0] },
                        },
                    },
                    jobs: 1,
                    revenue: 1,
                },
            },
            {
                $sort: { revenue: -1 },
            },
            {
                $limit: limit,
            },
        ]);
    }
    async getCustomerSatisfaction() {
        // Get ratings from Review schema - include all reviews except flagged ones
        const ratings = await ReviewSchema_1.default.aggregate([
            {
                $match: {
                    status: { $in: ['published', 'pending'] },
                    rating: { $exists: true, $ne: null },
                },
            },
            {
                $group: {
                    _id: '$rating',
                    count: { $sum: 1 },
                },
            },
            {
                $sort: { _id: -1 },
            },
        ]);
        const total = ratings.reduce((sum, item) => sum + item.count, 0);
        // Create complete rating distribution for all stars 1-5
        const completeRatings = [5, 4, 3, 2, 1].map(star => {
            const existing = ratings.find(r => r._id === star);
            const count = existing?.count || 0;
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return {
                stars: star,
                count: count,
                percentage: percentage,
            };
        });
        return completeRatings;
    }
    async getPaymentMethods() {
        const paymentMethods = await OrderSchema_1.default.aggregate([
            {
                $match: {
                    'payment.status': 'paid',
                },
            },
            {
                $group: {
                    _id: '$payment.method',
                    amount: { $sum: '$totalAmount' },
                },
            },
            {
                $project: {
                    method: '$_id',
                    amount: 1,
                    _id: 0,
                },
            },
        ]);
        // Ensure we have all payment methods, even if they have 0 amount
        const allMethods = ['online', 'cod', 'wallet'];
        const completePaymentMethods = allMethods.map(method => {
            const existing = paymentMethods.find(pm => pm.method === method);
            return {
                method: method,
                amount: existing?.amount || 0,
            };
        });
        return completePaymentMethods;
    }
    async getPaymentMethodsWithPercentages() {
        const paymentMethods = await this.getPaymentMethods();
        const totalAmount = paymentMethods.reduce((sum, method) => sum + method.amount, 0);
        const paymentMethodsWithPercentages = paymentMethods.map(method => ({
            ...method,
            percentage: totalAmount > 0 ? (method.amount / totalAmount) * 100 : 0,
        }));
        return paymentMethodsWithPercentages;
    }
    async getMonthlyRevenue(date) {
        const result = await OrderSchema_1.default.aggregate([
            {
                $match: {
                    status: 'completed',
                    'payment.status': 'paid',
                    createdAt: {
                        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' },
                },
            },
        ]);
        return result[0]?.total || 0;
    }
    async getAverageOrderValue(date) {
        const result = await OrderSchema_1.default.aggregate([
            {
                $match: {
                    status: 'completed',
                    'payment.status': 'paid',
                    createdAt: {
                        $gte: new Date(date.getFullYear(), date.getMonth(), 1),
                        $lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    average: { $avg: '$totalAmount' },
                },
            },
        ]);
        return result[0]?.average || 0;
    }
}
exports.DashboardRepository = DashboardRepository;
