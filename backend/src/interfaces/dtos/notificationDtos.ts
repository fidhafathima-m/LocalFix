import { Types } from "mongoose";

export interface CreateNotificationDto {
  userId: Types.ObjectId | string;
  userType: "technician" | "customer" | "admin";
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: "low" | "medium" | "high";
  actionUrl?: string
}

export interface NotificationResponseDto {
  _id: string;
  userId: string;
  userType: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponseDto {
  notifications: NotificationResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MarkAsReadDto {
  notificationId: string;
}

export interface MarkAllAsReadDto {
  userId: string;
}

export interface GetNotificationsDto {
  userId: string;
  page?: number;
  limit?: number;
}