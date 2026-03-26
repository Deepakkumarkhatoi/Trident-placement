/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { ReactNode, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  BarChart3,
  Users,
  Briefcase,
  ClipboardList,
  Settings,
  LogOut,
  Clock,
  Shield,
  FileText,
  UserCog,
  Search,
  LayoutGrid,
} from 'lucide-react';
import { useTheme } from 'next-themes';

type Props = {
  children: ReactNode;
};

export default function AdminPortalLayout({ children }: Props) {
  const pathname = usePathname();
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  const nav = useMemo(
    () => [
      {
        group: 'Overview',
        items: [
          {
            label: 'Dashboard',
            href: '/admin',
            icon: BarChart3,
          },
          {
            label: 'Activity Log',
            href: '/admin/activity',
            icon: Clock,
            // numeric badge removed (design-only)
          },
        ],
      },
      {
        group: 'Manage',
        items: [
          {
            label: 'Drives',
            href: '/admin/drives',
            icon: Briefcase,
            // numeric badge removed (design-only)
          },
          {
            label: 'Students',
            href: '/admin/students',
            icon: Users,
            // numeric badge removed (design-only)
          },
          {
            label: 'Applications',
            href: '/admin/applications',
            icon: ClipboardList,
            // numeric badge removed (design-only)
          },
          {
            label: 'TPO Users',
            href: '/admin/tpo-users',
            icon: Shield,
            // numeric badge removed (design-only)
          },
          {
            label: 'Role Manager',
            href: '/admin/role-manager',
            icon: UserCog,
            badge: null,
          },
        ],
      },
      {
        group: 'Analytics',
        items: [
          {
            label: 'Reports',
            href: '/admin/reports',
            icon: FileText,
          },
        ],
      },
      {
        group: 'System',
        items: [
          {
            label: 'Settings',
            href: '/admin/settings',
            icon: Settings,
          },
        ],
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb]">
      <aside className="fixed left-0 top-0 h-screen w-[270px] bg-[#0f3f2f] text-white z-50">
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center font-black text-sm">
              A
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase text-white/90">T&amp;P Portal</p>
              <p className="text-sm font-bold text-white/95">Admin - TAT College</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 overflow-y-auto h-[calc(100vh-210px)] no-scrollbar">
          {nav.map((section) => (
            <div key={section.group} className="mb-8">
              <p className="text-[11px] tracking-widest font-semibold text-white/60 mb-2">
                {section.group.toUpperCase()}
              </p>
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                        isActive ? 'bg-white/15' : 'hover:bg-white/10 text-white/90',
                      ].join(' ')}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="px-6 py-5 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center font-black text-sm">
              SA
            </div>
            <div>
              <p className="text-xs text-white/60">Super Admin</p>
              <p className="text-sm font-bold text-white/90">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="pl-[270px]">
        <header className="sticky top-0 z-40 bg-[#f5f7fb] border-b border-black/5">
          <div className="px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center justify-center">
              <div className="relative w-full max-w-[520px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8a93a5]" />
                <input
                  type="text"
                  placeholder="Search students, drives..."
                  className="w-full bg-white border border-black/5 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-700 px-4 py-2 rounded-xl font-semibold">
                <LayoutGrid className="w-4 h-4" />
                Admin
              </div>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="inline-flex items-center gap-2 bg-[#ff6b6b] text-white px-4 py-2 rounded-xl font-semibold shadow-sm hover:opacity-95 transition"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </button>
            </div>
          </div>
        </header>

        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

