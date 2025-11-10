/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/technician/tabs/NotificationsTab.tsx
import React, { useState, useEffect } from "react";
import {
  CheckCircleOutlineOutlined,
  CalendarMonthOutlined,
  StarBorderOutlined,
  ChatBubbleOutline,
  CurrencyRupeeOutlined,
  CloseOutlined,
  NotificationsNone,
  CheckCircle,
} from "@mui/icons-material";
import { NotificationService } from "../../../../../../services/notificationService";
import type { Notification } from "../../../../../../interface/user/INotification";

interface NotificationsTabProps {
  technicianId: string;
  isSuspended: boolean;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ 
  technicianId, 
  isSuspended 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSuspended && technicianId) {
      loadNotifications();
    }
  }, [technicianId, isSuspended]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const notificationsData = await NotificationService.getNotifications(technicianId);
      setNotifications(notificationsData);
    } catch (err: any) {
      console.error("Failed to load notifications:", err);
      setError(err.message || "Failed to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead(technicianId);
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (err: any) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "application_approved":
        return <CheckCircleOutlineOutlined className="w-5 h-5 text-green-600" />;
      case "new_booking":
        return <CalendarMonthOutlined className="w-5 h-5 text-blue-600" />;
      case "rating_received":
        return <StarBorderOutlined className="w-5 h-5 text-yellow-500" />;
      case "payment_success":
        return <CurrencyRupeeOutlined className="w-5 h-5 text-green-600" />;
      case "payment_failed":
        return <CloseOutlined className="w-5 h-5 text-red-500" />;
      case "order_update":
        return <ChatBubbleOutline className="w-5 h-5 text-purple-600" />;
      case "system":
        return <NotificationsNone className="w-5 h-5 text-gray-600" />;
      default:
        return <NotificationsNone className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case "application_approved":
        return "bg-green-100";
      case "new_booking":
        return "bg-blue-100";
      case "rating_received":
        return "bg-yellow-100";
      case "payment_success":
        return "bg-green-100";
      case "payment_failed":
        return "bg-red-100";
      case "order_update":
        return "bg-purple-100";
      case "system":
        return "bg-gray-100";
      default:
        return "bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
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
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 border-b border-gray-100">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={loadNotifications}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-blue-600 text-sm hover:text-blue-800 flex items-center gap-1 transition-colors px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            <CheckCircle className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <NotificationsNone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No notifications yet</p>
          <p className="text-gray-400 text-sm mt-1">
            You'll see important updates here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`flex items-start gap-3 p-4 rounded-lg border ${
                notification.isRead 
                  ? "bg-white border-gray-100" 
                  : "bg-blue-50 border-blue-200"
              } relative cursor-pointer hover:shadow-sm transition-all duration-200`}
              onClick={() => !notification.isRead && markAsRead(notification._id)}
            >
              <div className={`p-2 rounded-full ${getNotificationBgColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  notification.isRead ? "text-gray-800" : "text-gray-900"
                }`}>
                  {notification.title}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  {notification.message}
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  {formatDate(notification.createdAt)}
                </p>
              </div>
              {!notification.isRead && (
                <div className="absolute right-4 top-4 w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;