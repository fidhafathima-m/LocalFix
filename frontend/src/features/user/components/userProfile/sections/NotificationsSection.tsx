/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import {
  NotificationsNoneOutlined,
  CheckCircleOutlineOutlined,
  CloseOutlined,
  EditOutlined,
  FmdGoodOutlined,
  ArrowForwardOutlined,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import type { UserData } from "./types";
import { useNotification } from "../../../../../context/notificationContext/NotificationContext";
import { NotificationService } from "../../../../../services/notificationService";
import type { Notification } from "../../../../../interface/user/INotification";

interface NotificationsSectionProps {
  userData: UserData | null;
}

export const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  userData,
}) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { refreshNotificationCount, markAllAsRead: contextMarkAllAsRead } =
    useNotification();

  useEffect(() => {
    if (userData?._id) {
      loadUserNotifications();
    }
  }, [userData?._id]);

  const loadUserNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const notificationsData = await NotificationService.getNotifications(
        userData!._id
      );
      setNotifications(notificationsData);
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
      toast.error("Failed to load notifications");
    } finally {
      setNotificationsLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      refreshNotificationCount();
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await NotificationService.markAllAsRead(userData!._id);
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      contextMarkAllAsRead();
      toast.success("All notifications marked as read");
    } catch (err: any) {
      console.error("Failed to mark all notifications as read:", err);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    if (!notification.isRead) {
      await markNotificationAsRead(notification._id);
    }

    // Handle navigation based on notification type and data
    if (notification.data?.actionUrl) {
      // Navigate to the specific action URL
      navigate(notification.data.actionUrl);
    } else {
      // Fallback navigation based on notification type
      switch (notification.type) {
        case "spare_parts_request":
          if (notification.data?.orderId && notification.data?.requestId) {
            navigate(
              `/orders/${notification.data.orderId}/spare-parts/${notification.data.requestId}/approval`
            );
          }
          break;
        case "booking_confirmed":
        case "order_status_update":
          if (notification.data?.orderId) {
            navigate(`/orders/${notification.data.orderId}`);
          }
          break;
        case "payment_success":
          navigate("/payments");
          break;
        default:
          // Default to orders page
          navigate("/orders");
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment_success":
        return (
          <CheckCircleOutlineOutlined className="w-5 h-5 text-green-600" />
        );
      case "booking_confirmed":
        return <CheckCircleOutlineOutlined className="w-5 h-5 text-blue-600" />;
      case "booking_cancelled":
        return <CloseOutlined className="w-5 h-5 text-red-500" />;
      case "booking_rescheduled":
        return <EditOutlined className="w-5 h-5 text-orange-500" />;
      case "technician_assigned":
        return <FmdGoodOutlined className="w-5 h-5 text-purple-600" />;
      case "service_completed":
        return (
          <CheckCircleOutlineOutlined className="w-5 h-5 text-green-600" />
        );
      case "reminder":
        return (
          <NotificationsNoneOutlined className="w-5 h-5 text-yellow-500" />
        );
      case "spare_parts_request":
        return <EditOutlined className="w-5 h-5 text-pink-600" />;
      default:
        return <NotificationsNoneOutlined className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "payment_success":
        return "bg-green-100";
      case "booking_confirmed":
        return "bg-blue-100";
      case "booking_cancelled":
        return "bg-red-100";
      case "booking_rescheduled":
        return "bg-orange-100";
      case "technician_assigned":
        return "bg-purple-100";
      case "service_completed":
        return "bg-green-100";
      case "reminder":
        return "bg-yellow-100";
      case "spare_parts_request":
        return "bg-pink-100";
      default:
        return "bg-gray-100";
    }
  };

  const getActionButtonText = (type: string) => {
    switch (type) {
      case "spare_parts_request":
        return "Review & Approve";
      case "booking_confirmed":
        return "View Booking";
      case "payment_success":
        return "View Payment";
      case "order_status_update":
        return "View Order";
      default:
        return "View Details";
    }
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm p-6 mb-6"
      id="notifications"
      ref={notificationsRef}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <div className="flex items-center space-x-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Mark all as read
            </button>
          )}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            {showNotifications ? "Hide" : "Show All"}
          </button>
        </div>
      </div>

      {notificationsLoading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 text-sm mt-2">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8">
          <NotificationsNoneOutlined className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No notifications yet</p>
          <p className="text-sm text-gray-400 mt-1">
            You'll see important updates about your bookings here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {(showNotifications ? notifications : notifications.slice(0, 3)).map(
            (notification) => (
              <div
                key={notification._id}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  notification.isRead
                    ? "bg-white border-gray-100"
                    : "bg-blue-50 border-blue-200"
                } relative hover:shadow-sm transition-all duration-200 group`}
              >
                <div
                  className={`p-2 rounded-full ${getNotificationBgColor(
                    notification.type
                  )}`}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium ${
                      notification.isRead ? "text-gray-800" : "text-gray-900"
                    }`}
                  >
                    {notification.title}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {notification.message}
                  </p>

                  {/* Action Button */}
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className="mt-2 flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
                  >
                    {getActionButtonText(notification.type)}
                    <ArrowForwardOutlined className="w-4 h-4" />
                  </button>

                  <p className="text-gray-400 text-xs mt-2">
                    {formatNotificationDate(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="absolute right-4 top-4 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            )
          )}

          {!showNotifications && notifications.length > 3 && (
            <button
              onClick={() => setShowNotifications(true)}
              className="w-full text-center py-3 text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer"
            >
              View all {notifications.length} notifications
            </button>
          )}
        </div>
      )}
    </div>
  );
};
