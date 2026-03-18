import type { Metadata } from "next";
import Providers from "./providers";
import { Toaster } from "@/src/components/ui/toaster";
import { Toaster as Sonner } from "@/src/components/ui/sonner";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trident Training & Placement",
  description: "Training and Placement Portal for Students",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <body className="h-full">
        <Providers>
          <Toaster />
          <Sonner />
          {children}
        </Providers>
      </body>
    </html>
  );
}