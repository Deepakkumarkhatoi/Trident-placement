'use client';

import { createContext, useContext } from 'react';

interface NotificationsContextType {
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
}

export const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
};
