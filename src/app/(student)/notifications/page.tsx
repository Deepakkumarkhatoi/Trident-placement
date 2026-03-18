'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/src/components/DashboardLayout';
import { CheckCircle2, AlertCircle, Info, Calendar, Building2 } from 'lucide-react';

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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  // Note: Notifications endpoint not available in backend API
  // You can add GET /api/notifications endpoint in your backend if needed

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">{unreadCount} unread notifications</p>
        </div>
        <button className="text-xs font-semibold text-primary hover:underline">Mark all as read</button>
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
            return (
              <div
                key={n.id}
                className={`bg-card border rounded-xl p-5 flex items-start gap-4 transition-all hover:border-primary/30 opacity-0 animate-fade-in ${
                  n.unread ? 'border-primary/20' : 'border-border'
                }`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorMap[n.type]}`}>
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-foreground">{n.title}</h3>
                    {n.unread && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.desc}</p>
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
