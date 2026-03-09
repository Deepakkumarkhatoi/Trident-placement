'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import StatsCard from '@/components/StatsCard';
import DriveCard from '@/components/DriveCard';
import RecommendedJobs from '@/components/RecommendedJobs';
import Link from 'next/link';
import { fetchDashboard, fetchOpenDrives, StatsData, DriveData } from '@/lib/backend';

export default function Home() {
  const [dateStr, setDateStr] = useState<string>('');
  const [stats, setStats] = useState<StatsData[]>([]);
  const [drives, setDrives] = useState<DriveData[]>([]);
  const [studentName, setStudentName] = useState<string>('Student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).toUpperCase();
    setDateStr(formatted);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const regdno = localStorage.getItem('regdno');

        if (!regdno) {
          console.error('Student ID not found');
          setLoading(false);
          return;
        }

        const dashboardData = await fetchDashboard(regdno);

        if (dashboardData) {
          setStats(dashboardData.stats || []);
          setDrives(dashboardData.drives?.slice(0, 3) || []);
          setStudentName(dashboardData.name?.split(' ')[0] || 'Student');
        } else {
          const openDrives = await fetchOpenDrives();
          setDrives(openDrives.slice(0, 3));
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <DashboardLayout>
      <p className="text-xs tracking-widest text-muted-foreground mb-1">{dateStr}</p>

      <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
        Welcome back, <span className="text-primary">{studentName}</span>
      </h1>

      <p className="text-sm text-muted-foreground mt-1">
        Here's your training & placement updates.
      </p>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
          <div className="bg-card rounded-lg h-20 animate-pulse"></div>
          <div className="bg-card rounded-lg h-20 animate-pulse"></div>
          <div className="bg-card rounded-lg h-20 animate-pulse"></div>
          <div className="bg-card rounded-lg h-20 animate-pulse"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
          {stats.map((s, i) => (
            <StatsCard key={s.label} {...s} delay={i * 100} />
          ))}
        </div>
      )}

      <div className="mt-6 md:mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-widest text-muted-foreground">
            // ELIGIBLE DRIVES
          </h2>
          <Link href="/drives" className="text-xs font-semibold text-primary hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="bg-card rounded-lg h-40 animate-pulse"></div>
            <div className="bg-card rounded-lg h-40 animate-pulse"></div>
            <div className="bg-card rounded-lg h-40 animate-pulse"></div>
          </div>
        ) : drives.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {drives.map((d, i) => (
              <DriveCard key={d.id} {...d} delay={400 + i * 150} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No drives available at the moment.
          </p>
        )}
      </div>

      <div className="mt-6 md:mt-8">
        <RecommendedJobs />
      </div>
    </DashboardLayout>
  );
}