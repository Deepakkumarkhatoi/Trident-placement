'use client';

import { useEffect, useMemo, useState } from 'react';
import { adminApplicationsApi } from '@/src/lib/api/admin.applications';
import { adminDrivesApi } from '@/src/lib/api/admin.drives';
import { adminStudentsApi, type StudentSummaryDTO } from '@/src/lib/api/admin.students';

import Link from 'next/link';

function formatShortDate(input: string) {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function PlacementPill({ status }: { status: string }) {
  const styleByStatus: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-orange-100 text-orange-700 border-orange-200',
    CLOSING: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  const cls = styleByStatus[status] ?? 'bg-gray-100 text-gray-700 border-gray-200';
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${cls}`}>{status}</span>;
}

function derivePlaced(students: unknown) {
  if (!Array.isArray(students)) return 0;
  return (students as StudentSummaryDTO[]).reduce((acc, s) => acc + (s.placedCount > 0 ? 1 : 0), 0);
}

export default function AdminDashboard() {
  const [drives, setDrives] = useState<any[]>([]);
  const [students, setStudents] = useState<StudentSummaryDTO[]>([]);
  const [totalStudentsCount, setTotalStudentsCount] = useState<number>(0);
  const [applicationsCount, setApplicationsCount] = useState<number>(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminDrivesApi.getAll(),
      adminStudentsApi.getAll(),
      adminApplicationsApi.getAll(),
    ])
      .then(([d, s, apps]) => {
        setDrives(d);
        setStudents(Array.isArray(s) ? (s as StudentSummaryDTO[]) : []);
        setApplicationsCount(apps.length);
      })
      .catch(() => {
        setDrives([]);
        setStudents([]);
        setApplicationsCount(0);
      })
      .finally(() => setLoading(false));

    // Fetch total students count (pagination endpoint) 
    adminStudentsApi
      .list({ page: 0, size: 1 })
      .then((res) => setTotalStudentsCount(res.totalElements ?? 0))
      .catch(() => setTotalStudentsCount(0));
  }, []);

  const stats = useMemo(() => {
    const safeStudents = Array.isArray(students) ? students : [];
    const totalDrives = drives.length;
    const activeDrives = drives.filter((d: any) => d.status === 'OPEN').length;
    const placedStudents = derivePlaced(safeStudents);
    const offersGiven = safeStudents.reduce((acc, s) => acc + (s.placedCount > 0 ? s.placedCount : 0), 0);
    const totalStudents = totalStudentsCount || safeStudents.length;
    const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

    return {
      totalDrives,
      activeDrives,
      totalStudents,
      placedStudents,
      offersGiven,
      placementRate,
      applicationsCount,
    };
  }, [applicationsCount, drives, students]);

  const recentDrives = useMemo(() => {
    const copy = [...drives].sort((a: any, b: any) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
    return copy.slice(0, 5);
  }, [drives]);

  const placementByBranch = useMemo(() => {
    const safeStudents = Array.isArray(students) ? students : [];
    const map = new Map<string, { total: number; placed: number }>();
    for (const s of safeStudents) {
      const key = s.branch || '—';
      const cur = map.get(key) ?? { total: 0, placed: 0 };
      cur.total += 1;
      cur.placed += s.placedCount > 0 ? 1 : 0;
      map.set(key, cur);
    }
    const rows = Array.from(map.entries())
      .map(([branch, v]) => ({
        branch,
        pct: v.total > 0 ? Math.round((v.placed / v.total) * 100) : 0,
      }))
      .sort((a, b) => b.pct - a.pct);
    return rows.slice(0, 6);
  }, [students]);

  const dateLabel = 'Wednesday, 25 March 2026';

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs tracking-wide text-muted-foreground">{dateLabel}</p>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
          Good morning, Super Admin <span aria-hidden>👋</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        <div className="bg-white rounded-2xl border border-black/5 p-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-2 bg-emerald-500/70" />
          <div className="flex items-start gap-3">
            <div>
              <div className="text-sm text-muted-foreground font-medium">TOTAL DRIVES</div>
              <div className="text-3xl font-bold text-foreground">{stats.totalDrives.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-2 bg-blue-500/70" />
          <div className="flex items-start gap-3">
            <div>
              <div className="text-sm text-muted-foreground font-medium">TOTAL STUDENTS</div>
              <div className="text-3xl font-bold text-foreground">{stats.totalStudents.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-2 bg-purple-500/70" />
          <div className="flex items-start gap-3">
            <div>
              <div className="text-sm text-muted-foreground font-medium">TPO OFFICERS</div>
              <div className="text-3xl font-bold text-foreground"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-2 bg-amber-500/70" />
          <div className="flex items-start gap-3">
            <div>
              <div className="text-sm text-muted-foreground font-medium">OFFERS GIVEN</div>
              <div className="text-3xl font-bold text-foreground">{stats.offersGiven.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5 relative overflow-hidden col-span-1 sm:col-span-2 xl:col-span-3">
          <div className="absolute left-0 top-0 h-full w-2 bg-teal-500/70" />
          <div className="flex items-start gap-3">
            <div>
              <div className="text-sm text-muted-foreground font-medium">PLACEMENT RATE</div>
              <div className="text-3xl font-bold text-foreground">{stats.placementRate}%</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-5 relative overflow-hidden col-span-1 sm:col-span-1 xl:col-span-3">
          <div className="absolute left-0 top-0 h-full w-2 bg-rose-500/70" />
          <div className="flex items-start gap-3">
            <div>
              <div className="text-sm text-muted-foreground font-medium">ACTIVE DRIVES</div>
              <div className="text-3xl font-bold text-foreground">{stats.activeDrives.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">RECENT DRIVES</h2>
            <Link href="/admin/drives" className="text-sm font-semibold text-foreground/80 hover:underline">
              View All &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 p-4">
            <div className="divide-y divide-black/5">
              {recentDrives.map((d: any) => {
                const status = d.status === 'OPEN' ? 'ACTIVE' : 'COMPLETED';
                return (
                  <div key={d.id} className="py-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                        {String(d.companyName ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">
                          {d.companyName} - {d.role}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ₹{d.lpaPackage} LPA - {d.minimumCgpa}+ - {formatShortDate(d.lastDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-muted-foreground">
                        {d.totalApplicants}
                      </div>
                      <PlacementPill status={status} />
                    </div>
                  </div>
                );
              })}
              {recentDrives.length === 0 && (
                <div className="py-10 text-center text-muted-foreground text-sm">No drives found</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">PLACEMENT BY BRANCH</h2>
          </div>
          <div className="space-y-4 mt-4">
            {placementByBranch.map((r, idx) => {
              const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-purple-600', 'bg-orange-500', 'bg-teal-600', 'bg-rose-600'];
              const barColor = colors[idx % colors.length];
              return (
                <div key={r.branch} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-semibold text-muted-foreground truncate">{r.branch}</div>
                  <div className="flex-1">
                    <div className="h-2.5 bg-black/5 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor}`} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                  <div className="w-10 text-right text-sm font-semibold text-foreground">{r.pct}%</div>
                </div>
              );
            })}
            {placementByBranch.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">No branch data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}