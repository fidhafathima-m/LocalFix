import { Types } from "mongoose";

// Base interface for database operations
export interface INotificationBase {
  userId: Types.ObjectId;
  userType: "technician" | "customer" | "admin";
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  priority: "low" | "medium" | "high";
  createdAt: Date;
  updatedAt: Date;
}

// Database interface (with ObjectId)
export interface INotification extends INotificationBase {
  _id: Types.ObjectId;
}

// Frontend interface (with string IDs)
export interface INotificationFrontend {
  _id: string;
  userId: string;
  userType: "technician" | "customer" | "admin";
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

// DTO for creating notifications
export interface CreateNotificationDto {
  userId: Types.ObjectId | string;
  userType: "technician" | "customer" | "admin";
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority?: "low" | "medium" | "high";
}

// Response interface
export interface NotificationResponse {
  success: boolean;
  message: string;
  data?: {
    notification?: INotificationFrontend;
    notifications?: INotificationFrontend[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}
