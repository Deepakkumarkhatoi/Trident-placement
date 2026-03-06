'use client';

export const dynamic = 'force-dynamic';

import DashboardLayout from '@/components/DashboardLayout';
import { CheckCircle2, AlertCircle, Info, Calendar, Building2 } from 'lucide-react';

type NotifType = 'success' | 'warning' | 'info' | 'event' | 'drive';

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

const notifications = [
  { id: 1, type: 'success' as NotifType, title: 'Shortlisted at TechCorp Solutions', desc: 'You\'ve been shortlisted for the Technical Interview round.', time: '2 hours ago', unread: false },
  { id: 2, type: 'drive' as NotifType, title: 'New Drive: NexGen Solutions', desc: 'DevOps Engineer position open. Package: 10 LPA. Apply before 02-04-25.', time: '5 hours ago', unread: false },
  { id: 3, type: 'event' as NotifType, title: 'Pre-Placement Talk — InnoTech Labs', desc: 'Scheduled for March 5, 2026 at 10:00 AM in Seminar Hall B.', time: '1 day ago', unread: false },
  { id: 4, type: 'warning' as NotifType, title: 'Application deadline approaching', desc: 'DataFlow Inc drive closes on 20-03-25. Complete your application.', time: '1 day ago', unread: false },
  { id: 5, type: 'info' as NotifType, title: 'Profile incomplete', desc: 'Add your resume and CGPA details to increase visibility to recruiters.', time: '3 days ago', unread: false },
  { id: 6, type: 'success' as NotifType, title: 'Offer received from InnoTech Labs', desc: 'Congratulations! You\'ve received an offer for ML Engineer at 12 LPA.', time: '5 days ago', unread: false },
];

export default function Notifications() {
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
    </DashboardLayout>
  );
}
