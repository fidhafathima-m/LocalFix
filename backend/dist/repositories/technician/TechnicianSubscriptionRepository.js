"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianSubscriptionRepository = void 0;
const TechnicianSubscriptionSchema_1 = __importDefault(require("../../models/technician/TechnicianSubscriptionSchema"));
class TechnicianSubscriptionRepository {
    async create(subscriptionData) {
        // Calculate end date based on duration
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + subscriptionData.durationMonths);
        const subscription = new TechnicianSubscriptionSchema_1.default({
            ...subscriptionData,
            startDate,
            endDate,
        });
        return await subscription.save();
    }
    async findById(subscriptionId) {
        return await TechnicianSubscriptionSchema_1.default.findById(subscriptionId)
            .populate('subscriptionPlanId')
            .populate('technicianId');
    }
    async findByTechnicianId(technicianId) {
        return await TechnicianSubscriptionSchema_1.default.find({ technicianId })
            .populate('subscriptionPlanId')
            .sort({ createdAt: -1 });
    }
    async findActiveSubscription(technicianId) {
        const now = new Date();
        return await TechnicianSubscriptionSchema_1.default.findOne({
            technicianId,
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now },
        })
            .populate('subscriptionPlanId')
            .sort({ createdAt: -1 });
    }
    async updateStatus(subscriptionId, status) {
        return await TechnicianSubscriptionSchema_1.default.findByIdAndUpdate(subscriptionId, { status }, { new: true });
    }
    async findByTransactionId(transactionId) {
        return await TechnicianSubscriptionSchema_1.default.findOne({ transactionId })
            .populate('subscriptionPlanId')
            .populate('technicianId');
    }
    async countActiveSubscriptions() {
        const now = new Date();
        return await TechnicianSubscriptionSchema_1.default.countDocuments({
            status: 'active',
            startDate: { $lte: now },
            endDate: { $gte: now },
        });
    }
    async findExpiringSubscriptions(days) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + days);
        return await TechnicianSubscriptionSchema_1.default.find({
            status: 'active',
            endDate: {
                $lte: targetDate,
                $gte: new Date(),
            },
        })
            .populate('subscriptionPlanId')
            .populate('technicianId');
    }
}
exports.TechnicianSubscriptionRepository = TechnicianSubscriptionRepository;
