"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNotificationListResponseDto = exports.toNotificationResponseDto = void 0;
const toNotificationResponseDto = (notification) => {
    return {
        _id: notification._id.toString(),
        userId: notification.userId.toString(),
        userType: notification.userType,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        isRead: notification.isRead,
        priority: notification.priority,
        createdAt: notification.createdAt.toISOString(),
        updatedAt: notification.updatedAt.toISOString(),
    };
};
exports.toNotificationResponseDto = toNotificationResponseDto;
const toNotificationListResponseDto = (notifications, total, page, limit) => {
    return {
        notifications: notifications.map((notification) => (0, exports.toNotificationResponseDto)(notification)),
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1,
        },
    };
};
exports.toNotificationListResponseDto = toNotificationListResponseDto;
