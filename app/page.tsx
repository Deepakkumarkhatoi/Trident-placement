'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import DriveCard from '@/components/DriveCard';
import RecommendedJobs from '@/components/RecommendedJobs';
import Link from 'next/link';
import { drivesList } from '@/data/drives';

export const dynamic = 'force-dynamic';

const stats = [
  { label: 'Eligible Drives', value: 12, color: 'primary' as const },
  { label: 'Applied', value: 5, color: 'info' as const },
  { label: 'Shortlisted', value: 2, color: 'warning' as const },
  { label: 'Offer Received', value: 1, color: 'success' as const },
];

const drives = drivesList.slice(0, 3);

export default function Home() {
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    }).toUpperCase();
    setDateStr(formatted);
  }, []);
  return (
    <DashboardLayout>
      <p className="text-xs tracking-widest text-muted-foreground mb-1">{dateStr}</p>
      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
        Welcome back, <span className="text-primary">Rahul</span>
      </h1>
      <p className="text-sm text-muted-foreground mt-1">Here's your training & placement updates.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
        {stats.map((s, i) => (
          <StatsCard key={s.label} {...s} delay={i * 100} />
        ))}
      </div>

      {/* Drives */}
      <div className="mt-6 md:mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-widest text-muted-foreground">// ELIGIBLE DRIVES</h2>
          <Link href="/drives" className="text-xs font-semibold text-primary hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {drives.map((d, i) => (
            <DriveCard key={d.id} {...d} delay={400 + i * 150} />
          ))}
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="mt-6 md:mt-8">
        <RecommendedJobs />
      </div>
    </DashboardLayout>
  );
}
