"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRepository = void 0;
const PaymentSchema_1 = __importDefault(require("../../models/PaymentSchema"));
const mongoose_1 = require("mongoose");
class PaymentRepository {
    async create(paymentData) {
        const payment = new PaymentSchema_1.default(paymentData);
        return await payment.save();
    }
    async findById(paymentId) {
        return await PaymentSchema_1.default.findById(paymentId)
            .populate('bookingId')
            .populate('userId')
            .exec();
    }
    async findByOrderId(orderId) {
        return await PaymentSchema_1.default.findOne({ providerOrderId: orderId })
            .populate('bookingId')
            .populate('userId')
            .exec();
    }
    async findByBookingId(bookingId) {
        return await PaymentSchema_1.default.findOne({ bookingId: new mongoose_1.Types.ObjectId(bookingId) })
            .populate('userId')
            .exec();
    }
    async update(paymentId, updateData) {
        return await PaymentSchema_1.default.findByIdAndUpdate(new mongoose_1.Types.ObjectId(paymentId), { $set: updateData }, { new: true }).exec();
    }
    async updateByOrderId(orderId, updateData) {
        return await PaymentSchema_1.default.findOneAndUpdate({ providerOrderId: orderId }, { $set: updateData }, { new: true }).exec();
    }
    async findByUserId(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [payments, total] = await Promise.all([
            PaymentSchema_1.default.find({ userId: new mongoose_1.Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('bookingId')
                .exec(),
            PaymentSchema_1.default.countDocuments({ userId: new mongoose_1.Types.ObjectId(userId) })
        ]);
        return { payments, total };
    }
}
exports.PaymentRepository = PaymentRepository;
