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
exports.OrderRepository = void 0;
const OrderSchema_1 = __importDefault(require("../../models/OrderSchema"));
const BookingSchema_1 = __importStar(require("../../models/BookingSchema"));
const mongoose_1 = require("mongoose");
class OrderRepository {
    async createFromBooking(bookingId, paymentData) {
        try {
            const booking = await BookingSchema_1.default.findById(bookingId)
                .populate('userId')
                .populate('technicianId')
                .populate('addressId')
                .exec();
            if (!booking) {
                throw new Error('Booking not found');
            }
            // Get address details
            const address = booking.addressId;
            // Check if address is properly populated
            if (!(0, BookingSchema_1.isAddressPopulated)(address)) {
                console.error('Address not properly populated:', address);
                throw new Error('Address details not found or not populated');
            }
            // Generate order code manually
            const orderCount = await OrderSchema_1.default.countDocuments();
            const orderCode = `ORD${String(orderCount + 1).padStart(6, '0')}`;
            const userId = booking.userId._id || booking.userId;
            let orderStatus = 'pending';
            if (paymentData.status === 'paid') {
                orderStatus = 'pending';
            }
            else if (paymentData.status === 'failed') {
                orderStatus = 'cancelled';
            }
            // Create order data
            const orderData = {
                orderCode: orderCode,
                bookingId: new mongoose_1.Types.ObjectId(bookingId),
                userId: userId,
                technicianId: booking.technicianId._id,
                serviceName: booking.serviceName,
                serviceId: booking.serviceId,
                problemDescription: booking.notes,
                scheduledAt: booking.scheduledAt,
                timeSlot: booking.timeSlot,
                address: {
                    label: address.label,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    landmark: address.landmark,
                },
                payment: {
                    method: paymentData.method,
                    amount: paymentData.amount,
                    status: paymentData.status,
                    transactionId: paymentData.transactionId,
                    paidAt: paymentData.paidAt,
                },
                totalAmount: paymentData.amount,
                orderItems: [],
                status: orderStatus,
                history: [
                    {
                        status: orderStatus,
                        description: paymentData.method === 'cod'
                            ? 'Order confirmed with cash on delivery'
                            : 'Order created with online payment',
                        updatedBy: 'system',
                        timestamp: new Date(),
                    },
                ],
            };
            const order = new OrderSchema_1.default(orderData);
            const savedOrder = await order.save();
            return savedOrder;
        }
        catch (error) {
            console.error('Error creating order from booking:', error);
            return null;
        }
    }
    async findById(orderId) {
        return await OrderSchema_1.default.findById(orderId)
            .populate('userId', 'fullName email phone')
            .populate('technicianId', 'displayName profilePictureUrl averageRating ratingCount services skills')
            .exec();
    }
    async findByUserId(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            OrderSchema_1.default.find({ userId: new mongoose_1.Types.ObjectId(userId) })
                .populate('technicianId', 'displayName profilePictureUrl averageRating ratingCount services skills')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            OrderSchema_1.default.countDocuments({ userId: new mongoose_1.Types.ObjectId(userId) }),
        ]);
        return { orders, total };
    }
    async updateStatus(orderId, status, updatedBy, reason) {
        const order = await OrderSchema_1.default.findById(orderId);
        if (!order)
            return null;
        // Add to history
        const description = reason
            ? `Status updated to ${status}: ${reason}`
            : `Status updated to ${status}`;
        order.history.push({
            status,
            description,
            updatedBy: updatedBy,
            timestamp: new Date(),
        });
        order.status = status;
        // Handle cancellation
        if (status === 'cancelled' && reason) {
            order.cancellation = {
                reason,
                cancelledBy: updatedBy,
                cancelledAt: new Date(),
                refundAmount: order.payment.method === 'online' ? order.totalAmount : 0,
            };
            // Update payment status for refund
            if (order.payment.method === 'online') {
                order.payment.status = 'refunded';
            }
        }
        return await order.save();
    }
    async addOrderItem(orderId, itemData) {
        const order = await OrderSchema_1.default.findById(orderId);
        if (!order)
            return null;
        order.orderItems.push({
            ...itemData,
            _id: new mongoose_1.Types.ObjectId(),
            createdAt: new Date(),
            updatedAt: new Date(),
        });
        // Recalculate total amount
        order.totalAmount = order.orderItems.reduce((total, item) => total + item.totalPrice, 0);
        return await order.save();
    }
    async findByTechnicianId(technicianId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            OrderSchema_1.default.find({ technicianId: new mongoose_1.Types.ObjectId(technicianId) })
                .populate('userId', 'fullName email phone')
                .populate('technicianId', 'displayName profilePictureUrl averageRating ratingCount services skills')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            OrderSchema_1.default.countDocuments({ technicianId: new mongoose_1.Types.ObjectId(technicianId) }),
        ]);
        return { orders, total };
    }
    async getTechnicianStats(technicianId) {
        const technicianObjectId = new mongoose_1.Types.ObjectId(technicianId);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const [totalOrders, pendingOrders, inProgressOrders, completedOrders, monthlyEarningsResult,] = await Promise.all([
            // Total orders
            OrderSchema_1.default.countDocuments({ technicianId: technicianObjectId }),
            // Pending orders
            OrderSchema_1.default.countDocuments({
                technicianId: technicianObjectId,
                status: 'pending',
            }),
            // In progress orders
            OrderSchema_1.default.countDocuments({
                technicianId: technicianObjectId,
                status: 'in_progress',
            }),
            // Completed orders
            OrderSchema_1.default.countDocuments({
                technicianId: technicianObjectId,
                status: 'completed',
            }),
            // Monthly earnings (only from completed orders)
            OrderSchema_1.default.aggregate([
                {
                    $match: {
                        technicianId: technicianObjectId,
                        status: 'completed',
                        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalEarnings: { $sum: '$totalAmount' },
                    },
                },
            ]),
        ]);
        const monthlyEarnings = monthlyEarningsResult.length > 0
            ? monthlyEarningsResult[0].totalEarnings
            : 0;
        return {
            totalOrders,
            pendingOrders,
            inProgressOrders,
            completedOrders,
            monthlyEarnings,
        };
    }
    async rescheduleOrder(orderId, newDate, newTimeSlot, updatedBy) {
        try {
            const order = await OrderSchema_1.default.findById(orderId);
            if (!order)
                return null;
            // Store old values for history
            const oldScheduledAt = order.scheduledAt;
            const oldTimeSlot = order.timeSlot;
            // Update order with new schedule
            order.scheduledAt = new Date(newDate);
            order.timeSlot = newTimeSlot;
            order.history.push({
                status: order.status,
                description: `Order rescheduled from ${oldScheduledAt.toLocaleDateString()} ${oldTimeSlot} to ${new Date(newDate).toLocaleDateString()} ${newTimeSlot}`,
                updatedBy: 'user',
                timestamp: new Date(),
            });
            order.rescheduleInfo = {
                rescheduledAt: new Date(),
                rescheduledBy: updatedBy,
                previousScheduledAt: oldScheduledAt,
                previousTimeSlot: oldTimeSlot,
                rescheduleCount: (order.rescheduleInfo?.rescheduleCount || 0) + 1,
            };
            const savedOrder = await order.save();
            // Update the associated booking if it exists
            await this.updateBookingSchedule(order.bookingId.toString(), newDate, newTimeSlot);
            return savedOrder;
        }
        catch (error) {
            console.error('Error rescheduling order:', error);
            return null;
        }
    }
    async updateBookingSchedule(bookingId, newDate, newTimeSlot) {
        try {
            await BookingSchema_1.default.findByIdAndUpdate(bookingId, {
                scheduledAt: new Date(newDate),
                timeSlot: newTimeSlot,
                updatedAt: new Date(),
            });
        }
        catch (error) {
            console.error('Error updating booking schedule:', error);
            // Don't throw error as order reschedule should still succeed
        }
    }
    async findConflictingOrders(technicianId, date, timeSlot, excludeOrderId) {
        try {
            const scheduledAt = new Date(date);
            // Build query
            const query = {
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
                scheduledAt: {
                    $gte: new Date(scheduledAt.setHours(0, 0, 0, 0)),
                    $lt: new Date(scheduledAt.setHours(23, 59, 59, 999)),
                },
                timeSlot: timeSlot,
                status: { $in: ['pending', 'confirmed', 'accepted', 'in_progress'] },
            };
            // Exclude current order if provided
            if (excludeOrderId) {
                query._id = { $ne: new mongoose_1.Types.ObjectId(excludeOrderId) };
            }
            return await OrderSchema_1.default.find(query).exec();
        }
        catch (error) {
            console.error('Error finding conflicting orders:', error);
            return [];
        }
    }
    async findByBookingId(bookingId) {
        const order = await OrderSchema_1.default.findOne({
            bookingId: new mongoose_1.Types.ObjectId(bookingId),
        })
            .populate('technicianId', 'displayName profilePictureUrl averageRating ratingCount services skills phone')
            .populate('userId', 'fullName email phone')
            .populate('bookingId', 'bookingCode')
            .exec();
        return order;
    }
    async updatePaymentDetails(orderId, paymentData) {
        try {
            const updateData = {
                'payment.method': paymentData.method,
                'payment.amount': paymentData.amount,
                'payment.status': paymentData.status,
                'payment.paidAt': paymentData.paidAt || new Date(),
                totalAmount: paymentData.amount,
                updatedAt: new Date(),
            };
            if (paymentData.transactionId) {
                updateData['payment.transactionId'] = paymentData.transactionId;
            }
            let orderStatus = 'pending';
            if (paymentData.status === 'paid') {
                orderStatus = 'confirmed';
            }
            else if (paymentData.status === 'failed') {
                orderStatus = 'cancelled';
            }
            updateData.status = orderStatus;
            // Add to history
            const historyEntry = {
                status: orderStatus,
                description: `Payment ${paymentData.status} via ${paymentData.method}`,
                updatedBy: 'system',
                timestamp: new Date(),
            };
            const updatedOrder = await OrderSchema_1.default.findByIdAndUpdate(new mongoose_1.Types.ObjectId(orderId), {
                $set: updateData,
                $push: { history: historyEntry },
            }, { new: true })
                .populate('userId', 'fullName email phone')
                .populate('technicianId', 'displayName profilePictureUrl services')
                .exec();
            return updatedOrder;
        }
        catch (error) {
            console.error('Error updating payment details:', error);
            return null;
        }
    }
    async getOrdersByTechnicianAndDate(technicianId, date) {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            const orders = await OrderSchema_1.default.find({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
                scheduledAt: {
                    $gte: startOfDay,
                    $lte: endOfDay,
                },
                status: { $in: ['confirmed', 'accepted', 'scheduled'] },
            })
                .populate('userId', 'fullName email phone')
                .populate('technicianId', 'displayName profilePictureUrl services')
                .exec();
            return orders;
        }
        catch (error) {
            console.error('Error fetching orders by technician and date:', error);
            return [];
        }
    }
}
exports.OrderRepository = OrderRepository;
