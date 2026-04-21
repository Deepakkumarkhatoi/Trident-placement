'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/src/components/DashboardLayout';
import { CheckCircle2, AlertCircle, Info, Calendar, Building2, Check } from 'lucide-react';
import { studentNotificationsApi, ShortlistNotification } from '@/src/lib/api/student.notifications';
import { useNotificationsContext } from '@/src/lib/context/NotificationsProvider';

type NotifType = 'success' | 'warning' | 'info' | 'event' | 'drive';

interface Notification {
  id: string | number;
  type: NotifType;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
}

const iconMap: Record<NotifType, React.ElementType> = {
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
  event: Calendar,
  drive: Building2,
};

const colorMap: Record<NotifType, string> = {
  success: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  info: 'text-info bg-info/10',
  event: 'text-primary bg-primary/10',
  drive: 'text-primary bg-primary/10',
};

/**
 * Convert ShortlistNotification from backend to UI Notification format
 */
function convertToUINotification(notif: ShortlistNotification): Notification {
  const isSuccess = notif.status === 'PASSED';
  const type: NotifType = isSuccess ? 'success' : 'warning';
  
  const title = isSuccess ? '✓ Passed Round' : '✗ Failed Round';
  const desc = notif.message || 
    `You ${notif.status.toLowerCase()} the ${notif.roundName.replace(/_/g, ' ')} round in ${notif.driveName}`;
  
  const sentDate = new Date(notif.sentAt);
  const now = new Date();
  const diffMs = now.getTime() - sentDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  let time = '';
  if (diffMins < 1) time = 'Just now';
  else if (diffMins < 60) time = `${diffMins}m ago`;
  else if (diffHours < 24) time = `${diffHours}h ago`;
  else if (diffDays < 7) time = `${diffDays}d ago`;
  else time = sentDate.toLocaleDateString();

  return {
    id: notif.id,
    type,
    title,
    desc,
    time,
    unread: true,
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<Set<string | number>>(new Set());
  const { decrementUnreadCount, refreshCount } = useNotificationsContext();

  // Fetch notifications on page load
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching notifications...');
        const backendNotifications = await studentNotificationsApi.getNotifications();
        console.log('✅ Notifications fetched:', backendNotifications);
        const uiNotifications = backendNotifications.map(convertToUINotification);
        console.log('✅ Converted to UI format:', uiNotifications);
        setNotifications(uiNotifications);
      } catch (error) {
        console.error('❌ Error loading notifications:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAsRead = async (id: string | number) => {
    try {
      setMarkingAsRead((prev) => new Set(prev).add(id));
      // Update local state immediately
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
      // Update global unread count in bell icon
      decrementUnreadCount();
      
      // Try to call API but don't block if it fails
      try {
        await studentNotificationsApi.markAsRead(Number(id));
      } catch (apiError) {
        console.warn('API call failed but state updated:', apiError);
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    } finally {
      setMarkingAsRead((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((n) => n.unread)
        .map((n) => n.id);

      setMarkingAsRead(new Set(unreadIds));

      // Update local state immediately
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, unread: false }))
      );
      
      // Update global unread count for each notification marked as read
      unreadIds.forEach(() => decrementUnreadCount());
      
      // Try to call API but don't block if it fails
      try {
        await Promise.all(
          unreadIds.map((id) =>
            studentNotificationsApi.markAsRead(Number(id))
          )
        );
      } catch (apiError) {
        console.warn('API call failed but state updated:', apiError);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setMarkingAsRead(new Set());
    }
  };


  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unreadCount > 0 
              ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` 
              : 'All caught up! 🎉'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={handleMarkAllAsRead}
            className="text-xs font-semibold text-primary hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 h-20 animate-pulse"></div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-muted-foreground py-10">No notifications at the moment.</div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => {
            const Icon = iconMap[n.type];
            const isMarking = markingAsRead.has(n.id);

            return (
              <div
                key={n.id}
                className={`bg-card border rounded-xl p-5 flex items-start gap-4 transition-all opacity-0 animate-fade-in ${
                  n.unread ? 'border-primary/20' : 'border-border'
                } ${isMarking ? 'opacity-50' : ''}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorMap[n.type]}`}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
                        {n.unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.desc}</p>
                    </div>
                    {n.unread && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        disabled={isMarking}
                        className="shrink-0 text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50"
                      >
                        {isMarking ? 'Marking...' : 'Mark as read'}
                      </button>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">{n.time}</span>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
