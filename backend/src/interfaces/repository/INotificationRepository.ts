// src/interfaces/repository/INotificationRepository.ts
import { FilterQuery, Types } from "mongoose";
import { INotification } from "../../interfaces/notification/INotification";
import { CreateNotificationDto } from "../../interfaces/dtos/notificationDtos";

export interface INotificationRepository {
  create(notificationData: CreateNotificationDto): Promise<INotification>;
  findById(notificationId: string | Types.ObjectId): Promise<INotification | null>;
  findByUser(
    userId: string | Types.ObjectId,
    skip?: number,
    limit?: number
  ): Promise<INotification[]>;
  countByUser(userId: string | Types.ObjectId): Promise<number>;
  countUnreadByUser(userId: string | Types.ObjectId): Promise<number>;
  markAsRead(notificationId: string | Types.ObjectId): Promise<INotification | null>;
  markAllAsRead(userId: string | Types.ObjectId): Promise<boolean>;
  update(
    notificationId: string | Types.ObjectId,
    updateData: Partial<INotification>
  ): Promise<INotification | null>;
  delete(notificationId: string | Types.ObjectId): Promise<boolean>;
}