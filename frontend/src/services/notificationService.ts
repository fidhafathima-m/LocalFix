/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Notification } from "../interface/user/INotification";
import { notificationAPI } from "./common/notificationApi";

export class NotificationService {
  static async getNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<Notification[]> {
    try {
      const response = await notificationAPI.getNotifications(
        userId,
        page,
        limit
      );
      const result = this.handleResponse(response);
      return result.notifications || [];
    } catch (error: any) {
      throw this.handleError(error, "Failed to fetch notifications");
    }
  }

  static async markAsRead(notificationId: string): Promise<Notification> {
    try {
      const response = await notificationAPI.markAsRead(notificationId);
      const result = this.handleResponse(response);
      return result.notification;
    } catch (error: any) {
      throw this.handleError(error, "Failed to mark notification as read");
    }
  }

  static async markAllAsRead(
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await notificationAPI.markAllAsRead(userId);
      return this.handleResponse(response);
    } catch (error: any) {
      throw this.handleError(error, "Failed to mark all notifications as read");
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await notificationAPI.getUnreadCount(userId);
      const result = this.handleResponse(response);
      return result.count || 0;
    } catch (error: any) {
      throw this.handleError(error, "Failed to get unread count");
    }
  }

  private static handleResponse(response: any) {
    if (response.success === false) {
      throw new Error(response.message || "Operation failed");
    }

    // Return the data directly for easier consumption
    return response.data || response;
  }

  private static handleError(error: any, defaultMessage: string) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(defaultMessage);
  }
}
