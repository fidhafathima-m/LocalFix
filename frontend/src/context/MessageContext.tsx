/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useSocket } from "./SocketContext";
import { messageService } from "../services/user/messageService";
import { useAppSelector } from "../hooks/redux";

interface MessageContextType {
  unreadMessageCount: number;
  refreshUnreadCount: () => Promise<void>;
  markAllMessagesAsRead: () => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const { socket, isConnected } = useSocket();
  const { isLoggedIn, user } = useAppSelector((state) => state.auth);

  const refreshUnreadCount = async () => {
    if (!isLoggedIn || !user) {
      setUnreadMessageCount(0);
      return;
    }

    try {
      let count = 0;

      if (user.roles?.includes("user")) {
        const conversations = await messageService.getUserConversations();
        count = conversations.reduce(
          (total, conv) => total + (conv.unreadCount?.user || 0),
          0
        );
      } else if (user.roles?.includes("serviceProvider")) {
        const conversations = await messageService.getTechnicianConversations(
          user._id
        );
        count = conversations.reduce(
          (total, conv) => total + (conv.unreadCount?.technician || 0),
          0
        );
      }

      setUnreadMessageCount(count);
    } catch (error) {
      console.error("Error fetching unread message count:", error);
    }
  };

  const markAllMessagesAsRead = async () => {
    if (!isLoggedIn || !user) return;

    try {
      await messageService.markAllMessagesAsRead();

      // Update local state immediately
      setUnreadMessageCount(0);

      // Refresh to ensure consistency
      await refreshUnreadCount();
    } catch (error) {
      console.error("Error marking all messages as read:", error);
    }
  };

  useEffect(() => {
    if (!socket || !isConnected || !isLoggedIn) return;

    const handleNewMessage = (messageData: any) => {
      // Only increment count if the message is for current user
      const isForCurrentUser =
        (user?.roles?.includes("user") &&
          messageData.receiverType === "user") ||
        (user?.roles?.includes("serviceProvider") &&
          messageData.receiverType === "technician");

      if (isForCurrentUser) {
        setUnreadMessageCount((prev) => prev + 1);
      }
    };

    const handleUnreadCountUpdate = (data: {
      count: number;
      userType: string;
    }) => {
      // Update the count immediately when received from server
      setUnreadMessageCount(data.count);
    };

    // Listen for real-time unread count updates
    socket.on("receive-message", handleNewMessage);
    socket.on("unread-message-count-update", handleUnreadCountUpdate);

    // Request initial count when connecting
    if (user) {
      const userType = user.roles?.includes("serviceProvider")
        ? "technician"
        : "user";
      socket.emit("get-unread-message-count", {
        userId: user._id,
        userType,
      });
    }

    return () => {
      socket.off("receive-message", handleNewMessage);
      socket.off("unread-message-count-update", handleUnreadCountUpdate);
    };
  }, [socket, isConnected, isLoggedIn, user]);

  // Refresh count on login/logout
  useEffect(() => {
    refreshUnreadCount();
  }, [isLoggedIn, user]);

  // Refresh count periodically (every 30 seconds)
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  return (
    <MessageContext.Provider
      value={{
        unreadMessageCount,
        refreshUnreadCount,
        markAllMessagesAsRead,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMessage = () => {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error("useMessage must be used within a MessageProvider");
  }
  return context;
};
