'use client';

import {
  SidebarProvider,
  Sidebar,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarInset
} from '@/src/components/ui/sidebar';

import {
  BarChart3,
  Users,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react'; 

const menuItems = [
  {
    title: 'Dashboard',
    icon: BarChart3,
    href: '/admin',
  },
  {
    title: 'Students',
    icon: Users,
    href: '/admin/students',
  },
  {
    title: 'Drives',
    icon: FileText,
    href: '/admin/drives',
  },
  {
    title: 'Applications',
    icon: FileText,
    href: '/admin/applications',
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/admin/settings',
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();

  return (
    <SidebarProvider>

      {/* SIDEBAR */}
      <Sidebar className="border-r bg-card">

        <div className="border-b px-6 py-4">
          <h1 className="text-lg font-bold text-foreground">
            Admin Panel
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage system & users
          </p>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <SidebarMenu>

            {menuItems.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + '/');

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href} className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}

          </SidebarMenu>
        </div>

      </Sidebar>

      {/* MAIN CONTENT */}
      <SidebarInset>

        {/* HEADER */}
        <header className="border-b px-6 py-4 flex items-center justify-between bg-card sticky top-0 z-40">

          <div className="flex items-center gap-3">
            <SidebarTrigger />
            <h2 className="text-sm font-semibold text-foreground">
              Administration
            </h2>
          </div>

          {/* LOGOUT BUTTON */}
          <div className="flex items-center gap-4">

            <button
              onClick={() => signOut({ callbackUrl: "/" })} 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-accent"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

          </div>

        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 bg-background">
          {children}
        </main>

      </SidebarInset>

    </SidebarProvider>
  );
}