'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/src/components/DashboardLayout';
import StatsCard from '@/src/components/StatsCard';
import DriveCard from '@/src/components/DriveCard';
import RecommendedJobs from '@/src/components/RecommendedJobs';
import Link from 'next/link';
import { fetchOpenDrives, fetchApplications, fetchProfile, fetchEligibleDrives, StatsData, DriveData } from '@/src/lib/backend';

export default function Home() {
  const [dateStr, setDateStr] = useState<string>('');
  const [stats, setStats] = useState<StatsData[]>([]);
  const [drives, setDrives] = useState<DriveData[]>([]);
  const [appliedDriveIds, setAppliedDriveIds] = useState<Set<string>>(new Set());
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
        const profile = await fetchProfile();
        if (!profile) throw new Error('Failed to load student profile');

        const [openDrives, eligibleDrives, applications] = await Promise.all([
          fetchOpenDrives(),
          fetchEligibleDrives(profile.rollNumber),
          fetchApplications(profile.rollNumber),
        ]);

        // Prefer eligible drives, fallback to open drives, and show the 3 most recent
        const drivesToShow = eligibleDrives.length > 0 ? eligibleDrives : openDrives;
        setDrives(drivesToShow.slice(0, 3));

        const appliedIds = new Set(applications.map(app => app.driveId?.toString() || ''));
        setAppliedDriveIds(appliedIds);

        const dashboardStats: StatsData[] = [
          {
            label: 'Available Drives',
            value: openDrives.length,
            color: 'primary',
          },
          {
            label: 'Applied To',
            value: applications.length,
            color: 'success',
          },
          {
            label: 'Shortlisted',
            value: applications.filter(a => a.status === 'Shortlisted').length,
            color: 'warning',
          },
          {
            label: 'Selected',
            value: applications.filter(a => a.status === 'Approved').length,
            color: 'info',
          },
        ];

        setStats(dashboardStats);
        setStudentName(profile?.name || 'Student');
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
          <Link href="/drives" className="text-xs font-semibold text-primary ">
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
              <DriveCard key={d.id} {...d} delay={400 + i * 150} applied={appliedDriveIds.has(d.id.toString())} />
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