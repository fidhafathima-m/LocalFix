/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IMessage } from "../../interface/user/IMessage";
import type { IMessageRoom } from "../../interface/user/IMessageRoom";
import { MESSAGE_ROUTES } from "../../routes/messageRoutes";
import api from "../../utils/axiosConfig";

export const messageAPI = {
  getOrderMessages: async (
    orderId: string,
    limit: number = 50
  ): Promise<{ success: boolean; data?: IMessage[]; message?: string }> => {
    try {
      const response = await api.get(
        MESSAGE_ROUTES.GET_ORDER_MESSAGES(orderId),
        {
          params: { limit },
        }
      );
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message,
      };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch messages",
      };
    }
  },

  getUserConversations: async (): Promise<{
    success: boolean;
    data?: IMessageRoom[];
    message?: string;
  }> => {
    try {
      const response = await api.get(MESSAGE_ROUTES.GET_USER_CONVERSATIONS);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message,
      };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch conversations",
      };
    }
  },

  getTechnicianConversations: async (): Promise<{
    success: boolean;
    data?: IMessageRoom[];
    message?: string;
  }> => {
    try {
      const response = await api.get(
        MESSAGE_ROUTES.GET_TECHNICIAN_CONVERSATIONS
      );
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message,
      };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch conversations",
      };
    }
  },

  markAsRead: async (
    orderId: string,
    userType: "user" | "technician"
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post(MESSAGE_ROUTES.MARK_AS_READ, {
        orderId,
        userType,
      });
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Failed to mark messages as read",
      };
    }
  },

  getUnreadCount: async (
    userType: "user" | "technician"
  ): Promise<{
    success: boolean;
    data?: { count: number };
    message?: string;
  }> => {
    try {
      const response = await api.get(MESSAGE_ROUTES.GET_UNREAD_COUNT, {
        params: { userType },
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message,
      };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Failed to fetch unread count",
      };
    }
  },

  initializeChatRoom: async (
    orderId: string,
    userId: string,
    technicianId: string
  ): Promise<{ success: boolean; data?: IMessageRoom; message?: string }> => {
    try {
      const response = await api.post(MESSAGE_ROUTES.INITIALIZE_CHAT_ROOM, {
        orderId,
        userId,
        technicianId,
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message,
      };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Failed to initialize chat room",
      };
    }
  },

  sendMessage: async (messageData: {
    orderId: string;
    senderId: string;
    senderType: "user" | "technician";
    receiverId: string;
    receiverType: "user" | "technician";
    message: string;
    messageType?: "text" | "image" | "file";
  }): Promise<{ success: boolean; data?: IMessage; message?: string }> => {
    try {
      const response = await api.post(MESSAGE_ROUTES.SEND_MESSAGE, messageData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message,
      };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Failed to send message",
      };
    }
  },

  closeChatRoom: async (
    orderId: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.put(MESSAGE_ROUTES.CLOSE_CHAT_ROOM(orderId));
      return {
        success: true,
        message: response.data.message,
      };
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: error.message || "Failed to close chat room",
      };
    }
  },
};
