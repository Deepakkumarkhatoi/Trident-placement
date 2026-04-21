"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/src/components/ui/tooltip";
import { NotificationsProvider } from "@/src/lib/context/NotificationsProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <NotificationsProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </NotificationsProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}