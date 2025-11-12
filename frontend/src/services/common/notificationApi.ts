/* eslint-disable @typescript-eslint/no-explicit-any */
import type { 
  NotificationListResponse,
  NotificationResponse 
} from "../../interface/user/INotification";
import { NOTIFICATION_ROUTES } from "../../routes/notificationRoutes";
import api from "../../utils/axiosConfig";

const normalizeResponse = (response: any) => {
  const responseData = response.data || response;

  return {
    success: responseData.success,
    message: responseData.message,
    data: responseData.data,
    statusCode: responseData.statusCode || 200,
    error: responseData.error,
  };
};

export const notificationAPI = {
  getNotifications: async (
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ) => {
    try {
      const response = await api.get<NotificationListResponse>(NOTIFICATION_ROUTES.BASE, {
        params: { userId, page, limit }
      });

      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to get notifications",
        error: "Network error",
        data: null,
        statusCode: 500,
      };
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      const response = await api.put<NotificationResponse>(NOTIFICATION_ROUTES.MARK_AS_READ(notificationId));

      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to mark notification as read",
        error: "Network error",
        data: null,
        statusCode: 500,
      };
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      const response = await api.put<{
        success: boolean;
        message: string;
        data: any;
      }>(NOTIFICATION_ROUTES.MARK_ALL_READ, { userId });

      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to mark all notifications as read",
        error: "Network error",
        data: null,
        statusCode: 500,
      };
    }
  },

  getUnreadCount: async (userId: string) => {
    try {
      const response = await api.get<{
        success: boolean;
        message: string;
        data: { count: number };
      }>(NOTIFICATION_ROUTES.UNREAD_COUNT, {
        params: { userId }
      });

      return normalizeResponse(response);
    } catch (error: any) {
      if (error.response?.data) {
        return normalizeResponse(error.response.data);
      }
      return {
        success: false,
        message: error.message || "Failed to get unread count",
        error: "Network error",
        data: null,
        statusCode: 500,
      };
    }
  },
};