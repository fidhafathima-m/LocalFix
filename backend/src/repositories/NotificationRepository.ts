// src/repositories/NotificationRepository.ts
import { FilterQuery, Types } from "mongoose";
import { INotification } from "../interfaces/notification/INotification";
import { INotificationRepository } from "../interfaces/repository/INotificationRepository";
import { CreateNotificationDto } from "../interfaces/dtos/notificationDtos";
import { Notification } from "../models/NotificationSchema";

export class NotificationRepository implements INotificationRepository {
  async create(notificationData: CreateNotificationDto): Promise<INotification> {
    const notification = new Notification({
      ...notificationData,
      userId: typeof notificationData.userId === 'string' 
        ? new Types.ObjectId(notificationData.userId) 
        : notificationData.userId
    });
    return await notification.save();
  }

  async findById(notificationId: string | Types.ObjectId): Promise<INotification | null> {
    return await Notification.findById(notificationId);
  }

  async findByUser(
    userId: string | Types.ObjectId,
    skip: number = 0,
    limit: number = 20
  ): Promise<INotification[]> {
    return await Notification.find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countByUser(userId: string | Types.ObjectId): Promise<number> {
    return await Notification.countDocuments({ userId: new Types.ObjectId(userId) });
  }

  async countUnreadByUser(userId: string | Types.ObjectId): Promise<number> {
    return await Notification.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false
    });
  }

  async markAsRead(notificationId: string | Types.ObjectId): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string | Types.ObjectId): Promise<boolean> {
    const result = await Notification.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true }
    );
    return result.modifiedCount > 0;
  }

  async update(
    notificationId: string | Types.ObjectId,
    updateData: Partial<INotification>
  ): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async delete(notificationId: string | Types.ObjectId): Promise<boolean> {
    const result = await Notification.findByIdAndDelete(notificationId);
    return result !== null;
  }
}