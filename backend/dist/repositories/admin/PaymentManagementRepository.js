"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentManagementRepository = void 0;
const PaymentSchema_1 = __importDefault(require("../../models/PaymentSchema"));
const OrderSchema_1 = __importDefault(require("../../models/OrderSchema"));
class PaymentManagementRepository {
    async create(paymentData) {
        const payment = new PaymentSchema_1.default(paymentData);
        return await payment.save();
    }
    async findById(paymentId) {
        return await PaymentSchema_1.default.findById(paymentId)
            .populate('userId', 'fullName email phone')
            .populate({
            path: 'bookingId',
            select: 'bookingCode serviceName addressId',
            populate: {
                path: 'addressId',
                model: 'UserAddress',
                select: 'label street city state pincode landmark',
            },
        })
            .exec();
    }
    async findAll(filter = {}, skip = 0, limit = 10) {
        const payments = await PaymentSchema_1.default.find(filter)
            .populate('userId', 'fullName email phone')
            .populate({
            path: 'bookingId',
            select: 'bookingCode serviceName addressId',
            populate: {
                path: 'addressId',
                model: 'UserAddress',
                select: 'label street city state pincode landmark',
            },
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
        const paymentsWithOrderData = await Promise.all(payments.map(async (payment) => {
            // Find order by bookingId to get orderCode
            const order = await OrderSchema_1.default.findOne({ bookingId: payment.bookingId }, { orderCode: 1 }).exec();
            const paymentWithOrder = payment.toObject();
            if (order) {
                paymentWithOrder.orderCode = order.orderCode;
            }
            else {
                paymentWithOrder.orderCode = 'Booked';
            }
            return paymentWithOrder;
        }));
        return paymentsWithOrderData;
    }
    async findByProviderOrderId(providerOrderId) {
        const payment = await PaymentSchema_1.default.findOne({ providerOrderId })
            .populate('userId', 'fullName email phone')
            .populate({
            path: 'bookingId',
            select: 'bookingCode serviceName addressId',
            populate: {
                path: 'addressId',
                model: 'UserAddress',
                select: 'label street city state pincode landmark',
            },
        })
            .exec();
        if (payment && payment.bookingId) {
            const order = await OrderSchema_1.default.findOne({ bookingId: payment.bookingId }, { orderCode: 1 }).exec();
            const paymentWithOrder = payment.toObject();
            paymentWithOrder.orderCode = order?.orderCode || 'Booked';
            return paymentWithOrder;
        }
        return payment;
    }
    async findByUserId(userId) {
        const payments = await PaymentSchema_1.default.find({ userId })
            .populate('userId', 'fullName email phone')
            .populate({
            path: 'bookingId',
            select: 'bookingCode serviceName addressId',
            populate: {
                path: 'addressId',
                model: 'UserAddress',
                select: 'label street city state pincode landmark',
            },
        })
            .sort({ createdAt: -1 })
            .exec();
        const paymentsWithOrderData = await Promise.all(payments.map(async (payment) => {
            const order = await OrderSchema_1.default.findOne({ bookingId: payment.bookingId }, { orderCode: 1 }).exec();
            const paymentWithOrder = payment.toObject();
            paymentWithOrder.orderCode = order?.orderCode || 'Booked';
            return paymentWithOrder;
        }));
        return paymentsWithOrderData;
    }
    async findByBookingId(bookingId) {
        const payment = await PaymentSchema_1.default.findOne({ bookingId })
            .populate('userId', 'fullName email phone')
            .populate({
            path: 'bookingId',
            select: 'bookingCode serviceName addressId',
            populate: {
                path: 'addressId',
                model: 'UserAddress',
                select: 'label street city state pincode landmark',
            },
        })
            .exec();
        if (payment) {
            const order = await OrderSchema_1.default.findOne({ bookingId }, { orderCode: 1 }).exec();
            const paymentWithOrder = payment.toObject();
            paymentWithOrder.orderCode = order?.orderCode || 'Booked';
            return paymentWithOrder;
        }
        return payment;
    }
    async update(paymentId, updateData) {
        return await PaymentSchema_1.default.findByIdAndUpdate(paymentId, { $set: updateData }, { new: true, runValidators: true })
            .populate('userId', 'fullName email phone')
            .populate({
            path: 'bookingId',
            select: 'bookingCode serviceName addressId',
            populate: {
                path: 'addressId',
                model: 'UserAddress',
                select: 'label street city state pincode landmark',
            },
        })
            .exec();
    }
    async delete(paymentId) {
        const result = await PaymentSchema_1.default.findByIdAndDelete(paymentId);
        return result !== null;
    }
    async count(filter) {
        return await PaymentSchema_1.default.countDocuments(filter);
    }
    async search(query, limit = 10, filters) {
        const searchRegex = new RegExp(query, 'i');
        // Build match stage with search and additional filters
        const matchStage = {
            $or: [
                { providerOrderId: searchRegex },
                { providerPaymentId: searchRegex },
                { 'user.fullName': searchRegex },
                { 'user.email': searchRegex },
                { 'booking.bookingCode': searchRegex },
                { 'booking.serviceName': searchRegex },
                { 'order.orderCode': searchRegex },
            ],
        };
        // Add status filter if provided
        if (filters?.status) {
            matchStage.status = filters.status;
        }
        // Add date range filter if provided
        if (filters?.createdAt) {
            matchStage.createdAt = filters.createdAt;
        }
        const payments = await PaymentSchema_1.default.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            {
                $lookup: {
                    from: 'bookings',
                    localField: 'bookingId',
                    foreignField: '_id',
                    as: 'booking',
                },
            },
            {
                $lookup: {
                    from: 'useraddresses',
                    localField: 'booking.addressId',
                    foreignField: '_id',
                    as: 'address',
                },
            },
            {
                $lookup: {
                    from: 'orders',
                    localField: 'bookingId',
                    foreignField: 'bookingId',
                    as: 'order',
                },
            },
            {
                $match: matchStage,
            },
            {
                $project: {
                    _id: 1,
                    bookingId: 1,
                    userId: 1,
                    paymentProvider: 1,
                    providerOrderId: 1,
                    providerPaymentId: 1,
                    amount: 1,
                    currency: 1,
                    type: 1,
                    status: 1,
                    initiatedAt: 1,
                    confirmedAt: 1,
                    refundedAt: 1,
                    rawResponse: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    // extract user data from the array
                    userName: { $arrayElemAt: ['$user.fullName', 0] },
                    userEmail: { $arrayElemAt: ['$user.email', 0] },
                    userPhone: { $arrayElemAt: ['$user.phone', 0] },
                    // extract booking data from the array
                    bookingCode: { $arrayElemAt: ['$booking.bookingCode', 0] },
                    serviceName: { $arrayElemAt: ['$booking.serviceName', 0] },
                    // Extract order data
                    orderId: {
                        $cond: {
                            if: { $gt: [{ $size: '$order' }, 0] },
                            then: { $arrayElemAt: ['$order.orderCode', 0] },
                            else: 'Booked',
                        },
                    },
                    // Extract address data
                    address: {
                        $cond: {
                            if: { $gt: [{ $size: '$address' }, 0] },
                            then: { $arrayElemAt: ['$address', 0] },
                            else: {
                                label: '',
                                street: '',
                                city: '',
                                state: '',
                                pincode: '',
                                landmark: '',
                            },
                        },
                    },
                },
            },
            { $limit: limit },
            { $sort: { createdAt: -1 } },
        ]);
        const transformedPayments = payments.map(payment => ({
            ...payment,
            id: payment._id.toString(),
        }));
        return transformedPayments;
    }
    async getPaymentStats() {
        const [totalRevenueResult, pendingPaymentsCount, failedPaymentsCount, totalPaymentsCount,] = await Promise.all([
            PaymentSchema_1.default.aggregate([
                { $match: { status: 'success' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
            PaymentSchema_1.default.countDocuments({ status: 'pending' }),
            PaymentSchema_1.default.countDocuments({ status: { $in: ['failed', 'refunded'] } }),
            PaymentSchema_1.default.countDocuments(),
        ]);
        const totalRevenue = totalRevenueResult[0]?.total || 0;
        const platformCommission = Math.round(totalRevenue * 0.1);
        return {
            totalRevenue,
            platformCommission,
            pendingPayments: pendingPaymentsCount,
            failedPayments: failedPaymentsCount,
            totalPayments: totalPaymentsCount,
        };
    }
}
exports.PaymentManagementRepository = PaymentManagementRepository;
