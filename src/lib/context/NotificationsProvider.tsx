'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { studentNotificationsApi } from '@/src/lib/api/student.notifications';

interface NotificationsContextType {
  unreadCount: number;
  isLoading: boolean;
  refreshCount: () => Promise<void>;
  decrementUnreadCount: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotificationsContext = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within NotificationsProvider');
  }
  return context;
};

export const NotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCount = useCallback(async () => {
    try {
      setIsLoading(true);
      const notifications = await studentNotificationsApi.getNotifications();
      // Count notifications that are unread (you may need to adjust based on your backend)
      setUnreadCount(notifications.length);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const decrementUnreadCount = useCallback(() => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  useEffect(() => {
    refreshCount();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(refreshCount, 30000);
    return () => clearInterval(interval);
  }, [refreshCount]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, isLoading, refreshCount, decrementUnreadCount }}>
      {children}
    </NotificationsContext.Provider>
  );
};
