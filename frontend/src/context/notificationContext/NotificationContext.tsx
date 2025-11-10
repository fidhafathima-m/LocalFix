// context/notificationContext/NotificationContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { NotificationService } from '../../services/notificationService';

interface NotificationContextType {
  notificationCount: number;
  refreshNotificationCount: () => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
  userId?: string; // Make userId optional or get it from auth
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ 
  children, 
  userId 
}) => {
  const [notificationCount, setNotificationCount] = useState(0);

  const refreshNotificationCount = async () => {
    if (!userId) {
      console.log('No user ID provided to NotificationProvider');
      setNotificationCount(0);
      return;
    }

    try {
      console.log('Refreshing notification count for user:', userId);
      const response = await NotificationService.getUnreadCount(userId);
      
      // Handle different response formats
      let count = 0;
      if (typeof response === 'number') {
        count = response;
      } else if (response && typeof response === 'object' && 'count' in response) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        count = (response as any).count;
      } else if (response && typeof response === 'object' && 'success' in response) {
        const successResponse = response as { success: boolean; count: number };
        if (successResponse.success) {
          count = successResponse.count;
        }
      }
      
      console.log('Notification count received:', count);
      setNotificationCount(count);
    } catch (err) {
      console.error('Failed to load notification count:', err);
      setNotificationCount(0);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    
    try {
      await NotificationService.markAllAsRead(userId);
      setNotificationCount(0); // Immediately set to 0
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // Refresh count when userId changes
  useEffect(() => {
    if (userId) {
      refreshNotificationCount();
    } else {
      setNotificationCount(0);
    }
  }, [userId]);

  return (
    <NotificationContext.Provider value={{
      notificationCount,
      refreshNotificationCount,
      markAllAsRead
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};