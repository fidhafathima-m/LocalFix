/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IMessage } from "../../interface/user/IMessage";
import type { IMessageRoom } from "../../interface/user/IMessageRoom";
import { messageAPI } from "../common/messageApi";

export class MessageService {
  static async getOrderMessages(
    orderId: string,
    limit: number = 50
  ): Promise<IMessage[]> {
    try {
      const response = await messageAPI.getOrderMessages(orderId, limit);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to fetch messages");
    }
  }

  static async getUserConversations(): Promise<IMessageRoom[]> {
    try {
      const response = await messageAPI.getUserConversations();
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to fetch conversations");
    }
  }

  static async getTechnicianConversations(
    technicianId: string
  ): Promise<IMessageRoom[]> {
    try {
      const response = await messageAPI.getTechnicianConversations(
        technicianId
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to fetch conversations");
    }
  }

  static async markAsRead(
    orderId: string,
    userType: "user" | "technician"
  ): Promise<void> {
    try {
      const response = await messageAPI.markAsRead(orderId, userType);
      this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to mark messages as read");
    }
  }

  static async getUnreadCount(
    userType: "user" | "technician"
  ): Promise<number> {
    try {
      const response = await messageAPI.getUnreadCount(userType);
      const result = this.handleResponse(response);
      return result.count || 0;
    } catch (error) {
      throw this.handleError(error, "Failed to fetch unread count");
    }
  }

  static async initializeChatRoom(
    orderId: string,
    userId: string,
    technicianId: string
  ): Promise<IMessageRoom> {
    try {
      const response = await messageAPI.initializeChatRoom(
        orderId,
        userId,
        technicianId
      );
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to initialize chat room");
    }
  }

  static async sendMessage(messageData: {
    orderId: string;
    senderId: string;
    senderType: "user" | "technician";
    receiverId: string;
    receiverType: "user" | "technician";
    message: string;
    messageType?: "text" | "image" | "file";
  }): Promise<IMessage> {
    try {
      const response = await messageAPI.sendMessage(messageData);
      return this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to send message");
    }
  }

  static async closeChatRoom(orderId: string): Promise<void> {
    try {
      const response = await messageAPI.closeChatRoom(orderId);
      this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to close chat room");
    }
  }
  static async markAllMessagesAsRead(): Promise<void> {
    try {
      const response = await messageAPI.markAllMessagesAsRead();
      this.handleResponse(response);
    } catch (error) {
      throw this.handleError(error, "Failed to mark all messages as read");
    }
  }

  private static handleResponse(response: any) {
    if (response.success === false) {
      throw new Error(response.message || "Operation failed");
    }
    return response.data || response;
  }

  private static handleError(error: any, defaultMessage: string) {
    if (error instanceof Error) {
      return error;
    }
    return new Error(defaultMessage);
  }
}

// Export as default for backward compatibility
export const messageService = MessageService;
