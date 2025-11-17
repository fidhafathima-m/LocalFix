/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { NotificationService } from "../../services/notificationService";
import { useSocket } from "../SocketContext"; // Import your socket context

interface NotificationContextType {
  notificationCount: number;
  notifications: any[];
  refreshNotificationCount: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
  userId?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  userId,
}) => {
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { socket, isConnected } = useSocket(); // Get socket from context

  const refreshNotificationCount = async () => {
    if (!userId) {
      console.log("No user ID provided to NotificationProvider");
      setNotificationCount(0);
      return;
    }

    try {
      console.log("Refreshing notification count for user:", userId);
      const response = await NotificationService.getUnreadCount(userId);

      // Handle different response formats
      let count = 0;
      if (typeof response === "number") {
        count = response;
      } else if (
        response &&
        typeof response === "object" &&
        "count" in response
      ) {
        count = (response as any).count;
      } else if (
        response &&
        typeof response === "object" &&
        "success" in response
      ) {
        const successResponse = response as { success: boolean; count: number };
        if (successResponse.success) {
          count = successResponse.count;
        }
      }

      console.log("Notification count received:", count);
      setNotificationCount(count);
    } catch (err) {
      console.error("Failed to load notification count:", err);
      setNotificationCount(0);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await NotificationService.markAllAsRead(userId);
      setNotificationCount(0); // Immediately set to 0

      // Also emit socket event to update server-side
      if (socket) {
        socket.emit("mark-all-read", { userId });
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!userId) return;

    try {
      await NotificationService.markAsRead(notificationId);

      // Optimistically update count
      setNotificationCount((prev) => Math.max(0, prev - 1));

      // Emit socket event
      if (socket) {
        socket.emit("mark-notification-read", { notificationId });
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // 🔔 REAL-TIME SOCKET.IO LISTENERS
  useEffect(() => {
    if (!socket || !userId || !isConnected) {
      console.log("Socket not available for notifications");
      return;
    }

    console.log(
      "🔔 Setting up real-time notification listeners for user:",
      userId
    );

    // Join user's personal notification room
    socket.emit("join-notification-room", { userId });

    // Listen for new real-time notifications
    socket.on(
      "new-notification",
      (data: { notification: any; unreadCount: number }) => {
        console.log("📢 Received new live notification:", data);
        console.log("Notification data:", data.notification.data);

        // Update notification count in real-time
        setNotificationCount(data.unreadCount);

        // Add to notifications list
        setNotifications((prev) => [data.notification, ...prev]);

        // Show browser notification
        if (Notification.permission === "granted" && data.notification) {
          const browserNotification = new Notification(
            data.notification.title,
            {
              body: data.notification.message,
              icon: "/logo.png",
              tag: "localfix-notification",
              data: data.notification.data,
            }
          );
          browserNotification.onclick = () => {
            window.focus();
            if (data.notification.data?.actionUrl) {
              window.location.href = data.notification.data.actionUrl;
            }
          };
        }
      }
    );

    // Listen for unread count updates
    socket.on("unread-count-update", (data: { count: number }) => {
      console.log("🔢 Unread count updated via socket:", data.count);
      setNotificationCount(data.count);
    });

    // Request initial unread count via socket
    socket.emit("get-unread-count", { userId });

    // Cleanup socket listeners
    return () => {
      console.log("🧹 Cleaning up notification socket listeners");
      socket.off("new-notification");
      socket.off("unread-count-update");
    };
  }, [socket, userId, isConnected]);

  // Refresh count when userId changes (fallback)
  useEffect(() => {
    if (userId) {
      refreshNotificationCount();
    } else {
      setNotificationCount(0);
      setNotifications([]);
    }
  }, [userId]);

  return (
    <NotificationContext.Provider
      value={{
        notificationCount,
        notifications,
        refreshNotificationCount,
        markAllAsRead,
        markAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
