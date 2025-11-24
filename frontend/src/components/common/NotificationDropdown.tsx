import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  NotificationsNoneOutlined,
  CheckCircleOutlineOutlined,
  CloseOutlined,
  MarkEmailReadOutlined,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { NotificationService } from "../../services/notificationService";
import type { Notification } from "../../interface/user/INotification";
import { useNotification } from "../../context/notificationContext/NotificationContext";

interface NotificationDropdownProps {
  userId: string;
  userType: "user" | "serviceProvider" | "admin";
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  userId,
  userType,
  isOpen,
  onClose,
}) => {
  const [recentNotifications, setRecentNotifications] = useState<
    Notification[]
  >([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const { notificationCount, markAllAsRead: contextMarkAllAsRead } =
    useNotification();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen && userId) {
      loadRecentNotifications();
    }
  }, [isOpen, userId]);

  const loadRecentNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const notificationsData = await NotificationService.getNotifications(
        userId
      );
      // Show only recent unread notifications (last 3)
      const unreadNotifications = notificationsData
        .filter((notif) => !notif.isRead)
        .slice(0, 3);
      setRecentNotifications(unreadNotifications);
    } catch (err: unknown) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead(userId);
      setRecentNotifications([]);
      contextMarkAllAsRead();
      toast.success("All notifications marked as read");
    } catch (err: unknown) {
      console.error("Failed to mark all notifications as read:", err);
      toast.error("Failed to mark all notifications as read");
    }
  };

  const handleViewAllNotifications = () => {
    if (userType === "serviceProvider") {
      navigate("/technician/dashboard?tab=notifications");
    } else {
      navigate("/my-profile#notifications");
    }
    onClose();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment_success":
        return (
          <CheckCircleOutlineOutlined className="w-4 h-4 text-green-600" />
        );
      case "booking_confirmed":
        return <CheckCircleOutlineOutlined className="w-4 h-4 text-blue-600" />;
      case "booking_cancelled":
        return <CloseOutlined className="w-4 h-4 text-red-500" />;
      case "booking_rescheduled":
        return (
          <CheckCircleOutlineOutlined className="w-4 h-4 text-orange-500" />
        );
      case "technician_assigned":
        return (
          <CheckCircleOutlineOutlined className="w-4 h-4 text-purple-600" />
        );
      case "service_completed":
        return (
          <CheckCircleOutlineOutlined className="w-4 h-4 text-green-600" />
        );
      case "reminder":
        return (
          <NotificationsNoneOutlined className="w-4 h-4 text-yellow-500" />
        );
      case "spare_parts_request":
        return <CheckCircleOutlineOutlined className="w-4 h-4 text-pink-600" />;
      default:
        return <NotificationsNoneOutlined className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="font-semibold text-gray-800">
          Notifications {notificationCount > 0 && `(${notificationCount})`}
        </h3>
        <div className="flex items-center gap-2">
          {recentNotifications.length > 0 && (
            <button
              onClick={markAllAsRead}
              className="p-1 text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
              title="Mark all as read"
            >
              <MarkEmailReadOutlined className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <CloseOutlined className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loadingNotifications ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="text-center py-8">
            <NotificationsNoneOutlined className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentNotifications.map((notification) => (
              <div key={notification._id} className="p-4 transition-colors">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-400">
                        {formatNotificationDate(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={handleViewAllNotifications}
          className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2 cursor-pointer"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};
