import { INotification } from "../interfaces/notification/INotification";
import { NotificationResponseDto, NotificationListResponseDto } from "../interfaces/dtos/notificationDtos";

export class NotificationMapper {
  static toResponseDto(notification: INotification): NotificationResponseDto {
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
      updatedAt: notification.updatedAt.toISOString()
    };
  }

  static toListResponseDto(
    notifications: INotification[],
    total: number,
    page: number,
    limit: number
  ): NotificationListResponseDto {
    return {
      notifications: notifications.map(notification => this.toResponseDto(notification)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }
}