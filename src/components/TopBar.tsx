'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Moon, Sun, Menu, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useNotificationsContext } from '@/src/lib/context/NotificationsProvider';

interface TopBarProps {
  onMenuToggle: () => void;
}

const TopBar = ({ onMenuToggle }: TopBarProps) => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { unreadCount } = useNotificationsContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="h-14 md:h-16 border-b border-border flex items-center justify-between px-4 md:px-8 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      
      {/* Left Section */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-muted-foreground hover:text-foreground"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1 max-w-xl hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search drives, companies, roles..."
            className="w-full bg-secondary border-none rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 md:gap-2">

        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-[18px] h-[18px]" />
            ) : (
              <Moon className="w-[18px] h-[18px]" />
            )}
          </button>
        )}

        {/* Notification Bell */}
        <button
          onClick={() => router.push('/notifications')}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <Bell className="w-[18px] h-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-destructive text-white text-xs font-bold flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          title="Logout"
        >
          <LogOut className="w-[18px] h-[18px]" />
        </button>

      </div>
    </header>
  );
};

export default TopBar;