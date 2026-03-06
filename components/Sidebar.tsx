'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, FileText, Building2, Bell, User, X } from 'lucide-react';


const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FileText, label: 'My Applications', path: '/applications' },
  { icon: Building2, label: 'Drives', path: '/drives' },
  { icon: Bell, label: 'Notifications', path: '/notifications', badge: '' },
  { icon: User, label: 'Profile', path: '/profile' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-60 bg-sidebar border-r border-sidebar-border flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center text-sm font-bold text-sidebar-primary-foreground">
            T
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-sidebar-foreground">T&P PORTAL</p>
            <p className="text-sm font-bold text-sidebar-foreground">TAT College</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.label}
              href={item.path}
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[11px] font-bold flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-sidebar-border">
        <p className="text-[11px] text-muted-foreground">Training & Placement Cell</p>
        <p className="text-xs font-semibold text-sidebar-accent-foreground">Student Dashboard</p>
      </div>
    </aside>
  );
};

export default Sidebar;
