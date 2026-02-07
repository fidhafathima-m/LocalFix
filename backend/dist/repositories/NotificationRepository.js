"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const mongoose_1 = require("mongoose");
const NotificationSchema_1 = require("../models/NotificationSchema");
class NotificationRepository {
    async create(notificationData) {
        const notification = new NotificationSchema_1.Notification({
            ...notificationData,
            userId: typeof notificationData.userId === 'string'
                ? new mongoose_1.Types.ObjectId(notificationData.userId)
                : notificationData.userId
        });
        return await notification.save();
    }
    async findById(notificationId) {
        return await NotificationSchema_1.Notification.findById(notificationId);
    }
    async findByUser(userId, skip = 0, limit = 20) {
        return await NotificationSchema_1.Notification.find({ userId: new mongoose_1.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
    }
    async countByUser(userId) {
        return await NotificationSchema_1.Notification.countDocuments({ userId: new mongoose_1.Types.ObjectId(userId) });
    }
    async countUnreadByUser(userId) {
        return await NotificationSchema_1.Notification.countDocuments({
            userId: new mongoose_1.Types.ObjectId(userId),
            isRead: false
        });
    }
    async markAsRead(notificationId) {
        return await NotificationSchema_1.Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    }
    async markAllAsRead(userId) {
        const result = await NotificationSchema_1.Notification.updateMany({ userId: new mongoose_1.Types.ObjectId(userId), isRead: false }, { isRead: true });
        return result.modifiedCount > 0;
    }
    async update(notificationId, updateData) {
        return await NotificationSchema_1.Notification.findByIdAndUpdate(notificationId, { $set: updateData }, { new: true, runValidators: true });
    }
    async delete(notificationId) {
        const result = await NotificationSchema_1.Notification.findByIdAndDelete(notificationId);
        return result !== null;
    }
}
exports.NotificationRepository = NotificationRepository;
